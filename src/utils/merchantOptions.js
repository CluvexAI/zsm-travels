export const MERCHANT_OPTIONS = ['DIGIMAT', 'STRIPE', 'SQUARE UP'];

export const LEGACY_MERCHANT_MAP = {
  'DM TRAVEL': 'DIGIMAT',
  'ZSM TRAVEL USA': 'DIGIMAT',
  SQUAREUP: 'SQUARE UP',
  SQUARE: 'SQUARE UP',
  'ZSM Travel': 'DIGIMAT',
  'Global Travels': 'DIGIMAT',
  'Aero Tickets': 'DIGIMAT',
};

export const normalizeMerchant = (value) => {
  const text = String(value || '').trim();
  if (!text) return MERCHANT_OPTIONS[0];
  const hit = MERCHANT_OPTIONS.find((m) => m.toLowerCase() === text.toLowerCase());
  if (hit) return hit;
  return LEGACY_MERCHANT_MAP[text] || MERCHANT_OPTIONS[0];
};
