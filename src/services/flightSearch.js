// Flight search orchestrator for /new-booking.
// Tries every configured backend in order and always hands back an array of
// RAW offers; src/utils/searchResultMapper.js is what turns them into the
// normalized shape the UI renders.

import { isSabreConfigured, searchSabreOffers } from './sabre';
import { fetchBookings } from './supabase';
import { buildLocalOffers } from '../utils/flightCatalog';

// Attach the saved booking (if any) whose flight codes match this offer, so the
// expanded card can show real booking/passenger/costing data — and nothing when
// there is none. Never invents data.
const matchBooking = (offer, bookings) => {
  if (!Array.isArray(bookings) || !bookings.length) return offer;
  const codes = new Set();
  const add = (value) => { if (value) codes.add(String(value).trim().toUpperCase()); };
  Object.values(offer.legs || {}).forEach((leg) => {
    (leg?.segments || [leg]).forEach((segment) => {
      add(segment?.flightCode);
      add(segment?.id);
    });
  });
  if (!codes.size) return offer;

  const record = bookings.find((booking) => {
    const candidates = [
      booking?.outboundFlightCode,
      booking?.returnFlightCode,
      booking?.outboundFlight?.flightCode,
      booking?.inboundFlight?.flightCode,
      booking?.pnr,
    ];
    return candidates.some(value => value && codes.has(String(value).trim().toUpperCase()));
  });
  return record ? { ...offer, bookingRecord: record } : offer;
};

const attachOtherLeg = (offer, type, existingOutbound, existingInbound) => {
  if (offer.legs && Object.keys(offer.legs).length) return offer;
  const segments = Array.isArray(offer.segments) && offer.segments.length ? offer.segments : [offer];
  const legs = { [type]: { segments } };
  const otherLeg = type === 'outbound'
    ? (existingInbound ? { segments: [existingInbound] } : null)
    : (existingOutbound ? { segments: [existingOutbound] } : null);
  if (otherLeg) legs[type === 'outbound' ? 'return' : 'outbound'] = otherLeg;
  return { ...offer, legs };
};

/**
 * @returns {Promise<{ offers: object[], error: string|null }>}
 */
export const searchFlightOffers = async ({
  flightCode,
  type,
  form,
  tripType,
  existingOutbound,
  existingInbound,
}) => {
  const from = (type === 'outbound' ? form.fromAirport : form.toAirport) || '';
  const to = (type === 'outbound' ? form.toAirport : form.fromAirport) || '';

  let offers = null;

  // 1) Sabre (test) — returns every offer in the shop response.
  if (isSabreConfigured()) {
    try {
      offers = await searchSabreOffers({
        from,
        to,
        tripType: type === 'outbound' ? tripType : 'One Way',
        flightCode,
      });
    } catch (sabreErr) {
      // Test keys often fail auth/CORS/BFM entitlement — fall back so Preview still works.
      console.warn('Sabre search failed, using fallback:', sabreErr.message);
    }
  }

  // 2) PNR proxy (only when Sabre is not configured or returned nothing).
  if (!offers) {
    const apiBaseUrl = import.meta.env.VITE_PNR_API_URL;
    if (apiBaseUrl) {
      try {
        const response = await fetch(`${apiBaseUrl}/pnr/lookup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ flightCode }),
        });
        if (response.status === 404) {
          return { offers: [], error: `No flight found for code "${flightCode}". Please check and try again.` };
        }
        if (!response.ok) throw new Error(`Flight lookup failed (${response.status}).`);
        const json = await response.json();
        offers = Array.isArray(json) ? json : [json];
      } catch (proxyErr) {
        console.warn('PNR lookup failed, using local fallback:', proxyErr.message);
      }
    }
  }

  // 3) Local catalog — always available so the workflow never dead-ends.
  if (!offers) {
    offers = buildLocalOffers({ flightCode, type, form, existingOutbound, existingInbound });
  }

  let bookings = null;
  try {
    bookings = await fetchBookings();
  } catch {
    bookings = null;
  }

  const enriched = offers
    .map(offer => attachOtherLeg(offer, type, existingOutbound, existingInbound))
    .map(offer => matchBooking(offer, bookings));

  return { offers: enriched, error: null };
};
