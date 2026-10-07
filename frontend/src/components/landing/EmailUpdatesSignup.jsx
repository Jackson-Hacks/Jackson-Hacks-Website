import { useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EVENT } from '@/config/event';
import { supabase } from '@/lib/supabaseClient';
import {
  EMAIL_UPDATES_CONSENT_VERSION,
  getEmailSignupError,
  normalizeSignupEmail,
  validateEmailSignup,
} from '@/lib/emailUpdates';

export default function EmailUpdatesSignup() {
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const pending = useRef(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (pending.current) return;
    // Submitting the clearly labelled notification form is the opt-in action.
    const validationError = validateEmailSignup(email, true);
    if (validationError) {
      setFeedback({ error: true, message: validationError });
      return;
    }
    pending.current = true;
    setIsSaving(true);
    setFeedback(null);
    try {
      const { data, error } = await supabase.rpc('join_email_updates', {
        p_email: normalizeSignupEmail(email),
        p_consent: true,
        p_consent_version: EMAIL_UPDATES_CONSENT_VERSION,
        p_event_key: EVENT.key,
        p_website: website,
      });
      if (error) throw error;
      if (data?.accepted !== true) throw new Error('Signup was not acknowledged');
      setFeedback({ error: false, message: "You're on the list! We'll email you when applications open." });
      setEmail('');
    } catch (error) {
      setFeedback({ error: true, message: getEmailSignupError(error) });
    } finally {
      pending.current = false;
      setIsSaving(false);
    }
  };

  return (
    <section id="email-updates" aria-labelledby="email-updates-title" className="w-full max-w-xl rounded-2xl border border-[#F68A42]/35 bg-[#212121]/95 p-5 text-left shadow-xl shadow-black/15 sm:p-6">
      <h3 id="email-updates-title" className="font-title text-2xl text-[#F3F1F1]">Be first to know.</h3>
      <p className="mt-2 text-base text-[#B4BAC0]">Leave your email for the application-opening announcement.</p>
      <form onSubmit={handleSubmit} className="mt-4" noValidate>
        <label htmlFor="updates-email" className="block text-sm font-medium text-[#F3F1F1]">Email address</label>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <Input id="updates-email" type="email" autoComplete="email" inputMode="email" maxLength={254} value={email} onChange={(event) => { setEmail(event.target.value); setFeedback(null); }} placeholder="you@example.com" required disabled={isSaving} aria-describedby="signup-feedback" aria-invalid={feedback?.error || undefined} className="h-12 border-white/20 bg-white/5 text-base text-white placeholder:text-[#8A9199] md:text-base" />
          <Button type="submit" disabled={isSaving} className="h-12 shrink-0 rounded-lg bg-[#F68A42] px-6 text-base font-semibold text-[#212121] hover:bg-[#FFA368]">
            {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />Saving…</> : 'Notify me'}
          </Button>
        </div>
        <div hidden aria-hidden="true">
          <label htmlFor="updates-website">Leave this field empty</label>
          <input id="updates-website" value={website} onChange={(event) => setWebsite(event.target.value)} tabIndex={-1} autoComplete="off" />
        </div>
        <p id="signup-feedback" role={feedback?.error ? 'alert' : 'status'} aria-live="polite" className={`mt-3 text-sm ${feedback?.error ? 'text-red-300' : 'text-green-300'}`}>{feedback?.message}</p>
      </form>
    </section>
  );
}
