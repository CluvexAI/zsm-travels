// ─── Search result mapping layer ────────────────────────────────────────────
// Every backend (Sabre, the PNR proxy, local catalog, future GDS vendors) is
// normalized here before any UI sees it. Components only ever read the shape
// documented below, so swapping the API never touches the presentation layer.
//
// Normalized combination:
// {
//   id, referenceNumber, badge, source,
//   status:  { booking, payment, ticketing, flight },
//   airlines:[{ name, code, logo, pnr }],
//   outbound:{ segments: [...], duration, stops, connections },
//   inbound: { segments: [...], duration, stops, connections } | null,
//   fare:    { currency, baseFare, tax, subtotal, total, actualCost, actualMco, rules },
//   booking: { createdBy, bookingDate, referenceNo, shift, paymentType,
//              descriptor, gateway, vendor, source } | null,
//   passengers: [{ type, name, gender, dob, eTicket, seat, carryOn, checkIn, insurance }] | null,
//   costingHistory: [{ particular, cost, serviceCost }] | null,
//   address: { line, city, zip, state, country } | null,
//   seatAvailability: array | object | null,
//   legs: { outbound, return }   // raw legs kept for the selection hand-off
// }

import { AIRLINE_NAMES, airportName, legDuration, legStops, legPrice } from './flightCatalog';

const hasValue = (value) =>
  value !== undefined && value !== null && String(value).trim() !== '';

const money = (value) => (typeof value === 'number' && Number.isFinite(value) ? value : null);

const normalizeSegment = (flight) => {
  const departureCode = flight.route || flight.departureAirport || flight.origin || '';
  const arrivalCode = flight.dest || flight.arrivalAirport || flight.destination || '';
  return {
    id: flight.id || flight.flightCode || `${departureCode}-${arrivalCode}`,
    flightNumber: flight.flightCode
      || [flight.airlineCode, flight.flightNumber].filter(Boolean).join(''),
    airline: flight.airline || AIRLINE_NAMES[flight.airlineCode] || flight.airlineCode || '',
    airlineCode: flight.airlineCode || '',
    logo: flight.color || null,
    departure: {
      airport: departureCode,
      airportName: airportName(departureCode),
      date: flight.date || '',
      time: flight.time || '',
    },
    arrival: {
      airport: arrivalCode,
      airportName: airportName(arrivalCode),
      date: flight.arrivalDate || flight.date || '',
      time: flight.arrTime || '',
    },
    duration: flight.duration || '',
    stops: flight.stops || '',
    cabin: flight.fareClass || flight.cabinClass || '',
    baggage: flight.baggage || '',
    status: flight.flyingStatus || 'Active',
    price: money(flight.price),
  };
};

// Raw leg (single flight | { segments, connections }) → normalized leg.
const normalizeLeg = (leg) => {
  if (!leg) return null;
  const rawSegments = leg.segments && leg.segments.length ? leg.segments : [leg];
  const segments = rawSegments.map(normalizeSegment);
  if (!segments[0].departure.airport && !segments[0].flightNumber) return null;
  return {
    segments,
    connections: leg.connections || [],
    duration: legDuration(leg),
    stops: legStops(leg),
    price: money(legPrice(leg)),
  };
};

const normalizeAirlines = (segments, bookingRecord, fallbackPnr) => {
  const seen = new Map();
  segments.forEach((seg) => {
    const code = seg.airlineCode || seg.airline;
    if (!code || seen.has(code)) return;
    seen.set(code, { name: seg.airline || AIRLINE_NAMES[code] || code, code, logo: seg.logo });
  });

  const rows = [];
  const pnrRows = (bookingRecord?.airlinePnrs || []).filter(r => hasValue(r.pnr) || hasValue(r.airline));
  pnrRows.slice(0, 3).forEach((row) => {
    const match = [...seen.values()].find(a => a.name === row.airline) || {};
    rows.push({ name: row.airline || match.name || '', code: match.code || '', logo: match.logo || null, pnr: row.pnr || '', status: row.status || null });
  });

  if (rows.length < 3) {
    seen.forEach((airline) => {
      if (rows.length >= 3) return;
      if (rows.some(r => r.code === airline.code && r.name === airline.name)) return;
      rows.push({ ...airline, pnr: rows.length === 0 ? (fallbackPnr || '') : '', status: null });
    });
  }
  return rows.filter(r => hasValue(r.name) || hasValue(r.pnr));
};

const normalizeBooking = (record) => {
  if (!record) return null;
  const payment = record.payment || {};
  const values = {
    createdBy: record.agent || record.saleBy || record.createdBy || '',
    bookingDate: record.createdAt || record.date || '',
    referenceNo: record.refNo || record.id || '',
    shift: record.shift || '',
    paymentType: payment.paymentType || payment.method || record.paymentBy || '',
    descriptor: record.descriptor || '',
    gateway: record.gateway || '',
    vendor: record.vendorCode || record.vendor || '',
    source: record.bookingSource || record.source || '',
  };
  return Object.values(values).some(hasValue) ? values : null;
};

