import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  User, Mail, Phone, School, Users,
  MessageSquare, AlertCircle,
  ArrowLeft, ArrowRight, Check, Loader2, Save
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import {
  CURRENT_EVENT_KEY,
  getApplicationRpcErrorMessage,
} from '@/lib/applicationWindow';
import {
  APPLICATION_LIMITS,
  normalizeApplicationData,
  STANDARD_GRADE_LEVELS,
  validateApplicationStep,
} from '@/lib/applicationValidation';
import {
  GENDER_OPTIONS,
  RACE_ETHNICITY_OPTIONS,
} from '@/lib/applicationDemographics';

const steps = [
  { id: 1, title: 'Personal Info', icon: User },
  { id: 2, title: 'School & Experience', icon: School },
  { id: 3, title: 'Written Response', icon: MessageSquare },
  { id: 4, title: 'Demographics', icon: Users },
  { id: 5, title: 'Final Details', icon: Check },
];

const getInitialStep = (application, draft) => {
  if (application) return 1;
  const savedStep = Number(draft?.current_step);
  return Number.isInteger(savedStep) && savedStep >= 1 && savedStep <= steps.length
    ? savedStep
    : 1;
};

const buildInitialFormData = (user, application = null, draft = null) => {
  const savedData = application || draft?.draft_data || null;
  const savedGrade = savedData?.grade || '';
  const hasCustomGrade = Boolean(savedGrade) && !STANDARD_GRADE_LEVELS.includes(savedGrade);

  return {
    full_name: savedData?.full_name || user?.full_name || user?.user_metadata?.full_name || '',
    email: savedData?.email || user?.email || '',
    phone: savedData?.phone || '',
    age: savedData?.age ? String(savedData.age) : '',
    gender_identity: savedData?.gender_identity || '',
    gender_self_description: savedData?.gender_self_description || '',
    pronouns: savedData?.pronouns || '',
    race_ethnicity: Array.isArray(savedData?.race_ethnicity) ? savedData.race_ethnicity : [],
    school: savedData?.school || '',
    grade: hasCustomGrade ? 'other' : savedGrade,
    grade_other: savedData?.grade_other || (hasCustomGrade ? savedGrade : ''),
    experience_level: savedData?.experience_level || '',
    dietary_restrictions: savedData?.dietary_restrictions || '',
    tshirt_size: savedData?.tshirt_size || '',
    why_attend: savedData?.why_attend || '',
    heard_from: savedData?.heard_from || '',
    emergency_contact_name: savedData?.emergency_contact_name || '',
    emergency_contact_phone: savedData?.emergency_contact_phone || '',
    agree_to_terms: savedData?.agree_to_terms ?? false,
  };
};

