// Sabre REST API client (test/sandbox — base URL & credentials will change later).
// Docs: https://developer.sabre.com

const BASE = (import.meta.env.VITE_SABRE_BASE_URL || 'https://api.sabre.com').replace(/\/$/, '');
const KEY = import.meta.env.VITE_SABRE_KEY || '';
const SECRET = import.meta.env.VITE_SABRE_SECRET || '';
const INITIAL_TOKEN = import.meta.env.VITE_SABRE_TOKEN || '';

let cachedToken = INITIAL_TOKEN || null;

export const isSabreConfigured = () => Boolean(KEY && SECRET) || Boolean(INITIAL_TOKEN);

// OAuth v2 sessionless token: POST /v2/auth/token (Basic key:secret)
export const getSabreToken = async (forceRefresh = false) => {
  if (cachedToken && !forceRefresh) return cachedToken;
  if (!forceRefresh && INITIAL_TOKEN) {
    cachedToken = INITIAL_TOKEN;
    return cachedToken;
  }
  if (!KEY || !SECRET) {
    throw new Error('Sabre is not configured. Set VITE_SABRE_KEY and VITE_SABRE_SECRET in .env');
  }

  const response = await fetch(`${BASE}/v2/auth/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`${KEY}:${SECRET}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error(`Sabre authentication failed (${response.status}). Check VITE_SABRE_KEY / VITE_SABRE_SECRET.`);
  }

  const data = await response.json();
  cachedToken = data.access_token || data.token || null;
  if (!cachedToken) throw new Error('Sabre auth response did not include an access token.');
  return cachedToken;
};

export const sabreFetch = async (path, options = {}) => {
  const doFetch = async (token) => {
    const url = path.startsWith('http') ? path : `${BASE}${path}`;
    return fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(options.headers || {}),
      },
    });
  };

  let token = await getSabreToken();
  let response = await doFetch(token);

  if (response.status === 401) {
    token = await getSabreToken(true);
    response = await doFetch(token);
  }
  return response;
};

const searchDate = (offsetDays = 7) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

const toTime = (value) => {
  if (!value) return '';
  const raw = String(value);
  if (raw.includes('T')) {
    const t = raw.split('T')[1];
    return t.length >= 5 ? t.slice(0, 5) : t;
  }
  return raw;
};

const toDate = (value) => {
  if (!value) return '';
  const raw = String(value);
  if (!raw.includes('T')) return raw;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw.split('T')[0];
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
};

const pick = (obj, keys) => {
  for (const k of keys) {
    if (obj && obj[k] !== undefined && obj[k] !== null && obj[k] !== '') return obj[k];
  }
  return undefined;
};

const collectNodes = (node, predicate, acc = []) => {
  if (!node || typeof node !== 'object') return acc;
  if (Array.isArray(node)) {
    node.forEach(n => collectNodes(n, predicate, acc));
    return acc;
  }
  if (predicate(node)) acc.push(node);
  Object.values(node).forEach(v => collectNodes(v, predicate, acc));
  return acc;
};

const extractSegment = (node) => {
  const departureAirport = pick(node, ['DepartureAirport', 'origin', 'Origin', 'OriginLocation', 'departureAirport']);
  const arrivalAirport = pick(node, ['ArrivalAirport', 'destination', 'Destination', 'DestinationLocation', 'arrivalAirport']);
  const origin = typeof departureAirport === 'object' ? (departureAirport.LocationCode || departureAirport.locationCode) : departureAirport;
  const dest = typeof arrivalAirport === 'object' ? (arrivalAirport.LocationCode || arrivalAirport.locationCode) : arrivalAirport;
  const marketing = pick(node, ['MarketingCarrier', 'MarketingAirline', 'Carrier', 'OperatingCarrier', 'Airline']);
  const marketingCode = typeof marketing === 'object'
    ? (marketing.CompanyCode || marketing.Code || marketing.code || marketing.AirlineCode)
    : marketing;
  const flightNumber = pick(node, ['FlightNumber', 'flightNumber', 'MarketingFlightNumber', 'operatingFlightNumber']);
  const departureDateTime = pick(node, ['DepartureDateTime', 'departureDateTime', 'DepartureTime', 'departureTime']);
  const arrivalDateTime = pick(node, ['ArrivalDateTime', 'arrivalDateTime', 'ArrivalTime', 'arrivalTime']);
  return {
    origin: origin ? String(origin).toUpperCase() : '',
    dest: dest ? String(dest).toUpperCase() : '',
    marketingCode: marketingCode ? String(marketingCode).toUpperCase() : '',
    flightNumber: flightNumber ? String(flightNumber).replace(/\D/g, '') : '',
    departureDateTime,
    arrivalDateTime,
  };
};

