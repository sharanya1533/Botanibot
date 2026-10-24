// Built-in species catalog: default watering interval in days and care notes.
const SPECIES = [
  { name: 'Money Plant', intervalDays: 7, light: 'low', note: 'Forgiving vine; tolerates missed waterings.' },
  { name: 'Snake Plant', intervalDays: 14, light: 'low', note: 'Drought-loving; overwatering is the only way to kill it.' },
  { name: 'Peace Lily', intervalDays: 5, light: 'medium', note: 'Dramatic — droops when thirsty, recovers in hours.' },
  { name: 'Basil', intervalDays: 2, light: 'bright', note: 'Keep soil moist; pinch flowers for more leaves.' },
  { name: 'Mint', intervalDays: 2, light: 'medium', note: 'Thirsty and invasive — give it its own pot.' },
  { name: 'Tomato', intervalDays: 2, light: 'bright', note: 'Deep, regular watering prevents fruit cracking.' },
  { name: 'Jade Plant', intervalDays: 10, light: 'bright', note: 'Succulent; let soil dry fully between waterings.' },
  { name: 'Areca Palm', intervalDays: 6, light: 'medium', note: 'Loves humidity; brown tips mean dry air.' },
  { name: 'Hibiscus', intervalDays: 3, light: 'bright', note: 'Heavy drinker in summer; hates soggy roots.' },
  { name: 'Tulsi (Holy Basil)', intervalDays: 2, light: 'bright', note: 'Water in the morning; needs direct sun.' },
  { name: 'Aloe Vera', intervalDays: 12, light: 'bright', note: 'Terracotta pots suit it best.' },
  { name: 'Custom', intervalDays: 7, light: 'medium', note: 'Set your own watering interval.' },
];

module.exports = SPECIES;
