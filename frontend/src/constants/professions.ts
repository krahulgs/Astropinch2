// Vedic planet-based profession categories used across AstroPinch
// Each category is stored as the profession value directly

export const PROFESSION_OPTIONS = [
  { group: '☀️ Sun — Authority & Power',     value: 'Government / Defence / Politics' },
  { group: '☿ Mercury — Intellect & Commerce', value: 'Business / Trade / Sales' },
  { group: '☿ Mercury — Intellect & Commerce', value: 'IT / Technology / Engineering' },
  { group: '♂ Mars — Action & Surgery',       value: 'Medicine / Surgery / Healthcare' },
  { group: '♂ Mars — Action & Surgery',       value: 'Real Estate / Construction' },
  { group: '♃ Jupiter — Wisdom & Law',        value: 'Finance / Banking / Investments' },
  { group: '♃ Jupiter — Wisdom & Law',        value: 'Law / Judiciary' },
  { group: '♃ Jupiter — Wisdom & Law',        value: 'Education / Research / Writing' },
  { group: '♀ Venus — Art & Beauty',          value: 'Art / Music / Entertainment' },
  { group: '☽ Moon — Nurturing & Nature',     value: 'Agriculture / Nature / Environment' },
  { group: '☽ Moon — Nurturing & Nature',     value: 'Homemaker' },
  { group: '♄ Saturn — Labour & Structure',   value: 'Transportation / Logistics' },
  { group: '☊ Ketu — Spirituality & Mysticism', value: 'Spirituality / Astrology / Religion' },
  { group: 'Other',                            value: 'Student' },
  { group: 'Other',                            value: 'Other' },
];

// Grouped version for <optgroup> rendering
export const PROFESSION_CATEGORIES: Record<string, string[]> = PROFESSION_OPTIONS.reduce(
  (acc, { group, value }) => {
    if (!acc[group]) acc[group] = [];
    acc[group].push(value);
    return acc;
  },
  {} as Record<string, string[]>
);

export const ALL_PROFESSIONS = PROFESSION_OPTIONS.map(p => p.value);
