BEGIN;

-- Preserve existing ratings proportionally while moving the rubric from 0-10
-- integers to 0-5 values with one decimal place.
DO $migration$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'application_reviews'
      AND column_name = 'motivation_score'
      AND data_type = 'smallint'
  ) THEN
    ALTER TABLE public.application_reviews
      DROP COLUMN total_score,
      DROP CONSTRAINT application_reviews_motivation_score_check,
      DROP CONSTRAINT application_reviews_learning_score_check,
      DROP CONSTRAINT application_reviews_creativity_score_check,
      DROP CONSTRAINT application_reviews_collaboration_score_check,
      DROP CONSTRAINT application_reviews_response_score_check;

    ALTER TABLE public.application_reviews
      ALTER COLUMN motivation_score TYPE NUMERIC(2,1) USING (motivation_score::NUMERIC / 2),
      ALTER COLUMN learning_score TYPE NUMERIC(2,1) USING (learning_score::NUMERIC / 2),
      ALTER COLUMN creativity_score TYPE NUMERIC(2,1) USING (creativity_score::NUMERIC / 2),
      ALTER COLUMN collaboration_score TYPE NUMERIC(2,1) USING (collaboration_score::NUMERIC / 2),
      ALTER COLUMN response_score TYPE NUMERIC(2,1) USING (response_score::NUMERIC / 2);

    ALTER TABLE public.application_reviews
      ADD CONSTRAINT application_reviews_motivation_score_check CHECK (motivation_score BETWEEN 0 AND 5),
      ADD CONSTRAINT application_reviews_learning_score_check CHECK (learning_score BETWEEN 0 AND 5),
      ADD CONSTRAINT application_reviews_creativity_score_check CHECK (creativity_score BETWEEN 0 AND 5),
      ADD CONSTRAINT application_reviews_collaboration_score_check CHECK (collaboration_score BETWEEN 0 AND 5),
      ADD CONSTRAINT application_reviews_response_score_check CHECK (response_score BETWEEN 0 AND 5),
      ADD COLUMN total_score NUMERIC(3,1) GENERATED ALWAYS AS (
        motivation_score + learning_score + creativity_score +
        collaboration_score + response_score
      ) STORED;
  END IF;
END
$migration$;

CREATE OR REPLACE FUNCTION public.save_application_review(
  p_application_id UUID,
  p_scores JSONB,
  p_internal_notes TEXT DEFAULT NULL
)
RETURNS public.application_reviews
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_application public.applications%ROWTYPE;
  v_cycle public.application_cycles%ROWTYPE;
  v_review public.application_reviews%ROWTYPE;
  v_motivation NUMERIC(2,1);
  v_learning NUMERIC(2,1);
  v_creativity NUMERIC(2,1);
  v_collaboration NUMERIC(2,1);
  v_response NUMERIC(2,1);
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_admin() THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'admin_required';
  END IF;

  IF COALESCE(p_scores->>'motivation', '') !~ '^([0-4](\.[0-9])?|5(\.0)?)$'
    OR COALESCE(p_scores->>'learning', '') !~ '^([0-4](\.[0-9])?|5(\.0)?)$'
    OR COALESCE(p_scores->>'creativity', '') !~ '^([0-4](\.[0-9])?|5(\.0)?)$'
    OR COALESCE(p_scores->>'collaboration', '') !~ '^([0-4](\.[0-9])?|5(\.0)?)$'
    OR COALESCE(p_scores->>'response', '') !~ '^([0-4](\.[0-9])?|5(\.0)?)$'
    OR char_length(COALESCE(p_internal_notes, '')) > 2000 THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'invalid_review';
  END IF;

  v_motivation := (p_scores->>'motivation')::NUMERIC(2,1);
  v_learning := (p_scores->>'learning')::NUMERIC(2,1);
  v_creativity := (p_scores->>'creativity')::NUMERIC(2,1);
  v_collaboration := (p_scores->>'collaboration')::NUMERIC(2,1);
  v_response := (p_scores->>'response')::NUMERIC(2,1);

  SELECT * INTO v_application
  FROM public.applications
  WHERE id = p_application_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'application_not_found';
  END IF;
  IF v_application.user_id = auth.uid() THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'cannot_review_own_application';
  END IF;

  SELECT * INTO v_cycle
  FROM public.application_cycles
  WHERE id = v_application.cycle_id;
  IF v_cycle.closed_at IS NULL AND NOW() < v_cycle.edits_close_at THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'applications_still_open';
  END IF;

  INSERT INTO public.application_reviews (
    application_id, reviewer_id, motivation_score, learning_score,
    creativity_score, collaboration_score, response_score, internal_notes
  ) VALUES (
    p_application_id, auth.uid(), v_motivation, v_learning,
    v_creativity, v_collaboration, v_response,
    NULLIF(btrim(p_internal_notes), '')
  )
  ON CONFLICT (application_id, reviewer_id) DO UPDATE SET
    motivation_score = EXCLUDED.motivation_score,
    learning_score = EXCLUDED.learning_score,
    creativity_score = EXCLUDED.creativity_score,
    collaboration_score = EXCLUDED.collaboration_score,
    response_score = EXCLUDED.response_score,
    internal_notes = EXCLUDED.internal_notes,
    updated_at = NOW()
  RETURNING * INTO v_review;

  RETURN v_review;
END;
$$;

REVOKE ALL ON FUNCTION public.save_application_review(UUID, JSONB, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.save_application_review(UUID, JSONB, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.save_application_review(UUID, JSONB, TEXT) TO authenticated;

COMMIT;
