export const SERVICE_TYPES = [
  'Flight Booking',
  'UMNR Service',
  'Seat Assign',
  'Seat Upgrade',
  'Add Baggage',
  'Add Seat and Baggage',
  'Add Insurance',
  'Pet Service',
  'Minor Alone Booking',
  'Checking Service',
  'Name Correction',
  'Change Itinerary',
  'Cancellation for Refund',
  'Cancellation for Credit',
];

export const DEFAULT_SERVICE = 'Flight Booking';

export const normalizeService = (value) => {
  const text = String(value || '').trim();
  if (!text) return DEFAULT_SERVICE;
  const hit = SERVICE_TYPES.find((s) => s.toLowerCase() === text.toLowerCase());
  return hit || text;
};