export default function ApplicationForm({
  user,
  onSuccess,
  existingApplication = null,
  initialDraft = null,
  readOnly = false,
  onDone,
  onSaveDraft,
  onWindowClosed,
}) {
  const [currentStep, setCurrentStep] = useState(() => getInitialStep(existingApplication, initialDraft));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [errors, setErrors] = useState(/** @type {Record<string, string | null>} */ ({}));

  const [formData, setFormData] = useState(() =>
    buildInitialFormData(user, existingApplication, initialDraft),
  );
  const initializedSourceKey = useRef(null);
  const previousStep = useRef(currentStep);
  const stepContentRef = useRef(null);
  const stepTransitionLocked = useRef(false);
  const [isChangingStep, setIsChangingStep] = useState(false);
  const sourceKey = existingApplication
    ? `application:${existingApplication.id}:${existingApplication.updated_at || existingApplication.revision_number || ''}`
    : initialDraft
      ? `draft:${initialDraft.id}:${initialDraft.updated_at || ''}`
      : `new:${user?.id || user?.email || ''}`;

  useEffect(() => {
    if (initializedSourceKey.current === sourceKey) return;
    initializedSourceKey.current = sourceKey;
    setFormData(buildInitialFormData(user, existingApplication, initialDraft));
    setCurrentStep(getInitialStep(existingApplication, initialDraft));
    setErrors({});
  }, [existingApplication, initialDraft, sourceKey, user]);

  useEffect(() => {
    if (previousStep.current === currentStep) return undefined;
    previousStep.current = currentStep;
    const frame = window.requestAnimationFrame(() => {
      const stepContent = stepContentRef.current;
      if (!stepContent) return;
      stepContent.focus({ preventScroll: true });
      stepContent.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start',
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [currentStep]);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const updateGrade = (value) => {
    setFormData(prev => ({
      ...prev,
      grade: value,
      grade_other: value === 'other' ? prev.grade_other : '',
    }));
    setErrors(prev => ({ ...prev, grade: null, grade_other: null }));
  };

  const toggleRaceEthnicity = (value, checked) => {
    const current = Array.isArray(formData.race_ethnicity) ? formData.race_ethnicity : [];
    if (!checked) {
      updateField('race_ethnicity', current.filter((item) => item !== value));
      return;
    }
    updateField(
      'race_ethnicity',
      value === 'prefer_not_to_say'
        ? [value]
        : [...current.filter((item) => item !== 'prefer_not_to_say' && item !== value), value],
    );
  };

  const validateStep = (step) => {
    const newErrors = validateApplicationStep(formData, step);
    setErrors(newErrors);
    const firstInvalidField = Object.keys(newErrors)[0];
    if (firstInvalidField) {
      window.requestAnimationFrame(() => document.getElementById(firstInvalidField)?.focus());
    }
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (stepTransitionLocked.current) return;
    if (readOnly || validateStep(currentStep)) {
      stepTransitionLocked.current = true;
      setIsChangingStep(true);
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    if (stepTransitionLocked.current || currentStep === 1) return;
    stepTransitionLocked.current = true;
    setIsChangingStep(true);
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const finishStepTransition = () => {
    stepTransitionLocked.current = false;
    setIsChangingStep(false);
  };

  const handleSubmit = async (event) => {
    event?.preventDefault();
    if (readOnly) return;
    if (!validateStep(5)) return;
    
    setIsSubmitting(true);
    
    const applicationData = normalizeApplicationData(formData);
    
    try {
      const { data, error } = await supabase.rpc('save_application', {
        p_application: applicationData,
        p_application_id: existingApplication?.id || null,
        p_event_key: CURRENT_EVENT_KEY,
      });

      if (error) throw error;

      const savedApplication = Array.isArray(data) ? data[0] : data;
      onSuccess(savedApplication);
    } catch (error) {
      console.error('Failed to submit application:', error);
      const message = getApplicationRpcErrorMessage(error);
      setErrors({ submit: message });
      if (`${error?.message || ''}`.toLowerCase().includes('applications_closed')) {
        onWindowClosed?.();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!onSaveDraft || readOnly || existingApplication) return;
    setIsSavingDraft(true);
    setErrors((current) => ({ ...current, submit: null }));
    try {
      await onSaveDraft(formData, currentStep);
    } catch (error) {
      console.error('Failed to save application draft:', error);
      setErrors({ submit: getApplicationRpcErrorMessage(error) });
      if (`${error?.message || ''}`.toLowerCase().includes('applications_closed')) {
        onWindowClosed?.();
      }
    } finally {
      setIsSavingDraft(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="application-step-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <Label htmlFor="full_name" className="text-white mb-2 block">
                Full Name <span className="text-red-400">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <Input
                  id="full_name"
                  disabled={readOnly}
                  maxLength={APPLICATION_LIMITS.full_name}
                  aria-invalid={Boolean(errors.full_name)}
                  aria-describedby={errors.full_name ? 'full_name-error' : undefined}
                  value={formData.full_name}
                  onChange={(e) => updateField('full_name', e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#2072C7]"
                  placeholder="Your full name"
                />
              </div>
              {errors.full_name && <p id="full_name-error" className="text-red-400 text-sm mt-1">{errors.full_name}</p>}
            </div>

            <div>
              <Label htmlFor="email" className="text-white mb-2 block">
                Email <span className="text-red-400">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <Input
                  id="email"
                  type="email"
                  disabled={readOnly}
                  maxLength={APPLICATION_LIMITS.email}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#2072C7]"
                  placeholder="your@email.com"
                />
              </div>
              {errors.email && <p id="email-error" className="text-red-400 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="phone" className="text-white mb-2 block">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <Input
                  id="phone"
                  type="tel"
                  maxLength={APPLICATION_LIMITS.phone}
                  disabled={readOnly}
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#2072C7]"
                  placeholder="(123) 456-7890"
                />
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="application-step-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <Label htmlFor="school" className="text-white mb-2 block">
                School / Institution <span className="text-red-400">*</span>
              </Label>
              <div className="relative">
                <School className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <Input
                  id="school"
                  maxLength={APPLICATION_LIMITS.school}
                  aria-invalid={Boolean(errors.school)}
                  aria-describedby={errors.school ? 'school-error' : undefined}
                  disabled={readOnly}
                  value={formData.school}
                  onChange={(e) => updateField('school', e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#2072C7]"
                  placeholder="Your school name"
                />
              </div>
              {errors.school && <p id="school-error" className="text-red-400 text-sm mt-1">{errors.school}</p>}
            </div>

            <div>
              <Label htmlFor="grade" className="text-white mb-2 block">
                Grade Level <span className="text-red-400">*</span>
              </Label>
              <Select disabled={readOnly} value={formData.grade} onValueChange={updateGrade}>
                <SelectTrigger id="grade" aria-invalid={Boolean(errors.grade)} aria-describedby={errors.grade ? 'grade-error' : undefined} className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select your grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="9">Grade 9</SelectItem>
                  <SelectItem value="10">Grade 10</SelectItem>
                  <SelectItem value="11">Grade 11</SelectItem>
                  <SelectItem value="12">Grade 12</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.grade && <p id="grade-error" className="text-red-400 text-sm mt-1">{errors.grade}</p>}
              {formData.grade === 'other' && (
                <div className="mt-4">
                  <Label htmlFor="grade_other" className="text-white mb-2 block">
                    Enter your grade level <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="grade_other"
                    disabled={readOnly}
                    maxLength={APPLICATION_LIMITS.grade}
                    aria-invalid={Boolean(errors.grade_other)}
                    aria-describedby={errors.grade_other ? 'grade-other-error' : undefined}
                    value={formData.grade_other}
                    onChange={(event) => updateField('grade_other', event.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#2072C7]"
                    placeholder="Enter your grade or year"
                  />
                  {errors.grade_other && (
                    <p id="grade-other-error" className="text-red-400 text-sm mt-1">{errors.grade_other}</p>
                  )}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="experience_level" className="text-white mb-2 block">
                Coding Experience <span className="text-red-400">*</span>
              </Label>
              <Select disabled={readOnly} value={formData.experience_level} onValueChange={(value) => updateField('experience_level', value)}>
                <SelectTrigger id="experience_level" aria-invalid={Boolean(errors.experience_level)} aria-describedby={errors.experience_level ? 'experience_level-error' : undefined} className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select your experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner - Just starting out</SelectItem>
                  <SelectItem value="intermediate">Intermediate - Built some projects</SelectItem>
                  <SelectItem value="advanced">Advanced - Experienced developer</SelectItem>
                </SelectContent>
              </Select>
              {errors.experience_level && <p id="experience_level-error" className="text-red-400 text-sm mt-1">{errors.experience_level}</p>}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="application-step-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <Label htmlFor="why_attend" className="text-white mb-2 block">
                Tell us why you want to attend Jackson Hacks, what you hope to
                learn or build, and how you would contribute to the community.{' '}
                <span className="text-red-400">*</span>
              </Label>
              <Textarea
                id="why_attend"
                maxLength={APPLICATION_LIMITS.why_attend}
                aria-invalid={Boolean(errors.why_attend)}
                aria-describedby={errors.why_attend ? 'why_attend-error' : undefined}
                disabled={readOnly}
                value={formData.why_attend}
                onChange={(e) => updateField('why_attend', e.target.value)}
                className="min-h-[220px] bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#2072C7]"
                placeholder="Share one thoughtful response covering your motivation, goals, and what you would bring to the event..."
              />
              {errors.why_attend && <p id="why_attend-error" className="text-red-400 text-sm mt-1">{errors.why_attend}</p>}
            </div>

            <div>
              <Label htmlFor="heard_from" className="text-white mb-2 block">
                How did you hear about us?
              </Label>
              <Select disabled={readOnly} value={formData.heard_from} onValueChange={(value) => updateField('heard_from', value)}>
                <SelectTrigger id="heard_from" className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="social_media">Social Media</SelectItem>
                  <SelectItem value="friend">Friend / Word of Mouth</SelectItem>
                  <SelectItem value="school">School Announcement</SelectItem>
                  <SelectItem value="mlh">MLH</SelectItem>
                  <SelectItem value="search">Google Search</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="application-step-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="rounded-xl border border-[#2072C7]/30 bg-[#084F9A]/20 p-4">
              <h3 className="font-semibold text-white">Demographic survey</h3>
              <p className="mt-1 text-sm text-[#B4BAC0]">
                Age is required for eligibility. The other answers are optional and help us
                understand who we are reaching. Optional demographic answers are not used for
                admission scoring and are not shown to reviewers.
              </p>
              <Link to="/privacy" target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-[#9CC4EA] underline hover:text-white">
                Read the Privacy Notice
              </Link>
            </div>

            <div>
              <Label htmlFor="age" className="text-white mb-2 block">
                Age <span className="text-red-400">*</span>
              </Label>
              <Input
                id="age"
                type="number"
                min="5"
                max="120"
                aria-invalid={Boolean(errors.age)}
                aria-describedby={errors.age ? 'age-error' : undefined}
                disabled={readOnly}
                value={formData.age}
                onChange={(e) => updateField('age', e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#2072C7]"
                placeholder="17"
              />
              {errors.age && <p id="age-error" className="text-red-400 text-sm mt-1">{errors.age}</p>}
            </div>

            <div>
              <Label htmlFor="gender_identity" className="text-white mb-2 block">Gender identity</Label>
              <Select
                disabled={readOnly}
                value={formData.gender_identity}
                onValueChange={(value) => updateField('gender_identity', value)}
              >
                <SelectTrigger id="gender_identity" className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select an option (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {GENDER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.gender_identity === 'self_describe' && (
              <div>
                <Label htmlFor="gender_self_description" className="text-white mb-2 block">
                  How do you describe your gender identity? <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="gender_self_description"
                  disabled={readOnly}
                  maxLength={APPLICATION_LIMITS.gender_self_description}
                  aria-invalid={Boolean(errors.gender_self_description)}
                  aria-describedby={errors.gender_self_description ? 'gender_self_description-error' : undefined}
                  value={formData.gender_self_description}
                  onChange={(event) => updateField('gender_self_description', event.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
                {errors.gender_self_description && (
                  <p id="gender_self_description-error" className="mt-1 text-sm text-red-400">
                    {errors.gender_self_description}
                  </p>
                )}
              </div>
            )}

            <div>
              <Label htmlFor="pronouns" className="text-white mb-2 block">Pronouns</Label>
              <Input
                id="pronouns"
                disabled={readOnly}
                maxLength={APPLICATION_LIMITS.pronouns}
                aria-invalid={Boolean(errors.pronouns)}
                aria-describedby={errors.pronouns ? 'pronouns-error' : undefined}
                value={formData.pronouns}
                onChange={(event) => updateField('pronouns', event.target.value)}
                className="bg-white/5 border-white/10 text-white"
                placeholder="e.g. she/her, he/him, they/them"
              />
              {errors.pronouns && <p id="pronouns-error" className="mt-1 text-sm text-red-400">{errors.pronouns}</p>}
            </div>

            <fieldset aria-describedby={errors.race_ethnicity ? 'race_ethnicity-error' : undefined}>
              <legend className="mb-2 text-white">Race / ethnicity <span className="text-sm text-gray-400">(select all that apply)</span></legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {RACE_ETHNICITY_OPTIONS.map((option) => {
                  const checked = formData.race_ethnicity.includes(option.value);
                  return (
                    <Label
                      key={option.value}
                      htmlFor={`race-${option.value}`}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-gray-200"
                    >
                      <Checkbox
                        id={`race-${option.value}`}
                        disabled={readOnly}
                        checked={checked}
                        onCheckedChange={(nextChecked) => toggleRaceEthnicity(option.value, nextChecked === true)}
                      />
                      {option.label}
                    </Label>
                  );
                })}
              </div>
              {errors.race_ethnicity && (
                <p id="race_ethnicity-error" className="mt-2 text-sm text-red-400">{errors.race_ethnicity}</p>
              )}
            </fieldset>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            key="application-step-5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="tshirt_size" className="text-white mb-2 block">T-Shirt Size</Label>
                <Select disabled={readOnly} value={formData.tshirt_size} onValueChange={(value) => updateField('tshirt_size', value)}>
                  <SelectTrigger id="tshirt_size" className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="XS">XS</SelectItem>
                    <SelectItem value="S">S</SelectItem>
                    <SelectItem value="M">M</SelectItem>
                    <SelectItem value="L">L</SelectItem>
                    <SelectItem value="XL">XL</SelectItem>
                    <SelectItem value="XXL">XXL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dietary_restrictions" className="text-white mb-2 block">Dietary Restrictions</Label>
                <Input
                  id="dietary_restrictions"
                  maxLength={APPLICATION_LIMITS.dietary_restrictions}
                  disabled={readOnly}
                  value={formData.dietary_restrictions}
                  onChange={(e) => updateField('dietary_restrictions', e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#2072C7]"
                  placeholder="None, Vegetarian, etc."
                />
              </div>
            </div>

            <div>
              <fieldset>
                <legend className="mb-2 block text-white">Emergency Contact <span className="text-sm text-gray-400">(optional; complete both fields)</span></legend>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                <Label htmlFor="emergency_contact_name" className="sr-only">Emergency contact name</Label>
                <Input
                  id="emergency_contact_name"
                  maxLength={APPLICATION_LIMITS.emergency_contact_name}
                  disabled={readOnly}
                  aria-invalid={Boolean(errors.emergency_contact_name)}
                  aria-describedby={errors.emergency_contact_name ? 'emergency_contact_name-error' : undefined}
                  value={formData.emergency_contact_name}
                  onChange={(e) => updateField('emergency_contact_name', e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#2072C7]"
                  placeholder="Contact name"
                />
                {errors.emergency_contact_name && <p id="emergency_contact_name-error" className="mt-1 text-sm text-red-400">{errors.emergency_contact_name}</p>}
                </div>
                <div>
                <Label htmlFor="emergency_contact_phone" className="sr-only">Emergency contact phone</Label>
                <Input
                  id="emergency_contact_phone"
                  type="tel"
                  maxLength={APPLICATION_LIMITS.emergency_contact_phone}
                  disabled={readOnly}
                  aria-invalid={Boolean(errors.emergency_contact_phone)}
                  aria-describedby={errors.emergency_contact_phone ? 'emergency_contact_phone-error' : undefined}
                  value={formData.emergency_contact_phone}
                  onChange={(e) => updateField('emergency_contact_phone', e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#2072C7]"
                  placeholder="Contact phone"
                />
                {errors.emergency_contact_phone && <p id="emergency_contact_phone-error" className="mt-1 text-sm text-red-400">{errors.emergency_contact_phone}</p>}
                </div>
              </div>
              </fieldset>
            </div>

            <div className="p-4 rounded-xl bg-[#084F9A]/20 border border-[#2072C7]/30">
              <div className="flex items-start gap-3">
                  <Checkbox
                    id="agree_to_terms"
                    aria-invalid={Boolean(errors.agree_to_terms)}
                    aria-describedby={errors.agree_to_terms ? 'agree_to_terms-error' : undefined}
                    disabled={readOnly}
                  checked={formData.agree_to_terms}
                  onCheckedChange={(checked) => updateField('agree_to_terms', checked)}
                  className="mt-1 border-[#2072C7] data-[state=checked]:bg-[#084F9A]"
                />
                <div className="text-sm leading-relaxed text-gray-300">
                  <Label htmlFor="agree_to_terms" className="cursor-pointer text-sm leading-relaxed text-gray-300">
                    I confirm that my information is accurate, agree to the Terms and Code of Conduct,
                    and acknowledge the Privacy Notice.<span className="text-red-400"> *</span>
                  </Label>
                  <p className="mt-2 text-xs text-[#9CA3AF]">
                    Review the{' '}
                    <Link to="/terms" target="_blank" rel="noreferrer" className="text-[#9CC4EA] underline hover:text-white">Terms</Link>,{' '}
                    <Link to="/code-of-conduct" target="_blank" rel="noreferrer" className="text-[#9CC4EA] underline hover:text-white">Code of Conduct</Link>, and{' '}
                    <Link to="/privacy" target="_blank" rel="noreferrer" className="text-[#9CC4EA] underline hover:text-white">Privacy Notice</Link>.
                    Accepted participants must complete a separate waiver before attending.
                  </p>
                </div>
              </div>
              {errors.agree_to_terms && (
                <p id="agree_to_terms-error" className="text-red-400 text-sm mt-2 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.agree_to_terms}
                </p>
              )}
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {readOnly && (
        <div className="mb-8 rounded-xl border border-[#2072C7]/30 bg-[#084F9A]/20 p-4 text-sm text-[#9CC4EA]">
          This is the final submitted version. Applications are closed, so these answers are read-only.
        </div>
      )}
      {/* Progress steps */}
      <div className="flex items-center justify-between mb-10">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  currentStep >= step.id
                    ? 'bg-[#2072C7] text-white'
                    : 'bg-white/5 text-gray-500'
                }`}
              >
                {currentStep > step.id ? (
                  <Check size={20} />
                ) : (
                  <step.icon size={20} />
                )}
              </div>
              <span className={`text-xs mt-2 hidden sm:block ${
                currentStep >= step.id ? 'text-white' : 'text-gray-500'
              }`}>
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 ${
                currentStep > step.id ? 'bg-[#2072C7]' : 'bg-white/10'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <p className="sr-only" aria-live="polite">
        Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}
      </p>

      {/* Form content */}
      <div ref={stepContentRef} tabIndex={-1} className="scroll-mt-6 outline-none">
        <AnimatePresence mode="wait" onExitComplete={finishStepTransition}>
          {renderStepContent()}
        </AnimatePresence>
      </div>

      {/* Submit error message */}
      {errors.submit && (
        <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle size={16} />
          {errors.submit}
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex flex-col gap-3 mt-10 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1 || isChangingStep}
          className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white disabled:opacity-30"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back
        </Button>

        <div className="flex flex-col gap-3 sm:flex-row">
          {onSaveDraft && !readOnly && !existingApplication && (
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isSavingDraft || isSubmitting || isChangingStep}
              className="border-[#2072C7]/60 bg-[#084F9A]/20 text-[#9CC4EA] hover:bg-[#084F9A]/40 hover:text-white"
            >
              {isSavingDraft ? (
                <Loader2 size={18} className="mr-2 animate-spin" />
              ) : (
                <Save size={18} className="mr-2" />
              )}
              {isSavingDraft ? 'Saving Draft...' : 'Save Draft'}
            </Button>
          )}

          {currentStep < steps.length ? (
            <Button
              type="button"
              onClick={nextStep}
              disabled={isSavingDraft || isChangingStep}
              className="bg-[#F68A42] hover:bg-[#E06E0A] text-white"
            >
              Next
              <ArrowRight size={18} className="ml-2" />
            </Button>
          ) : readOnly ? (
            <Button
              type="button"
              onClick={onDone}
              className="bg-[#2072C7] hover:bg-[#084F9A] text-white"
            >
              <Check size={18} className="mr-2" />
              Done
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isSubmitting || isSavingDraft || isChangingStep}
              className="bg-[#F68A42] hover:bg-[#E06E0A] text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" />
                  {existingApplication ? 'Saving...' : 'Submitting...'}
                </>
              ) : (
                <>
                  <Check size={18} className="mr-2" />
                  {existingApplication ? 'Save Changes' : 'Submit Application'}
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
