// Turns a booking written by /new-booking into the row shape the Search &
// Service page filters and renders on. Every field of the original record is
// preserved, so saving a row back never discards the full booking.

import { normalizeService } from './serviceTypes';

const searchDefaults = {
  enquiryStatus: 'New',
  enquiryDate: '',
  enquiryCompletedDate: '',
  paymentStatus: 'Pending',
  workStatus: 'Pending',
  smsStatus: 'Pending',
  callStatus: 'Pending',
  crmAuditStatus: 'Pending',
  qualityAuditStatus: 'Pending',
  merchantStatus: 'Pending',
  cbStatus: 'Pending',
  saleDate: '',
  chargeDate: '',
  vendor: 'Standard',
  itineraryChangeRequests: [],
  activityLog: [],
};

const asText = (value) => (value === null || value === undefined ? '' : String(value));

const isNewBookingShape = (record) =>
  Boolean(record) &&
  (Boolean(record.customerId) || Array.isArray(record.passengers) || asText(record.id).startsWith('BK-'));

const toSearchFlight = (flight, { pnr, departureDate, from, to }) => {
  if (!flight) return undefined;
  return {
    ...flight,
    departureAirport: flight.departureAirport || flight.from || from || '',
    arrivalAirport: flight.arrivalAirport || flight.to || to || '',
    departureDate: flight.departureDate || flight.date || departureDate || '',
    arrivalDate: flight.arrivalDate || flight.date || departureDate || '',
    departureTime: flight.departureTime || flight.time || '',
    arrivalTime: flight.arrivalTime || flight.arrTime || '',
    flightNumber: flight.flightNumber || flight.flightCode || flight.id || '',
    cabinClass: flight.cabinClass || flight.fareClass || '',
    airline: flight.airline || '',
    pnr: flight.pnr || pnr || '',
    ticketStatus: flight.ticketStatus || 'Active',
    segments: Array.isArray(flight.segments) ? flight.segments : undefined,
  };
};

