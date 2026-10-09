// Shared flight catalog + local fallback lookup.
// Previously module-local to NewBooking.jsx; extracted so the search-results
// layer (services/flightSearch.js) and the typeahead read from one source.

export const AIRLINE_NAMES = {
  AA: 'American Airlines', DL: 'Delta Air Lines', UA: 'United Airlines', B6: 'JetBlue Airways',
  WN: 'Southwest Airlines', AS: 'Alaska Airlines', NK: 'Spirit Airlines', F9: 'Frontier Airlines',
};

export const AIRPORT_NAMES = {
  JFK: 'John F. Kennedy Intl Airport',
  LAX: 'Los Angeles Intl Airport',
  SFO: 'San Francisco Intl Airport',
  ATL: 'Atlanta Hartsfield-Jackson Airport',
  CMH: 'Port Columbus Intl Airport',
  TPA: 'Tampa Intl Airport',
  ORD: 'Chicago O’Hare Intl Airport',
  DFW: 'Dallas/Fort Worth Intl Airport',
  DEN: 'Denver Intl Airport',
  BOS: 'Boston Logan Intl Airport',
  MIA: 'Miami Intl Airport',
  SEA: 'Seattle-Tacoma Intl Airport',
};

export const airportName = (code) => {
  const key = String(code || '').trim().toUpperCase();
  return AIRPORT_NAMES[key] || (key ? key : '');
};

