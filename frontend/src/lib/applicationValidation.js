export const APPLICATION_LIMITS = Object.freeze({
  full_name: 120,
  email: 320,
  phone: 40,
  gender_self_description: 120,
  pronouns: 80,
  school: 160,
  grade: 32,
  dietary_restrictions: 500,
  why_attend: 2000,
  heard_from: 120,
  emergency_contact_name: 120,
  emergency_contact_phone: 40,
});

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** @returns {Record<string, string>} */
export function validateApplicationStep(formData, step) {
  const errors = /** @type {Record<string, string>} */ ({});
  const value = (field) => String(formData[field] ?? '').trim();

  if (step === 1) {
    if (!value('full_name')) errors.full_name = 'Name is required';
    else if (value('full_name').length > APPLICATION_LIMITS.full_name) errors.full_name = 'Name is too long';
    if (!value('email')) errors.email = 'Email is required';
    else if (!EMAIL_PATTERN.test(value('email'))) errors.email = 'Enter a valid email address';
    if (value('phone').length > APPLICATION_LIMITS.phone) errors.phone = 'Phone number is too long';
  }

  if (step === 2) {
    if (!value('school')) errors.school = 'School is required';
    else if (value('school').length > APPLICATION_LIMITS.school) errors.school = 'School name is too long';
    if (!value('grade')) errors.grade = 'Grade is required';
    else if (!['9', '10', '11', '12'].includes(value('grade'))) errors.grade = 'Applicants must be in Grade 9 to 12';
    if (!value('experience_level')) errors.experience_level = 'Experience level is required';
  }

  if (step === 3) {
    if (!value('why_attend')) errors.why_attend = 'Please tell us why you want to attend';
    else if (value('why_attend').length < 10) errors.why_attend = 'Please provide at least 10 characters';
    else if (value('why_attend').length > APPLICATION_LIMITS.why_attend) errors.why_attend = 'Answer is too long';
  }

  if (step === 4) {
    const age = Number(value('age'));
    if (!value('age')) errors.age = 'Age is required';
    else if (!Number.isInteger(age) || age < 5 || age > 120) errors.age = 'Enter a valid age';
    if (
      formData.gender_identity === 'self_describe'
      && !value('gender_self_description')
    ) {
      errors.gender_self_description = 'Please describe your gender identity';
    }
    if (value('gender_self_description').length > APPLICATION_LIMITS.gender_self_description) {
      errors.gender_self_description = 'Answer is too long';
    }
    if (value('pronouns').length > APPLICATION_LIMITS.pronouns) {
      errors.pronouns = 'Pronouns are too long';
    }
    const raceValues = Array.isArray(formData.race_ethnicity) ? formData.race_ethnicity : [];
    if (raceValues.includes('prefer_not_to_say') && raceValues.length > 1) {
      errors.race_ethnicity = '“Prefer not to answer” cannot be combined with other choices';
    }
  }

  if (step === 5) {
    const emergencyName = value('emergency_contact_name');
    const emergencyPhone = value('emergency_contact_phone');
    if (emergencyName && !emergencyPhone) errors.emergency_contact_phone = 'Add a phone number for this contact';
    if (emergencyPhone && !emergencyName) errors.emergency_contact_name = 'Add a name for this contact';
    if (value('dietary_restrictions').length > APPLICATION_LIMITS.dietary_restrictions) errors.dietary_restrictions = 'Answer is too long';
    if (!formData.agree_to_terms) errors.agree_to_terms = 'You must accept the Terms and Code of Conduct and acknowledge the Privacy Notice';
  }

  return errors;
}

export function normalizeApplicationData(formData) {
  return Object.fromEntries(Object.entries(formData).map(([key, value]) => [
    key,
    typeof value === 'string' ? value.trim() : value,
  ]));
}