const normalizeFare = (record, offerFare) => {
  const pricing = record?.pricing;
  const rules = record?.fareRules || offerFare?.rules || null;
  if (pricing) {
    const baseFare = money(pricing.baseFare);
    const tax = money(pricing.taxes);
    const subtotal = baseFare !== null && tax !== null ? baseFare + tax : null;
    return {
      currency: pricing.currency || 'USD',
      baseFare,
      tax,
      subtotal,
      total: money(pricing.totalCost),
      actualCost: money(pricing.actualCost),
      actualMco: money(pricing.actualMCO),
      serviceFee: money(pricing.serviceFee),
      rules,
    };
  }
  if (offerFare && hasValue(offerFare.total)) {
    return {
      currency: offerFare.currency || 'USD',
      baseFare: null,
      tax: null,
      subtotal: null,
      total: money(Number(offerFare.total)),
      actualCost: null,
      actualMco: null,
      basis: offerFare.basis || null,
      rules,
    };
  }
  return null;
};

const normalizeCostingHistory = (record) => {
  if (Array.isArray(record?.costingHistory) && record.costingHistory.length) {
    return record.costingHistory.map(row => ({
      particular: row.particular || '',
      cost: row.cost ?? null,
      serviceCost: row.serviceCost ?? null,
    }));
  }
  const pricing = record?.pricing;
  if (!pricing) return null;
  const cost = money(pricing.baseFare) ?? money(pricing.actualCost);
  const serviceCost = money(pricing.serviceFee);
  if (cost === null && serviceCost === null) return null;
  return [{ particular: 'New Booking', cost, serviceCost }];
};

const normalizePassengers = (record) => {
  const list = record?.passengers;
  if (!Array.isArray(list) || !list.length) return null;
  return list.map((p, index) => ({
    type: p.passengerType || 'Adult',
    name: p.fullName || [p.title, p.firstName, p.middleName, p.lastName].filter(hasValue).join(' '),
    gender: p.gender || '',
    dob: p.dob || '',
    eTicket: p.eTicket || '',
    seat: p.seat || '',
    carryOn: p.carryOn || '',
    checkIn: p.checkIn || p.checkInBag || '',
    insurance: p.insurance || '',
    index: index + 1,
  }));
};

const normalizeAddress = (record) => {
  const billing = record?.billing || record?.billingAddress;
  if (!billing) return null;
  const line = [billing.addressLine1, billing.addressLine2].filter(hasValue).join(', ');
  const values = {
    line,
    city: billing.city || '',
    zip: billing.zip || billing.postalCode || '',
    state: billing.state || '',
    country: billing.country || '',
  };
  return Object.values(values).some(hasValue) ? values : null;
};

const normalizeStatus = (record, leg) => {
  const flightStatuses = (leg?.segments || []).map(s => s.status).filter(hasValue);
  return {
    booking: record?.status || null,
    payment: record?.paymentStatus || null,
    ticketing: record?.ticketingStatus || null,
    flight: flightStatuses.length ? [...new Set(flightStatuses)].join(', ') : null,
    availability: record ? null : 'Available',
  };
};

export const mapCombination = (raw, index = 0) => {
  if (!raw || typeof raw !== 'object') return null;
  const outbound = normalizeLeg(raw.legs?.outbound);
  const inbound = normalizeLeg(raw.legs?.return);
  if (!outbound && !inbound) return null;

  const record = raw.bookingRecord || null;
  const primarySegments = outbound?.segments || inbound?.segments || [];

  return {
    id: raw.id || `combo-${index + 1}`,
    referenceNumber: record?.refNo || record?.id || raw.referenceNumber || null,
    badge: raw.badge || null,
    source: raw.source || null,
    index: index + 1,
    status: normalizeStatus(record, outbound || inbound),
    airlines: normalizeAirlines(primarySegments, record, raw.pnr),
    outbound,
    inbound,
    fare: normalizeFare(record, raw.fare),
    booking: normalizeBooking(record),
    pnrExtras: record
      ? { gdsPnr: record.gdsPnr || '', milesPnr: record.milesPnr || '' }
      : null,
    passengers: normalizePassengers(record),
    costingHistory: normalizeCostingHistory(record),
    address: normalizeAddress(record),
    // Passthroughs for plan §15 secondary actions — null when the API omits
    // them, so the UI hides the action instead of inventing data.
    seatAvailability: raw.seatAvailability ?? record?.seatAvailability ?? null,
    legs: raw.legs || {},
  };
};

export const mapFlightSearchResponse = (rawOffers) =>
  (Array.isArray(rawOffers) ? rawOffers : [])
    .map((offer, index) => mapCombination(offer, index))
    .filter(Boolean);