export const mockFlights = [
  // Outbound Flights
  { id: 'AA204', airlineCode: 'AA', flightNumber: '204', flightCode: 'AA204', airline: 'American Airlines', color: '#1a73e8', route: 'JFK', dest: 'LAX', origin: 'JFK', destination: 'LAX', departureAirport: 'JFK', arrivalAirport: 'LAX', date: 'Oct 15, 2026', time: '10:15 AM', arrTime: '01:45 PM', duration: '6h 30m', stops: 'Non-stop', baggage: 'Carry-on Only', fareClass: 'Basic Economy', price: 289.00, isBestValue: true },
  { id: 'DL101', airlineCode: 'DL', flightNumber: '101', flightCode: 'DL101', airline: 'Delta Air Lines', color: '#e51420', route: 'JFK', dest: 'LAX', origin: 'JFK', destination: 'LAX', departureAirport: 'JFK', arrivalAirport: 'LAX', date: 'Oct 15, 2026', time: '08:00 AM', arrTime: '11:30 AM', duration: '6h 30m', stops: 'Non-stop', baggage: '1 Checked Bag', fareClass: 'Main Cabin', price: 345.50, isBestValue: false },
  { id: 'UA312', airlineCode: 'UA', flightNumber: '312', flightCode: 'UA312', airline: 'United Airlines', color: '#002244', route: 'JFK', dest: 'LAX', origin: 'JFK', destination: 'LAX', departureAirport: 'JFK', arrivalAirport: 'LAX', date: 'Oct 15, 2026', time: '02:00 PM', arrTime: '05:30 PM', duration: '6h 30m', stops: 'Non-stop', baggage: '1 Checked Bag', fareClass: 'Economy', price: 395.00, isBestValue: false },
  { id: 'B6405', airlineCode: 'B6', flightNumber: '405', flightCode: 'B6405', airline: 'JetBlue Airways', color: '#0033a0', route: 'JFK', dest: 'SFO', origin: 'JFK', destination: 'SFO', departureAirport: 'JFK', arrivalAirport: 'SFO', date: 'Oct 15, 2026', time: '07:30 AM', arrTime: '11:15 AM', duration: '6h 45m', stops: 'Non-stop', baggage: '1 Checked Bag', fareClass: 'Blue Basic', price: 215.00, isBestValue: false },
  // Connecting legs (used to build multi-segment itineraries, e.g. JFK→ATL→LAX)
  { id: 'DL1180', airlineCode: 'DL', flightNumber: '1180', flightCode: 'DL1180', airline: 'Delta Air Lines', color: '#e51420', route: 'JFK', dest: 'ATL', origin: 'JFK', destination: 'ATL', departureAirport: 'JFK', arrivalAirport: 'ATL', date: 'Oct 15, 2026', time: '07:00 AM', arrTime: '09:36 AM', duration: '2h 36m', stops: 'Non-stop', baggage: '1 Checked Bag', fareClass: 'Main Cabin', price: 149.00, isBestValue: false },
  { id: 'DL999', airlineCode: 'DL', flightNumber: '999', flightCode: 'DL999', airline: 'Delta Air Lines', color: '#e51420', route: 'ATL', dest: 'LAX', origin: 'ATL', destination: 'LAX', departureAirport: 'ATL', arrivalAirport: 'LAX', date: 'Oct 15, 2026', time: '10:15 AM', arrTime: '12:59 PM', duration: '4h 44m', stops: 'Non-stop', baggage: '1 Checked Bag', fareClass: 'Main Cabin', price: 189.00, isBestValue: false },
  // Inbound Flights
  { id: 'AA305', airlineCode: 'AA', flightNumber: '305', flightCode: 'AA305', airline: 'American Airlines', color: '#1a73e8', route: 'LAX', dest: 'JFK', origin: 'LAX', destination: 'JFK', departureAirport: 'LAX', arrivalAirport: 'JFK', date: 'Oct 22, 2026', time: '09:00 AM', arrTime: '05:30 PM', duration: '5h 30m', stops: 'Non-stop', baggage: 'Carry-on Only', fareClass: 'Basic Economy', price: 279.00, isBestValue: true },
  { id: 'DL202', airlineCode: 'DL', flightNumber: '202', flightCode: 'DL202', airline: 'Delta Air Lines', color: '#e51420', route: 'LAX', dest: 'JFK', origin: 'LAX', destination: 'JFK', departureAirport: 'LAX', arrivalAirport: 'JFK', date: 'Oct 22, 2026', time: '11:45 AM', arrTime: '08:15 PM', duration: '5h 30m', stops: 'Non-stop', baggage: '1 Checked Bag', fareClass: 'Main Cabin', price: 355.00, isBestValue: false },
  { id: 'UA415', airlineCode: 'UA', flightNumber: '415', flightCode: 'UA415', airline: 'United Airlines', color: '#002244', route: 'LAX', dest: 'JFK', origin: 'LAX', destination: 'JFK', departureAirport: 'LAX', arrivalAirport: 'JFK', date: 'Oct 22, 2026', time: '10:30 PM', arrTime: '06:45 AM', duration: '5h 15m', stops: 'Non-stop', baggage: '1 Checked Bag', fareClass: 'Economy', price: 310.00, isBestValue: false },
];

