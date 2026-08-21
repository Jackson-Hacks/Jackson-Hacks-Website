export const GENDER_OPTIONS = Object.freeze([
  { value: 'woman', label: 'Woman' },
  { value: 'man', label: 'Man' },
  { value: 'non_binary', label: 'Non-binary / gender diverse' },
  { value: 'self_describe', label: 'Prefer to self-describe' },
  { value: 'prefer_not_to_say', label: 'Prefer not to answer' },
]);

export const RACE_ETHNICITY_OPTIONS = Object.freeze([
  { value: 'black', label: 'Black' },
  { value: 'east_asian', label: 'East Asian' },
  { value: 'south_asian', label: 'South Asian' },
  { value: 'southeast_asian', label: 'Southeast Asian' },
  { value: 'middle_eastern_north_african', label: 'Middle Eastern / North African' },
  { value: 'indigenous', label: 'Indigenous' },
  { value: 'latin_american', label: 'Latin American' },
  { value: 'white', label: 'White' },
  { value: 'another_identity', label: 'Another identity' },
  { value: 'prefer_not_to_say', label: 'Prefer not to answer' },
]);

function optionLabel(options, value) {
  return options.find((option) => option.value === value)?.label || value || '—';
}

export const formatGenderIdentity = (value, selfDescription) =>
  value === 'self_describe' && selfDescription
    ? selfDescription
    : optionLabel(GENDER_OPTIONS, value);

export const formatRaceEthnicity = (values) =>
  Array.isArray(values) && values.length
    ? values.map((value) => optionLabel(RACE_ETHNICITY_OPTIONS, value)).join(', ')
    : '—';