// Bargain Finder Max (test shopping) — filter results for the entered flight number.
const shopFlights = async ({ from, to, departureDate, airlineCode, flightNumber, tripType }) => {
  const payload = {
    OTA_AirLowFareSearchRQ: {
      OriginDestinationInformation: [
        {
          RPH: '1',
          DepartureDateTime: `${departureDate}T00:00:00`,
          OriginLocation: { LocationCode: from },
          DestinationLocation: { LocationCode: to },
        },
      ],
      TravelPreferences: {
        TripType: tripType === 'Round Trip' ? 'Circle' : 'OneWay',
        MaxStops: 5,
      },
      TravelerInfoSummary: {
        AirTravelerAvail: [
          { PassengerTypeQuantity: [{ Code: 'ADT', Quantity: 1 }] },
        ],
      },
      Version: '2.4.0',
      TPA_Extensions: {
        IntelliSellTransaction: {
          RequestType: { Value: '1' },
        },
      },
    },
  };

  // Some sandbox keys expose BFM under v1.0/shop/flights; fall back to v5 offers/shop.
  let response = await sabreFetch('/v1.0/shop/flights?mode=172', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (response.status === 404 || response.status === 405) {
    response = await sabreFetch('/v5/offers/shop', {
      method: 'POST',
      body: JSON.stringify({
        schemaVersion: '1.0.0',
        headers: { correlationId: `zsm-${Date.now()}` },
        query: {
          originDestinations: [
            {
              id: 'OD1',
              originLocationCode: from,
              destinationLocationCode: to,
              originRadius: 0,
              destinationRadius: 0,
              anyTimeAfter: `${departureDate}T00:00:00`,
              anyTimeBefore: `${departureDate}T23:59:59`,
            },
          ],
          travelers: [{ id: 'T1', type: 'ADT' }],
          preferredMaxStops: 5,
        },
      }),
    });
  }

  if (!response.ok) {
    let detail = '';
    try {
      const errJson = await response.json();
      detail = errJson.message || errJson.errorMessage || JSON.stringify(errJson).slice(0, 200);
    } catch { /* ignore */ }
    if (response.status === 403) {
      throw new Error(`Sabre rejected the shopping request (403). Bargain Finder Max may not be enabled on this test key.${detail ? ` ${detail}` : ''}`);
    }
    throw new Error(`Sabre flight search failed (${response.status}).${detail ? ` ${detail}` : ''}`);
  }

  const data = await response.json();
  const wantedNumber = String(flightNumber).replace(/\D/g, '');
  const segmentNodes = collectNodes(data, (n) => {
    const fn = pick(n, ['FlightNumber', 'flightNumber', 'MarketingFlightNumber']);
    return Boolean(fn) && String(fn).replace(/\D/g, '') === wantedNumber;
  });

  let segmentNode = segmentNodes.find((n) => {
    const marketing = pick(n, ['MarketingCarrier', 'MarketingAirline', 'Carrier', 'OperatingCarrier']);
    const code = typeof marketing === 'object'
      ? (marketing.CompanyCode || marketing.Code || marketing.code || marketing.AirlineCode)
      : marketing;
    return code && String(code).toUpperCase() === airlineCode;
  }) || segmentNodes[0];

  if (!segmentNode) {
    // No exact flight-number match — fall back to first segment so the flow still works in test mode.
    const anySegments = collectNodes(data, (n) =>
      Boolean(pick(n, ['FlightNumber', 'flightNumber'])) &&
      Boolean(pick(n, ['DepartureAirport', 'OriginLocation', 'origin']))
    );
    segmentNode = anySegments[0];
    if (!segmentNode) throw new Error('Sabre returned no flight segments for this search.');
  }

  const seg = extractSegment(segmentNode);
  return {
    pnr: `SB${Math.random().toString(36).toUpperCase().slice(2, 8)}`,
    airline: airlineCode,
    flightCode: `${seg.marketingCode || airlineCode}${seg.flightNumber || flightNumber}`,
    route: seg.origin || from,
    dest: seg.dest || to,
    date: toDate(seg.departureDateTime) || departureDate,
    time: toTime(seg.departureDateTime) || '—',
    arrTime: toTime(seg.arrivalDateTime) || '—',
    found: true,
    source: 'sabre',
  };
};

/**
 * Lookup by airline+flight code (e.g. AA204) via Sabre test APIs.
 * { from, to, tripType } come from the booking form for the shopping search.
 */
export const lookupSabreFlight = async ({ flightCode, from, to, tripType }) => {
  const match = String(flightCode).trim().toUpperCase().match(/^([A-Z]{2})(\d{1,4})$/);
  if (!match) throw new Error('Invalid flight code format.');
  const [, airlineCode, flightNumber] = match;

  const origin = (from || 'JFK').toUpperCase();
  const destination = (to || 'LAX').toUpperCase();

  return shopFlights({
    from: origin,
    to: destination,
    departureDate: searchDate(7),
    airlineCode,
    flightNumber,
    tripType: tripType || 'One Way',
  });
};