// Local test lookup — used when Sabre/proxy is unavailable so Preview always works.
export const resolveLocalFlight = (code, type, form) => {
  const exact = mockFlights.filter(f => f.flightCode === code || f.id === code);
  const dirMatch = type === 'outbound'
    ? exact.find(f => f.route === form.fromAirport) || exact[0]
    : exact.find(f => f.route === form.toAirport) || exact[0];

  const matched = dirMatch || mockFlights.find(f =>
    type === 'outbound' ? f.route === form.fromAirport && f.dest === form.toAirport
                        : f.route === form.toAirport && f.dest === form.fromAirport
  );

  if (matched) {
    return {
      ...matched,
      pnr: matched.pnr || `TST${Math.random().toString(36).toUpperCase().slice(2, 8)}`,
      found: true,
      source: 'local',
    };
  }

  const m = code.match(/^([A-Z]{2})(\d{1,4})$/);
  if (!m) throw new Error(`No flight found for "${code}".`);
  const [, airlineCode, flightNumber] = m;
  const depart = new Date();
  depart.setDate(depart.getDate() + 7);
  const returnDate = new Date(depart);
  returnDate.setDate(returnDate.getDate() + 7);
  const route = type === 'outbound' ? form.fromAirport : form.toAirport;
  const dest = type === 'outbound' ? form.toAirport : form.fromAirport;
  return {
    id: code,
    airlineCode,
    flightNumber,
    flightCode: code,
    airline: AIRLINE_NAMES[airlineCode] || airlineCode,
    route,
    dest,
    origin: route,
    destination: dest,
    departureAirport: route,
    arrivalAirport: dest,
    date: (type === 'outbound' ? depart : returnDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    time: '10:00 AM',
    arrTime: '01:30 PM',
    duration: '6h 30m',
    stops: 'Non-stop',
    baggage: '1 Checked Bag',
    fareClass: 'Economy',
    price: 320.00,
    pnr: `TST${Math.random().toString(36).toUpperCase().slice(2, 8)}`,
    found: true,
    source: 'local',
  };
};

// ─── Leg helpers ────────────────────────────────────────────────────────────
// A "leg" is one direction of travel: one or more segments plus the connection
// times between them. Nothing here assumes a fixed segment count.
const toMinutes = (value) => {
  const match = String(value || '').trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return null;
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridiem = (match[3] || '').toUpperCase();
  if (meridiem === 'PM' && hour < 12) hour += 12;
  if (meridiem === 'AM' && hour === 12) hour = 0;
  return hour * 60 + minute;
};

const formatMinutes = (total) => {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return [hours ? `${hours}h` : '', minutes ? `${minutes}m` : ''].filter(Boolean).join(' ') || '0m';
};

export const connectionDuration = (arrivalTime, departureTime) => {
  const arrival = toMinutes(arrivalTime);
  const departure = toMinutes(departureTime);
  if (arrival === null || departure === null) return '—';
  let diff = departure - arrival;
  if (diff < 0) diff += 24 * 60;
  return formatMinutes(diff);
};

const parseDuration = (value) => {
  const text = String(value || '');
  const hours = Number((text.match(/(\d+)\s*h/) || [])[1] || 0);
  const minutes = Number((text.match(/(\d+)\s*m/) || [])[1] || 0);
  return hours * 60 + minutes;
};

export const legPrice = (leg) =>
  (leg?.segments || []).reduce((sum, flight) => sum + Number(flight?.price || 0), 0);

export const legDuration = (leg) => {
  const segments = leg?.segments || [];
  if (segments.length === 1) return segments[0].duration || '';
  const total = segments.reduce((sum, flight) => sum + parseDuration(flight.duration), 0)
    + (leg?.connections || []).reduce((sum, value) => sum + parseDuration(value), 0);
  return formatMinutes(total);
};

export const legStops = (leg) => {
  const count = (leg?.segments || []).length;
  if (count <= 1) return leg?.segments?.[0]?.stops || 'Non-stop';
  const hubs = (leg?.segments || []).slice(0, -1).map(s => s.dest).join(', ');
  return `${count - 1} Stop (${hubs})`;
};

// Turns a leg into the single-flight object the existing booking flow expects
// (formData.outboundFlight / inboundFlight). Multi-segment legs keep their
// segments so NewBooking's buildSegments() renders every one of them.
export const legToFlight = (leg, extras = {}) => {
  if (!leg) return null;
  const segments = leg.segments && leg.segments.length ? leg.segments : [leg];
  const first = segments[0];
  const last = segments[segments.length - 1];
  const pnr = extras.pnr || first.pnr || `TST${Math.random().toString(36).toUpperCase().slice(2, 8)}`;
  const base = {
    id: segments.length === 1 ? (first.id || first.flightCode) : segments.map(s => s.flightCode).join('-'),
    airlineCode: first.airlineCode,
    flightNumber: first.flightNumber,
    flightCode: segments.length === 1 ? first.flightCode : segments.map(s => s.flightCode).join(' + '),
    airline: segments.length === 1 ? first.airline : `${first.airline} + ${last.airline}`,
    color: first.color,
    route: first.route || first.departureAirport,
    dest: last.dest || last.arrivalAirport,
    origin: first.route || first.departureAirport,
    destination: last.dest || last.arrivalAirport,
    departureAirport: first.route || first.departureAirport,
    arrivalAirport: last.dest || last.arrivalAirport,
    date: first.date,
    arrivalDate: last.arrivalDate || last.date,
    time: first.time,
    arrTime: last.arrTime,
    duration: legDuration(leg),
    stops: legStops(leg),
    baggage: first.baggage,
    fareClass: first.fareClass || first.cabinClass,
    price: legPrice(leg),
    pnr,
    found: true,
    source: first.source || 'local',
  };
  return segments.length > 1
    ? { ...base, segments: segments.map(s => ({ ...s })) }
    : base;
};

// ─── Local combination builder ──────────────────────────────────────────────
// Produces the raw offer list for one direction search. Each offer carries the
// legs already chosen for the other direction so round-trip cards are complete.
export const buildLocalOffers = ({ flightCode, type, form, existingOutbound, existingInbound }) => {
  const route = type === 'outbound' ? form.fromAirport : form.toAirport;
  const dest = type === 'outbound' ? form.toAirport : form.fromAirport;
  const code = String(flightCode || '').trim().toUpperCase();

  const toLeg = (segments, connections = []) => ({ segments, connections });

  const directs = mockFlights
    .filter(f => f.route === route && f.dest === dest)
    .map(f => toLeg([f]));

  const connecting = [];
  for (const first of mockFlights) {
    if (first.route !== route || first.dest === dest) continue;
    for (const second of mockFlights) {
      if (second.route !== first.dest || second.dest !== dest) continue;
      connecting.push(toLeg([first, second], [connectionDuration(first.arrTime, second.time)]));
    }
  }

  let legs = [...directs, ...connecting];
  if (!legs.length) {
    // Valid code, unknown route — keep Preview working with one synthesized leg.
    legs = [toLeg([resolveLocalFlight(code, type, form)])];
  }

  const priceOf = legPrice;
  const matchedCode = (leg) => leg.segments.some(f => f.flightCode === code);
  const cheapestIdx = legs.reduce(
    (best, leg, idx) => (best === -1 || priceOf(leg) < priceOf(legs[best]) ? idx : best),
    -1
  );
  legs = legs
    .map((leg, idx) => ({ leg, idx }))
    .sort((a, b) => (matchedCode(a.leg) ? 0 : 1) - (matchedCode(b.leg) ? 0 : 1) || priceOf(a.leg) - priceOf(b.leg))
    .slice(0, 6);

  const otherLeg = type === 'outbound'
    ? (existingInbound ? toLeg([existingInbound]) : null)
    : (existingOutbound ? toLeg([existingOutbound]) : null);
  const otherKey = type === 'outbound' ? 'return' : 'outbound';

  const lowestPrice = legs.length
    ? Math.min(...legs.map(item => priceOf(item.leg) + (otherLeg ? priceOf(otherLeg) : 0)))
    : null;

  return legs.map(({ leg, idx }, position) => {
    const total = priceOf(leg) + (otherLeg ? priceOf(otherLeg) : 0);
    const isMatch = matchedCode(leg);
    const badge = isMatch
      ? 'Recommended'
      : (total === lowestPrice && position > 0 ? 'Lowest Fare' : 'Available');
    return {
      id: `${type}-local-${idx}-${leg.segments.map(s => s.flightCode).join('_')}`,
      source: 'local',
      badge,
      pnr: leg.segments[0].pnr || `TST${Math.random().toString(36).toUpperCase().slice(2, 8)}`,
      legs: {
        [type]: leg,
        ...(otherLeg ? { [otherKey]: otherLeg } : {}),
      },
      fare: {
        currency: 'USD',
        total,
        basis: 'per passenger',
      },
    };
  });
};