export const normalizeBookingForSearch = (record) => {
  if (!record) return record;
  if (!isNewBookingShape(record)) {
    return {
      ...record,
      service: normalizeService(record.service),
      status: record.status === 'Confirmed' ? 'Charged' : (asText(record.status) || 'Pending'),
    };
  }

  const primary = (record.passengers && record.passengers[0]) || {};

  // Primary passenger full name
  const fullName =
    asText(primary.fullName) ||
    [primary.firstName, primary.lastName].filter(Boolean).join(' ').trim();

  // All passenger names for passenger-name searching
  const allPassengerNames = Array.isArray(record.passengers)
    ? record.passengers
        .map(p =>
          asText(p.fullName) ||
          [p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ').trim()
        )
        .filter(Boolean)
        .join(', ')
    : '';

  // PNR — prefer the record-level pnr, then airlinePnrs rows
  const pnr =
    asText(record.pnr) ||
    (Array.isArray(record.airlinePnrs) && record.airlinePnrs.find(r => r?.pnr?.trim())?.pnr?.trim()) ||
    '';

  // All PNR values for richer PNR searching (stored in _allPnrs)
  const allPnrs = [
    asText(record.pnr),
    ...(Array.isArray(record.airlinePnrs)
      ? record.airlinePnrs.map(r => asText(r?.pnr)).filter(Boolean)
      : []),
  ]
    .filter(Boolean)
    .join(' ');

  // Phone — use already-flattened top-level phone if present, else derive from passenger
  const phone =
    asText(record.phone) ||
    asText(primary.phone) ||
    asText(record.billing?.phone) ||
    asText(record.billingPhone) ||
    '';

  // Alt phone — use already-flattened top-level altPhone if present, else aggregate passengers
  const altPhone =
    asText(record.altPhone) ||
    (Array.isArray(record.passengers)
      ? record.passengers.map(p => asText(p.altPhone)).filter(Boolean).join(', ')
      : '') ||
    asText(primary.altPhone) ||
    '';

  // Agent / sale-by — prefer shift field (agent name), then bookingSource
  const agentValue =
    asText(record.agent) ||
    asText(record.saleBy) ||
    asText(record.shift) ||
    asText(record.bookingSource) ||
    'Direct';

  let outbound = record.outboundFlight;
  let inbound = record.inboundFlight;

  if (Array.isArray(record.flightDetails)) {
    const outboundBlock = record.flightDetails.find(b => b.key?.includes('outbound') || b.title?.toLowerCase().includes('outbound'));
    const inboundBlock = record.flightDetails.find(b => b.key?.includes('return') || b.key?.includes('inbound') || b.title?.toLowerCase().includes('return') || b.title?.toLowerCase().includes('inbound'));

    if (outboundBlock && Array.isArray(outboundBlock.segments) && outboundBlock.segments.length > 0) {
      const validSegs = outboundBlock.segments.filter(s => s.departureAirport || s.arrivalAirport || s.flightNumber || s.carrier);
      if (validSegs.length > 0) {
        const segs = validSegs.map(s => ({
          departureAirport: s.departureAirport || record.fromAirport || '',
          arrivalAirport: s.arrivalAirport || record.toAirport || '',
          departureTime: s.departureTime || '',
          arrivalTime: s.arrivalTime || '',
          flightNumber: s.flightNumber || '',
          cabinClass: s.classOfService || record.cabinClass || 'Economy',
          airline: s.carrier || outbound?.airline || '',
          pnr: pnr,
          ticketStatus: 'Active',
          departureDate: record.departureDate || outbound?.date || '',
          arrivalDate: record.departureDate || outbound?.date || '',
        }));

        outbound = {
          ...(outbound || {}),
          from: segs[0].departureAirport,
          to: segs[segs.length - 1].arrivalAirport,
          departureAirport: segs[0].departureAirport,
          arrivalAirport: segs[segs.length - 1].arrivalAirport,
          departureTime: segs[0].departureTime,
          arrivalTime: segs[segs.length - 1].arrivalTime,
          flightNumber: segs[0].flightNumber,
          airline: segs[0].airline || outbound?.airline || '',
          cabinClass: segs[0].cabinClass,
          segments: segs,
        };
      }
    }

    if (inboundBlock && Array.isArray(inboundBlock.segments) && inboundBlock.segments.length > 0) {
      const validSegs = inboundBlock.segments.filter(s => s.departureAirport || s.arrivalAirport || s.flightNumber || s.carrier);
      if (validSegs.length > 0) {
        const segs = validSegs.map(s => ({
          departureAirport: s.departureAirport || record.toAirport || '',
          arrivalAirport: s.arrivalAirport || record.fromAirport || '',
          departureTime: s.departureTime || '',
          arrivalTime: s.arrivalTime || '',
          flightNumber: s.flightNumber || '',
          cabinClass: s.classOfService || record.cabinClass || 'Economy',
          airline: s.carrier || inbound?.airline || '',
          pnr: pnr,
          ticketStatus: 'Active',
          departureDate: record.returnDate || inbound?.date || '',
          arrivalDate: record.returnDate || inbound?.date || '',
        }));

        inbound = {
          ...(inbound || {}),
          from: segs[0].departureAirport,
          to: segs[segs.length - 1].arrivalAirport,
          departureAirport: segs[0].departureAirport,
          arrivalAirport: segs[segs.length - 1].arrivalAirport,
          departureTime: segs[0].departureTime,
          arrivalTime: segs[segs.length - 1].arrivalTime,
          flightNumber: segs[0].flightNumber,
          airline: segs[0].airline || inbound?.airline || '',
          cabinClass: segs[0].cabinClass,
          segments: segs,
        };
      }
    }
  }

  return {
    ...searchDefaults,
    ...record,

    refNo: record.refNo || asText(record.id),
    cxId: asText(record.cxId) || asText(record.customerId),
    pnr,
    // All PNRs (from the booking-level pnr + every airlinePnrs row) for
    // broader PNR matching in filterBookings.
    _allPnrs: allPnrs,
    name: fullName || asText(record.name),
    passengerName: allPassengerNames || asText(record.passengerName) || fullName,
    email: asText(primary.email) || asText(record.email) || asText(record.billing?.email) || asText(record.billingEmail) || '',
    phone,
    altPhone,
    agent: agentValue,
    saleBy: agentValue,
    enquiryDate: asText(record.enquiryDate) || asText(record.createdAt),
    enquiryCompletedDate: asText(record.enquiryCompletedDate),
    saleDate: asText(record.saleDate) || asText(record.createdAt),
    chargeDate: asText(record.chargeDate) || asText(record.updatedAt) || asText(record.createdAt),
    vendor: asText(record.vendor) || asText(record.vendorCode) || 'Standard',
    service: normalizeService(record.service),
    status: record.status === 'Confirmed' ? 'Charged' : (asText(record.status) || 'Pending'),
    date: asText(record.date) || asText(record.createdAt).slice(0, 10),
    travelDate: asText(outbound?.date) || asText(outbound?.departureDate) || asText(record.departureDate),
    amount: record.amount ||
      (record.pricing ? `$${Number(record.pricing.totalCost || 0).toFixed(2)}` : ''),

    outboundFlight: toSearchFlight(outbound, {
      pnr,
      departureDate: record.departureDate,
      from: record.fromAirport,
      to: record.toAirport,
    }),
    inboundFlight: toSearchFlight(inbound, {
      pnr,
      departureDate: record.returnDate,
      from: record.toAirport,
      to: record.fromAirport,
    }),
  };
};

export const normalizeBookingsForSearch = (bookings) =>
  Array.isArray(bookings) ? bookings.map(normalizeBookingForSearch) : bookings;

// Map a normalized booking record to the Booking Detail shape.
// Uses only fields present in the existing record; missing fields become null/empty
// so the UI can safely render null-dashes without breaking.
export const mapBookingDetail = (record) => {
  if (!record) return null;

  const header = {
    createdBy: record.agent || record.saleBy || '',
    bookingDate: record.createdAt || record.date || '',
    refNo: record.refNo || record.id || '',
    status: record.status || '',
    shift: record.shift || '',
    paymentBookingType: record.paymentBookingType || record.payment?.paymentMode || record.paymentMode || record.payment?.paymentType || record.paymentType || record.service || '',
    descriptor: record.descriptor || '',
    gateway: record.gateway || record.paymentGateway || '',
    vendor: record.vendorCode || record.vendor || '',
    source: record.bookingSource || record.source || '',
  };

  // Airline & PNR - one entry per airline (max 3); every PNR stays paired with
  // its own airline instead of being merged into a single combined field.
  const airlinePnrRows = (Array.isArray(record.airlinePnrs) ? record.airlinePnrs : [])
    .filter(r => r && (r.airline || r.pnr))
    .slice(0, 3);
  if (airlinePnrRows.length === 0) {
    const fallbackAirline = record.outboundFlight?.airline || record.airline || '';
    const fallbackPnr = record.pnr || record.outboundFlight?.pnr || '';
    if (fallbackAirline || fallbackPnr) airlinePnrRows.push({ airline: fallbackAirline, pnr: fallbackPnr });
  }
  const airlinePnr = {
    rows: airlinePnrRows.map((r, i) => ({
      airline: r.airline || '',
      pnr: r.pnr || '',
      airlineLabel: i === 0 ? 'Airline' : `Airline${i + 1}`,
      pnrLabel: `A${i + 1} PNR`,
    })),
    gdsPnr: record.gdsPnr || record.pnr || record.outboundFlight?.pnr || '',
    milesPnr: record.milesPnr || '',
  };

  // Card - masked only. Full PAN / CVV are never stored (PCI-DSS 3.3.1), so
  // the display value is built from the saved last-4 at most.
  const payment = record.payment || {};
  const cardData = record.cardData || {};
  const last4 = payment.cardLast4 || '';
  const maskedPan = cardData.maskedPan || (last4 ? `**** **** **** ${last4}` : '');
  const [expMonth, expYear] = String(payment.cardExpiry || '').split('/');
  const card = {
    cardholderName: cardData.cardholderName || payment.cardName || '',
    maskedPan,
    expiryMonth: cardData.expiryMonth || expMonth || '',
    expiryYear: cardData.expiryYear || expYear || '',
    cardBrand: cardData.cardBrand || payment.cardType || '',
    paymentStatus: record.paymentStatus || '',
    gateway: record.gateway || record.paymentGateway || '',
  };

  // Costing - authoritative stored amounts; never recomputed here.
  const pricing = record.pricing || {};
  const stored = (value) => (value === null || value === undefined || value === '' ? '' : value);
  const costing = {
    currency: pricing.currency || record.currency || 'USD',
    net: stored(pricing.baseFare ?? pricing.net),
    tax: stored(pricing.taxes ?? pricing.tax),
    subtotal: stored(pricing.subtotal),
    total: stored(pricing.totalCost ?? pricing.total ?? record.amount),
    actualCost: stored(pricing.actualCost),
    actualMCO: stored(pricing.actualMCO ?? record.actualMCO),
  };

  // Costing history - only recorded rows; a single "New Booking" row mirrors
  // the booking's own stored amounts when no explicit history exists.
  let costingHistory = Array.isArray(record.costingHistory) ? record.costingHistory : [];
  if (costingHistory.length === 0 && (costing.actualCost || costing.total)) {
    costingHistory = [
      { particular: 'New Booking', cost: costing.actualCost || costing.total, serviceCost: costing.actualMCO || '' },
    ];
  }

  // Passengers - NewBooking stores passengerType/checkInBag/name parts.
  const passengers = Array.isArray(record.passengers)
    ? record.passengers.map(p => ({
        type: p.type || p.passengerType || 'Adult',
        name: p.fullName || [p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ') || '',
        gender: p.gender || '',
        dob: p.dob || '',
        eTicket: p.eTicket || p.ticketNumber || '',
        seat: p.seat || '',
        carryOn: p.carryOn || '',
        checkIn: p.checkInBag || p.checkIn || '',
        insurance: p.insurance || '',
      }))
    : [];

  // Billing / passenger contact address (NewBooking saves record.billing.*)
  const billingSource = record.billingAddress || record.billing || {};
  const billingAddress = {
    address: billingSource.address || [billingSource.addressLine1, billingSource.addressLine2].filter(Boolean).join(', '),
    city: billingSource.city || '',
    zip: billingSource.zip || billingSource.postalCode || '',
    state: billingSource.state || '',
    country: billingSource.country || '',
  };

  return {
    header,
    airlinePnr,
    card,
    costing,
    costingHistory,
    passengers,
    billingAddress,
  };
};
