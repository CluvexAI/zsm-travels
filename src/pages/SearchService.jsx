import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { User, ShieldAlert, Loader2, Copy, Printer, Plane, ChevronDown, ChevronRight } from 'lucide-react';
import { backfillBookingDetailFields, saveBooking, saveBookings } from '../services/supabase';
import { normalizeBookingsForSearch, mapBookingDetail } from '../utils/bookingNormalizer';
import { DEFAULT_SERVICE, normalizeService } from '../utils/serviceTypes';
import { MERCHANT_OPTIONS, normalizeMerchant } from '../utils/merchantOptions';
import { ROLES } from '../services/mockAuthService';

const AIRPORT_NAMES = {
  CMH: 'Port Columbus Intl Airport', ATL: 'Hartsfield-Jackson Intl Airport', TPA: 'Tampa Intl Airport',
  JFK: 'John F. Kennedy Intl Airport', LAX: 'Los Angeles Intl Airport', ORD: "O'Hare Intl Airport",
  MIA: 'Miami Intl Airport', SFO: 'San Francisco Intl Airport', SEA: 'Seattle-Tacoma Intl Airport',
  DFW: 'Dallas/Fort Worth Intl Airport', LHR: 'London Heathrow Airport', BOS: 'Boston Logan Intl Airport',
  IAH: 'George Bush Intercontinental Airport', LAS: 'Harry Reid Intl Airport', PHX: 'Phoenix Sky Harbor Intl Airport',
  DEN: 'Denver Intl Airport', DCA: 'Reagan National Airport', IAD: 'Dulles Intl Airport',
  BWI: 'Baltimore/Washington Intl Airport', PHL: 'Philadelphia Intl Airport', EWR: 'Newark Liberty Intl Airport',
  DTW: 'Detroit Metropolitan Airport', MSP: 'Minneapolis-St. Paul Intl Airport', CLT: 'Charlotte Douglas Intl Airport',
  AUS: 'Austin-Bergstrom Intl Airport', SAN: 'San Diego Intl Airport', TUS: 'Tucson Intl Airport',
  PDX: 'Portland Intl Airport', SLC: 'Salt Lake City Intl Airport', STL: 'St. Louis Lambert Intl Airport',
  CLE: 'Cleveland Hopkins Intl Airport', CVG: 'Cincinnati/Northern Kentucky Intl Airport',
  IND: 'Indianapolis Intl Airport', BNA: 'Nashville Intl Airport', RDU: 'Raleigh-Durham Intl Airport',
  FLL: 'Fort Lauderdale-Hollywood Intl Airport', MCO: 'Orlando Intl Airport', MSY: 'Louis Armstrong New Orleans Intl Airport',
  HNL: 'Daniel K. Inouye Intl Airport', ANC: 'Ted Stevens Anchorage Intl Airport',
};

const airportName = (code) => (code && (AIRPORT_NAMES[code] || AIRPORT_NAMES[String(code).toUpperCase()])) || '';

const AIRLINE_MARKS = {
  delta: '#e01933', american: '#0078d2', united: '#005daa', alaska: '#015a5b',
  british: '#2e5c9e', jetblue: '#00205b', southwest: '#304cb2', spirit: '#f9b612',
};

const airlineColor = (airline) => {
  const key = String(airline || '').toLowerCase().split(' ')[0];
  return AIRLINE_MARKS[key] || '#a0aec0';
};

const AirlineMark = ({ airline }) => (
  <svg width="30" height="26" viewBox="0 0 30 26" aria-hidden="true" style={{ flexShrink: 0 }}>
    <path d="M15 2 L28 24 L2 24 Z" fill={airlineColor(airline)} />
  </svg>
);

const warningFor = (booking) =>
  booking.status === 'Cancelled' || booking.paymentStatus === 'Refunded' ? 'Review' : '—';

const mcoFor = (booking) => {
  const value = booking.pricing?.actualMCO ?? booking.actualMCO ?? booking.mco;
  return value === undefined || value === null || value === '' ? '—' : `$${Number(value).toFixed(2)}`;
};

const BOOKING_STATUSES = ['Pending', 'Charged', 'Decline', 'Refunded', 'Partial Refund', 'Chargeback', 'Cancelled'];

// Rows saved before the status vocabulary changed; map them onto the list above
// so the controlled dropdown never renders blank.
const LEGACY_STATUS_MAP = {
  Confirmed: 'Charged',
  'Booking Confirmed': 'Charged',
  Completed: 'Charged',
  'On Hold': 'Pending',
};

const normalizeStatus = (status) => {
  const value = String(status || '').trim();
  if (BOOKING_STATUSES.includes(value)) return value;
  return LEGACY_STATUS_MAP[value] || 'Pending';
};

const WORK_STATUSES = ['In Progress', 'Completed', 'WIP', 'Future WIP'];
const QUALITY_AUDIT_STATUSES = ['Pass Settle', 'Fail Settle', 'Doubtful', 'Fail Void'];
const CRM_AUDIT_STATUSES = ['Pending', 'Pass', 'Fail'];
const CB_STATUSES = ['CB RECEIVED', 'CB ETHOCA RECEIVED', 'CB VERIFI'];
const PAYMENT_STATUSES = ['Pending', 'Charged'];
const LEGACY_PAYMENT_MAP = { Paid: 'Charged', 'Partially Paid': 'Pending', Refunded: 'Pending' };
const MERCHANTS = MERCHANT_OPTIONS;

// Values outside the list would leave a controlled <select> blank, so map
// retired spellings first and otherwise fall back to the first option.
const normalizeOption = (value, options, legacy = {}) =>
  (options.includes(value) ? value : (legacy[value] || options[0]));

const badgeClass = (status) =>
  `badge ${
    status === 'Charged' || status === 'Booking Confirmed' || status === 'Completed' ? 'badge-success' :
    status === 'Refunded' ? 'badge-primary' :
    status === 'Pending' || status === 'On Hold' || status === 'Partial Refund' ? 'badge-warning' : 'badge-danger'
  }`;

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
};

const mutedColor = 'var(--text-muted)';

const formatDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
};

// Formats a stored amount as e.g. "USD 870.40". Values already stored as
// display strings pass through unchanged; missing values become "—".
const formatMoney = (value, currency = 'USD') => {
  if (value === null || value === undefined || value === '') return '—';
  const num = Number(String(value).replace(/[^0-9.-]/g, ''));
  if (Number.isNaN(num)) return String(value);
  return `${currency} ${num.toFixed(2)}`;
};

const renderBookingDetailCard = (detail, options = {}) => {
  const { header, airlinePnr, card, costing, costingHistory, passengers, billingAddress } = detail;
  const { canViewPII = false, actionBar = null } = options;
  const primaryColor = 'var(--text-primary)';

  const fieldLabel = { fontSize: '0.7rem', color: mutedColor, textTransform: 'uppercase' };
  const fieldValue = { fontWeight: 600, color: primaryColor, fontSize: '0.85rem' };
  const blockTitle = {
    fontSize: '0.7rem',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    fontWeight: 700,
    letterSpacing: '0.04em',
    marginBottom: '0.75rem',
  };
  const thStyle = { padding: '0.5rem', border: '1px solid var(--border-color)', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-secondary)', textAlign: 'left' };
  const tdStyle = { padding: '0.5rem', border: '1px solid var(--border-color)', fontSize: '0.75rem' };

  // Created By / BookingDate / age strip
  const createdByRow = (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem 1.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
      <span>Created By : <b style={fieldValue}>{header.createdBy || '—'}</b></span>
      <span>BookingDate : <b style={fieldValue}>{formatDateTime(header.bookingDate)}</b></span>
      {daysAgo(header.bookingDate) && <b style={fieldValue}>{daysAgo(header.bookingDate)}</b>}
    </div>
  );

  const headerFields = [
    { label: 'Ref No #', key: 'refNo' },
    { label: 'Descriptor', key: 'descriptor' },
    { label: 'Vendor', key: 'vendor' },
    { label: 'Shift', key: 'shift' },
    { label: 'Gateway', key: 'gateway' },
    { label: 'Source', key: 'source' },
    { label: 'Payment Booking Type', key: 'paymentBookingType' },
    { label: 'Booking Status', key: 'status' },
  ];
  const headerRow = (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem 1.5rem' }}>
      {headerFields.map(f => (
        <div key={f.key}>
          <div style={fieldLabel}>{f.label}</div>
          <div style={fieldValue}>
            {header[f.key] ? (f.key === 'refNo' ? `# ${header[f.key]}` : header[f.key]) : '—'}
          </div>
        </div>
      ))}
    </div>
  );

  // Airline & PNR - each airline keeps its own PNR; up to three airlines.
  const airlinePnrColumn = (
    <div>
      <div style={blockTitle}>Airline &amp; PNR Detail</div>
      {airlinePnr.rows.length === 0 && <div style={{ fontSize: '0.8rem', color: mutedColor }}>—</div>}
      {airlinePnr.rows.map((row, idx) => (
        <div key={idx} style={{ marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <AirlineMark airline={row.airline} />
            <div style={fieldLabel}>{row.airlineLabel}</div>
          </div>
          <div style={fieldValue}>{row.airline || '—'}</div>
          <div style={{ ...fieldLabel, marginTop: '0.35rem' }}>{row.pnrLabel}</div>
          <div style={fieldValue}>{row.pnr || '—'}</div>
        </div>
      ))}
      <div style={{ marginTop: '0.75rem' }}>
        <div style={fieldLabel}>GDS PNR</div>
        <div style={fieldValue}>{airlinePnr.gdsPnr || '—'}</div>
      </div>
      <div style={{ marginTop: '0.5rem' }}>
        <div style={fieldLabel}>Miles PNR</div>
        <div style={fieldValue}>{airlinePnr.milesPnr || '—'}</div>
      </div>
    </div>
  );

  // Card Detail - masked only; CVV is never rendered (PCI-DSS 3.3.1).
  const cardFields = [
    { label: 'Name', value: card.cardholderName },
    { label: 'Card', value: card.maskedPan },
    { label: 'ExM', value: card.expiryMonth },
    { label: "E'Yrs", value: card.expiryYear },
    { label: 'Brand', value: card.cardBrand },
    { label: 'Payment Status', value: card.paymentStatus },
    { label: 'Gateway', value: card.gateway },
  ];
  const cardColumn = (
    <div>
      <div style={blockTitle}>Card Detail</div>
      {cardFields.map(f => (
        <div key={f.label} style={{ marginBottom: '0.5rem' }}>
          <div style={fieldLabel}>{f.label}</div>
          <div style={fieldValue}>{f.value || '—'}</div>
        </div>
      ))}
    </div>
  );

  // Costing Detail - stored amounts, formatted with the booking currency.
  const costingFields = [
    { label: 'Net', value: costing.net },
    { label: 'Tax', value: costing.tax },
    { label: 'Subtotal', value: costing.subtotal },
    { label: 'Total', value: costing.total, bold: true },
    { label: 'Actual Cost', value: costing.actualCost },
    { label: 'Actual MCO', value: costing.actualMCO },
  ];
  const costingColumn = (
    <div>
      <div style={blockTitle}>Costing Detail</div>
      {costingFields.map(f => (
        <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', padding: '0.35rem 0', fontSize: '0.85rem', borderBottom: '1px dashed var(--border-color)' }}>
          <span style={fieldLabel}>{f.label}</span>
          <span style={f.bold ? fieldValue : { color: primaryColor }}>{formatMoney(f.value, costing.currency)}</span>
        </div>
      ))}
    </div>
  );

  const threeColumnRow = (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
      {airlinePnrColumn}
      {cardColumn}
      {costingColumn}
    </div>
  );

  // Costing History table
  const costingHistoryTable = (
    <div>
      <div style={blockTitle}>Costing History</div>
      {costingHistory.length === 0 ? (
        <div style={{ fontSize: '0.8rem', color: mutedColor, padding: '0.75rem 0' }}>No costing history has been recorded for this booking.</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Particular</th>
              <th style={thStyle}>Cost</th>
              <th style={thStyle}>Service Cost</th>
            </tr>
          </thead>
          <tbody>
            {costingHistory.map((row, idx) => (
              <tr key={idx}>
                <td style={tdStyle}>{row.particular || '—'}</td>
                <td style={tdStyle}>{formatMoney(row.cost, costing.currency)}</td>
                <td style={tdStyle}>{formatMoney(row.serviceCost, costing.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  // Passenger table - all passengers; scrolls horizontally on narrow screens.
  const paxCell = (content, sensitive = false) => (
    <td style={tdStyle}>{!sensitive || canViewPII ? (content || '—') : '—'}</td>
  );
  const passengerTable = (
    <div>
      <div style={blockTitle}>Passenger Detail</div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '720px' }}>
          <thead>
            <tr>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Gender</th>
              <th style={thStyle}>DOB</th>
              <th style={thStyle}>E-Ticket</th>
              <th style={thStyle}>Seat</th>
              <th style={thStyle}>CarryOn</th>
              <th style={thStyle}>Checkin</th>
              <th style={thStyle}>Insurance</th>
            </tr>
          </thead>
          <tbody>
            {passengers.length === 0 && (
              <tr>
                <td colSpan={9} style={{ ...tdStyle, color: mutedColor, textAlign: 'center' }}>No passenger details recorded.</td>
              </tr>
            )}
            {passengers.map((pax, idx) => (
              <tr key={idx}>
                <td style={tdStyle}>{pax.type || '—'}</td>
                <td style={tdStyle}>{pax.name || '—'}</td>
                {paxCell(pax.gender, true)}
                {paxCell(pax.dob, true)}
                {paxCell(pax.eTicket, true)}
                <td style={tdStyle}>{pax.seat || '—'}</td>
                <td style={tdStyle}>{pax.carryOn || '—'}</td>
                <td style={tdStyle}>{pax.checkIn || '—'}</td>
                <td style={tdStyle}>{pax.insurance || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Billing address - PII: shown only if user can view sensitive data
  const hasAddress = Object.values(billingAddress).some(Boolean);
  const billingAddressLine = canViewPII && hasAddress ? (
    <div>
      <div style={blockTitle}>Address</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
        <span><b style={fieldLabel}>Address :</b> {billingAddress.address || '—'}</span>
        <span><b style={fieldLabel}>City :</b> {billingAddress.city || '—'}</span>
        <span><b style={fieldLabel}>Zip :</b> {billingAddress.zip || '—'}</span>
        <span><b style={fieldLabel}>State :</b> {billingAddress.state || '—'}</span>
        <span><b style={fieldLabel}>Country :</b> {billingAddress.country || '—'}</span>
      </div>
    </div>
  ) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {createdByRow}
      {headerRow}
      {threeColumnRow}
      {costingHistoryTable}
      {passengerTable}
      {billingAddressLine}
      {actionBar}
    </div>
  );
};

const daysAgo = (dateValue) => {
  if (!dateValue) return '';
  const date = new Date(dateValue);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? `(${diffDays}d ago)` : '';
};

const FlightLegSingle = ({ flight }) => (
  <div className="flight-row">
    <div>
      <div className="flight-code">{flight.departureAirport}</div>
      <div className="flight-time">{flight.departureTime || '—'}</div>
      <div className="flight-date">{formatDate(flight.departureDate)}</div>
      <div className="flight-airport">{airportName(flight.departureAirport)}</div>
    </div>

    <div className="flight-mid">
      <Plane size={16} />
      <span>{flight.duration || '—'}</span>
    </div>

    <div>
      <div className="flight-code">{flight.arrivalAirport}</div>
      <div className="flight-time">{flight.arrivalTime || '—'}</div>
      <div className="flight-date">{formatDate(flight.arrivalDate)}</div>
      <div className="flight-airport">{airportName(flight.arrivalAirport)}</div>
    </div>

    <div className="flight-airline">
      <AirlineMark airline={flight.airline} />
      <div className="airline-meta">
        <div className="airline-name">{flight.airline}</div>
        <div>{flight.flightNumber || '—'}</div>
        <div>{flight.cabinClass || 'Economy'}</div>
        <div>Ticket Status: <b>{flight.ticketStatus || 'Active'}</b></div>
        {flight.pnr && <div>PNR: {flight.pnr}</div>}
      </div>
    </div>
  </div>
);

const FlightLeg = ({ flight }) => {
  if (Array.isArray(flight?.segments) && flight.segments.length > 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {flight.segments.map((seg, idx) => (
          <div key={idx} style={{ borderBottom: idx < flight.segments.length - 1 ? '1px dashed var(--border-color)' : 'none', paddingBottom: idx < flight.segments.length - 1 ? '1rem' : 0 }}>
            {flight.segments.length > 1 && (
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Segment {idx + 1}
              </div>
            )}
            <FlightLegSingle flight={{ ...flight, ...seg }} />
          </div>
        ))}
      </div>
    );
  }
  return <FlightLegSingle flight={flight} />;
};

const filterBookings = (list, query) => {
  const { cxId, bookingId, pnr, customerName, cxPhone, customerEmail, agent, altPhone, passengerName, fromDate, toDate, status, service } = query;
  const match = (field, queryText) => !queryText || (field && String(field).toLowerCase().includes(String(queryText).toLowerCase()));

  return list.filter((booking) => {
    // CX ID
    if (!match(booking.cxId, cxId) && !match(booking.customerId, cxId)) return false;
    // Booking ID
    if (!match(booking.id, bookingId) && !match(booking.refNo, bookingId)) return false;
    // PNR — also search _allPnrs which contains every PNR from airlinePnrs rows
    if (pnr) {
      const pnrText = String(pnr).toLowerCase();
      const inPrimary = booking.pnr && String(booking.pnr).toLowerCase().includes(pnrText);
      const inAll = booking._allPnrs && String(booking._allPnrs).toLowerCase().includes(pnrText);
      const inPnrs = Array.isArray(booking.airlinePnrs) &&
        booking.airlinePnrs.some(r => r?.pnr && String(r.pnr).toLowerCase().includes(pnrText));
      if (!inPrimary && !inAll && !inPnrs) return false;
    }
    // Customer name (check both name and first passenger name)
    if (!match(booking.name, customerName) && !match(booking.passengerName, customerName)) return false;
    // Phone
    if (!match(booking.phone, cxPhone)) return false;
    // Email
    if (!match(booking.email, customerEmail)) return false;
    // Alt phone
    if (!match(booking.altPhone, altPhone)) return false;
    // Passenger name — check all passengers, not just primary
    if (passengerName) {
      const paxText = String(passengerName).toLowerCase();
      const inPassengerName = booking.passengerName && String(booking.passengerName).toLowerCase().includes(paxText);
      const inName = booking.name && String(booking.name).toLowerCase().includes(paxText);
      if (!inPassengerName && !inName) return false;
    }
    // Agent — case-insensitive, 'All Agents' matches everything
    if (agent && agent !== 'All Agents') {
      const agentText = String(agent).toLowerCase();
      const matchAgent = booking.agent && String(booking.agent).toLowerCase().includes(agentText);
      const matchSaleBy = booking.saleBy && String(booking.saleBy).toLowerCase().includes(agentText);
      if (!matchAgent && !matchSaleBy) return false;
    }
    // Status — apply legacy normalization before comparing
    if (status) {
      const bookingStatus = normalizeStatus(booking.status);
      if (bookingStatus !== status && booking.status !== status) return false;
    }
    // Service — blank / 'All Services' matches everything
    if (service && service !== 'All Services') {
      const wanted = String(service).toLowerCase();
      const bookingService = normalizeService(booking.service).toLowerCase();
      if (!bookingService.includes(wanted)) return false;
    }
    // Date range
    if (fromDate && booking.date < fromDate) return false;
    if (toDate && booking.date > toDate) return false;

    return true;
  });
};


const pageStyles = `
.found-header { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 0.5rem 1.5rem; }
.found-ref { font-size: 1.1rem; font-weight: 700; color: var(--text-primary); }
.found-booking-status { font-size: 1.05rem; font-weight: 700; color: var(--primary-accent); }
.found-strip { display: flex; flex-wrap: wrap; gap: 0.35rem 1.75rem; font-size: 0.78rem; color: var(--text-secondary); }
.found-strip b { color: var(--text-primary); font-weight: 600; }
.status-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(165px, 1fr)); gap: 0.75rem 1rem; }
.found-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem 1.5rem; font-size: 0.78rem; color: var(--text-secondary); padding: 0.6rem 0; border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); }
.found-meta b { color: var(--text-primary); font-weight: 600; }
.meta-icons { display: flex; gap: 0.35rem; margin-left: auto; }
.meta-icon-btn { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); background: white; color: var(--text-secondary); cursor: pointer; }
.meta-icon-btn:hover { color: var(--primary-accent); border-color: var(--primary-accent); }
.cxid-heading { display: inline-flex; align-items: center; gap: 0.35rem; background: none; border: none; padding: 0; cursor: pointer; font-size: 0.95rem; font-weight: 700; color: #dd6b20; }
.cxid-heading:hover { text-decoration: underline; }
.cx-card { display: flex; flex-wrap: wrap; gap: 0.5rem 2rem; align-items: center; font-size: 0.85rem; color: var(--text-secondary); }
.cx-card b { color: var(--text-primary); font-weight: 600; margin-right: 0.35rem; }
.rel-toggle { display: inline-flex; align-items: center; gap: 0.4rem; background: none; border: none; padding: 0; cursor: pointer; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.03em; text-transform: uppercase; color: var(--text-secondary); }
.rel-toggle:hover { color: var(--primary-accent); }
.related-row { cursor: pointer; }
.related-row:hover { background-color: var(--bg-base); }
.flight-row { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr) auto; gap: 1rem 1.5rem; align-items: center; }
.leg-label { display: block; margin-bottom: 0.75rem; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: var(--text-secondary); }
.flight-code { font-size: 1.5rem; font-weight: 700; line-height: 1.1; color: var(--text-primary); }
.flight-time { font-size: 1.05rem; font-weight: 600; color: var(--text-primary); }
.flight-date { font-size: 0.72rem; color: var(--text-secondary); }
.flight-airport { font-size: 0.72rem; color: var(--text-secondary); }
.flight-mid { display: flex; flex-direction: column; align-items: center; gap: 0.15rem; color: var(--text-secondary); font-size: 0.72rem; white-space: nowrap; }
.flight-airline { display: flex; align-items: flex-start; gap: 0.6rem; justify-self: end; }
.airline-meta { font-size: 0.72rem; line-height: 1.4; color: var(--text-secondary); }
.airline-meta .airline-name { font-weight: 700; color: var(--text-primary); }
@media (max-width: 760px) {
  .flight-row { grid-template-columns: 1fr; }
  .flight-airline { justify-self: start; }
  .flight-mid { flex-direction: row; }
}
`;

const baseMockData = {
  service: DEFAULT_SERVICE,
  enquiryStatus: 'New', enquiryDate: '2026-07-01', enquiryCompletedDate: '2026-07-02',
  paymentStatus: 'Pending', workStatus: 'Pending', smsStatus: 'Pending', callStatus: 'Pending',
  crmAuditStatus: 'Pending', qualityAuditStatus: 'Pending', upcomingFollowUp: '2026-07-25',
  cbStatus: 'CB RECEIVED', saleDate: '2026-07-03', changeDate: '2026-07-20', chargeDate: '2026-07-03', merchantStatus: 'Pending',
  merchantName: 'ZSM TRAVEL USA', vendor: 'Standard', vendorCode: 'VND-STD',
  descriptor: 'Airline Tkt Infinity', gateway: 'Connex-pay',
  bookingSource: 'Airline', shift: 'Day', paymentBookingType: 'CX Credit Card',
  activityLog: [{ id: 1, type: 'Booking Created', note: 'Initial booking created', user: 'System', timestamp: '2026-07-03 10:00 AM' }]
};

const initialMockBookings = [
  { 
    ...baseMockData,
    id: 'ZSM-8942-B', refNo: 'A1708826527', cxId: 'CX-1001', pnr: 'G7X9K2', name: 'John Doe', passengerName: 'John Doe', email: 'john@example.com', phone: '555-0100', altPhone: '555-0101', agent: 'Agent A', saleBy: 'Agent A', status: 'Pending', date: '2026-07-18', travelDate: '2026-08-15', amount: '$380.50',
    tripType: 'Round Trip',
    airlinePnrs: [
      { airline: 'Delta Air Lines', pnr: 'G7X9K2', status: 'Confirmed' },
      { airline: 'American Airlines', pnr: 'K5R8T1', status: 'On Hold' },
    ],
    passengers: [
      { type: 'Adult', fullName: 'John Doe', gender: 'Male', dob: '11/16/1984', eTicket: '0062133536321', seat: '12A', carryOn: '1/1', checkInBag: '0/0', insurance: 'None' },
      { type: 'Adult', fullName: 'Rachel Rodgers', gender: 'Female', dob: '02/01/1979', eTicket: '0062133536203', seat: '12B', carryOn: '1/1', checkInBag: '0/0', insurance: 'Basic' },
    ],
    payment: { method: 'Customer Card', paymentType: 'Single Charge', paymentMode: 'CX Card', cardName: 'John Doe', cardType: 'Visa', cardLast4: '6812', cardExpiry: '07/27', agreed: true },
    pricing: { baseFare: 870.4, taxes: 601.5, serviceFee: 20, actualCost: 870.4, actualMCO: 601.5, totalCost: 1471.9, currency: 'USD' },
    billing: { name: 'John Doe', addressLine1: '527 W Jackson Ave', addressLine2: '', city: 'Lima', state: 'OH', zip: '45005', country: 'United States', phone: '555-0100', email: 'john@example.com' },
    costingHistory: [{ particular: 'New Booking', cost: '870.40', serviceCost: '601.50' }],
    outboundFlight: { airline: 'Delta Air Lines', flightNumber: 'DL101', departureAirport: 'JFK', departureDate: '2026-08-15', departureTime: '08:00 AM', arrivalAirport: 'LAX', arrivalDate: '2026-08-15', arrivalTime: '11:30 AM', duration: '5h 30m', cabinClass: 'Economy', stops: 'Non-stop', ticketStatus: 'Active', pnr: 'G7X9K2' },
    inboundFlight: { airline: 'Delta Air Lines', flightNumber: 'DL202', departureAirport: 'LAX', departureDate: '2026-08-22', departureTime: '02:00 PM', arrivalAirport: 'JFK', arrivalDate: '2026-08-22', arrivalTime: '10:15 PM', duration: '5h 15m', cabinClass: 'Economy', stops: 'Non-stop', ticketStatus: 'Active', pnr: 'G7X9K2' },
    itineraryChangeRequests: []
  },
  { 
    ...baseMockData,
    id: 'ZSM-1049-C', refNo: 'A1708826528', cxId: 'CX-1002', pnr: 'A4B2C9', name: 'Jane Smith', passengerName: 'Jane Smith', email: 'jane@example.com', phone: '555-0199', altPhone: '555-0299', agent: 'Agent B', saleBy: 'Agent B', status: 'Booking Confirmed', date: '2026-07-17', travelDate: '2026-09-10', amount: '$425.00',
    tripType: 'One Way',
    airlinePnrs: [{ airline: 'British Airways', pnr: 'A4B2C9', status: 'Confirmed' }],
    outboundFlight: { airline: 'British Airways', flightNumber: 'BA117', departureAirport: 'LHR', departureDate: '2026-09-10', departureTime: '09:15 AM', arrivalAirport: 'JFK', arrivalDate: '2026-09-10', arrivalTime: '12:05 PM', duration: '7h 50m', cabinClass: 'Premium Economy', stops: 'Non-stop', ticketStatus: 'Confirmed', pnr: 'A4B2C9' },
    itineraryChangeRequests: []
  },
  { 
    ...baseMockData,
    id: 'ZSM-2911-A', refNo: 'A1708826529', cxId: 'CX-1003', pnr: 'L8K1M3', name: 'Mike Ross', passengerName: 'Mike Ross', email: 'mike@example.com', phone: '555-0122', altPhone: '555-0322', agent: 'Agent A', saleBy: 'Agent A', status: 'Cancelled', date: '2026-07-15', travelDate: '2026-07-20', amount: '$0.00',
    tripType: 'Round Trip',
    airlinePnrs: [{ airline: 'Alaska Airlines', pnr: 'L8K1M3', status: 'Cancelled' }],
    outboundFlight: { airline: 'Alaska Airlines', flightNumber: 'AS231', departureAirport: 'SFO', departureDate: '2026-07-20', departureTime: '06:30 AM', arrivalAirport: 'SEA', arrivalDate: '2026-07-20', arrivalTime: '08:45 AM', duration: '2h 15m', cabinClass: 'Economy', stops: 'Non-stop', ticketStatus: 'Cancelled', pnr: 'L8K1M3' },
    inboundFlight: { airline: 'Alaska Airlines', flightNumber: 'AS442', departureAirport: 'SEA', departureDate: '2026-07-25', departureTime: '04:15 PM', arrivalAirport: 'SFO', arrivalDate: '2026-07-25', arrivalTime: '06:20 PM', duration: '2h 05m', cabinClass: 'Economy', stops: 'Non-stop', ticketStatus: 'Cancelled', pnr: 'L8K1M3' },
    itineraryChangeRequests: []
  },
  { 
    ...baseMockData,
    id: 'ZSM-3321-F', refNo: 'A1708826530', cxId: 'CX-1004', pnr: 'K9P2M4', name: 'Sarah Lee', passengerName: 'Sarah Lee', email: 'sarah@example.com', phone: '555-0455', altPhone: '', agent: 'Agent C', saleBy: 'Agent C', status: 'Completed', date: '2026-06-10', travelDate: '2026-07-05', amount: '$290.00',
    tripType: 'One Way',
    airlinePnrs: [{ airline: 'American Airlines', pnr: 'K9P2M4', status: 'Flown' }],
    outboundFlight: { airline: 'American Airlines', flightNumber: 'AA105', departureAirport: 'ORD', departureDate: '2026-07-05', departureTime: '10:00 AM', arrivalAirport: 'MIA', arrivalDate: '2026-07-05', arrivalTime: '02:00 PM', duration: '3h 00m', cabinClass: 'Economy', stops: 'Non-stop', ticketStatus: 'Flown', pnr: 'K9P2M4' },
    itineraryChangeRequests: []
  },
  { 
    ...baseMockData,
    id: 'ZSM-4455-H', refNo: 'A1708826531', cxId: 'CX-1005', pnr: 'J1T8L9', name: 'Robert King', passengerName: 'Robert King', email: 'robert@example.com', phone: '555-0677', altPhone: '', agent: 'Agent B', saleBy: 'Agent B', status: 'On Hold', date: '2026-07-20', travelDate: '2026-10-12', amount: '$540.00',
    tripType: 'Round Trip',
    airlinePnrs: [{ airline: 'American Airlines', pnr: 'J1T8L9', status: 'On Hold' }],
    outboundFlight: { airline: 'American Airlines', flightNumber: 'AA212', departureAirport: 'MIA', departureDate: '2026-10-12', departureTime: '07:00 AM', arrivalAirport: 'JFK', arrivalDate: '2026-10-12', arrivalTime: '10:00 AM', duration: '3h 00m', cabinClass: 'Economy', stops: 'Non-stop', ticketStatus: 'On Hold', pnr: 'J1T8L9' },
    inboundFlight: { airline: 'American Airlines', flightNumber: 'AA505', departureAirport: 'JFK', departureDate: '2026-10-19', departureTime: '01:30 PM', arrivalAirport: 'MIA', arrivalDate: '2026-10-19', arrivalTime: '04:30 PM', duration: '3h 00m', cabinClass: 'Economy', stops: 'Non-stop', ticketStatus: 'On Hold', pnr: 'J1T8L9' },
    itineraryChangeRequests: []
  },
];

const DETAIL_DEFAULTS = {
  enquiryStatus: 'New',
  enquiryDate: '',
  enquiryCompletedDate: '',
  paymentStatus: 'Pending',
  workStatus: 'In Progress',
  smsStatus: 'Pending',
  callStatus: 'Pending',
  crmAuditStatus: 'Pending',
  qualityAuditStatus: 'Pass Settle',
  merchantStatus: 'DIGIMAT',
  cbStatus: 'CB RECEIVED',
  saleDate: '',
  chargeDate: '',
  vendor: '',
  merchantName: '',
  vendorCode: '',
  activityLog: [],
  itineraryChangeRequests: [],
};

const serviceActions = [
  { name: 'Change Itinerary', bg: '#3b82f6', color: '#ffffff' }, // Blue
  { name: 'Cancellation for Refund', bg: '#ef4444', color: '#ffffff' }, // Red
  { name: 'Cancellation for Credit', bg: '#f97316', color: '#ffffff' }, // Orange
  { name: 'Name Correction', bg: '#8b5cf6', color: '#ffffff' }, // Purple
  { name: 'Seat Assign', bg: '#10b981', color: '#ffffff' }, // Emerald
  { name: 'Seat Upgrade', bg: '#059669', color: '#ffffff' }, // Dark Emerald
  { name: 'Add Baggage', bg: '#f59e0b', color: '#ffffff' }, // Amber
  { name: 'Add Seat and Baggage', bg: '#d97706', color: '#ffffff' }, // Dark Amber
  { name: 'Pet Booking', bg: '#ec4899', color: '#ffffff' }, // Pink
  { name: 'Minor Alone Booking', bg: '#06b6d4', color: '#ffffff' }, // Cyan
  { name: 'Checking Service', bg: '#64748b', color: '#ffffff' } // Slate
];

const SearchService = () => {
  const [searchParams] = useSearchParams();

  const [bookings, setBookings] = useState(initialMockBookings);
  const [bookingsLoaded, setBookingsLoaded] = useState(false);

  useEffect(() => {
    const loadBookings = async () => {
      // Fills Descriptor / Gateway / Source (etc.) on rows saved before those
      // fields existed, then returns the current list.
      const saved = await backfillBookingDetailFields();
      if (saved && saved.length > 0) {
        // Bookings created on /new-booking are mapped onto this page's row
        // shape so they can be found by Customer ID (CXId) or Booking ID.
        setBookings(normalizeBookingsForSearch(saved));
      } else {
        await saveBookings(initialMockBookings);
      }
      setBookingsLoaded(true);
    };
    loadBookings();
  }, []);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [bookingToConfirm, setBookingToConfirm] = useState(null);
  const [notification, setNotification] = useState('');
  
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailsStatus, setDetailsStatus] = useState('');
  const [showRelated, setShowRelated] = useState(true);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { canAccess } = usePermissions();
  const hasAutoOpened = useRef(false);
  
  // Check if current role can view card block
  const canViewCardBlock = 
    user.role === ROLES.SUPER_ADMIN || 
    user.role === ROLES.ADMIN || 
    user.role === ROLES.OPS_AGENT || 
    user.role === ROLES.FINANCE;
  
  // Older rows may predate some lifecycle fields; default them so the
  // dropdowns always render a value instead of a blank controlled select.
  const openDetails = (booking) => {
    const merchantStatus = normalizeMerchant(booking.merchantStatus || booking.merchantName);
    const withDefaults = {
      ...booking,
      ...DETAIL_DEFAULTS,
      status: normalizeStatus(booking.status),
      workStatus: normalizeOption(booking.workStatus, WORK_STATUSES),
      qualityAuditStatus: normalizeOption(booking.qualityAuditStatus, QUALITY_AUDIT_STATUSES),
      crmAuditStatus: normalizeOption(booking.crmAuditStatus, CRM_AUDIT_STATUSES, { Passed: 'Pass', Failed: 'Fail' }),
      cbStatus: normalizeOption(booking.cbStatus, CB_STATUSES),
      paymentStatus: normalizeOption(booking.paymentStatus, PAYMENT_STATUSES, LEGACY_PAYMENT_MAP),
      merchantStatus,
      merchantName: merchantStatus,
    };
    setSelectedBooking(withDefaults);
    setDetailsStatus(withDefaults.status);

    const detailData = mapBookingDetail(booking);
    setSelectedDetail(detailData);

    setShowRelated(true);
  };

  // Booking Detail action bar - every button opens a real existing workflow:
  // in-page modals for itinerary change / final confirmation, routed service
  // pages otherwise. Buttons whose feature the current role cannot access are
  // hidden (same FEATURE_PERMISSION_MAP the routes are guarded with).
  const detailActions = [
    { label: 'Change Itinerary', bg: '#3b82f6', featureKey: 'change-itinerary', onClick: () => setActiveAction('Change Itinerary') },
    { label: 'Cancel for Refund', bg: '#ef4444', featureKey: 'cancellation-refund', to: '/cancellation-refund' },
    { label: 'Cancel for Credit', bg: '#f97316', featureKey: 'cancellation-credit', to: '/cancellation-credit' },
    { label: 'Profile Info', bg: '#8b5cf6', featureKey: 'profile-info-change', to: '/profile-info-change' },
    { label: 'Upgrade Seat', bg: '#059669', featureKey: 'seat-upgrade', to: '/seat-upgrade' },
    { label: 'Assign Seat', bg: '#10b981', featureKey: 'seat-assign', to: '/seat-assign' },
    { label: 'Add Baggage', bg: '#f59e0b', featureKey: 'add-baggage', to: '/add-baggage' },
    { label: 'Add Insurance', bg: '#ec4899', featureKey: 'add-insurance', to: '/add-insurance' },
    { label: 'Send Final Confirmation', bg: '#334155', onClick: () => handleConfirmClick(selectedBooking) },
    { label: 'Boarding Pass', bg: '#db2777', featureKey: 'boarding-pass', to: '/reports/boarding-pass' },
  ];

  const detailQuery = selectedBooking
    ? `?bookingId=${encodeURIComponent(selectedBooking.refNo || selectedBooking.id || '')}&cxId=${encodeURIComponent(selectedBooking.cxId || '')}&pnr=${encodeURIComponent(selectedBooking.pnr || '')}`
    : '';

  const detailActionBar = selectedBooking ? (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
      {detailActions
        .filter(a => !a.featureKey || canAccess(a.featureKey))
        .map(a => (
          <button
            key={a.label}
            type="button"
            onClick={a.onClick || (() => navigate(`${a.to}${detailQuery}`))}
            style={{
              backgroundColor: a.bg,
              color: '#ffffff',
              border: 'none',
              padding: '0.55rem 0.9rem',
              borderRadius: '4px',
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            {a.label}
          </button>
        ))}
    </div>
  ) : null;

  const initialFilters = {
    cxId: searchParams.get('cxId') || '', 
    bookingId: searchParams.get('bookingId') || '', 
    pnr: '', 
    customerName: searchParams.get('customerName') || '', 
    cxPhone: '', 
    customerEmail: '',
    agent: '', altPhone: '', passengerName: '', fromDate: '', toDate: '', status: '',
    service: searchParams.get('service') || '',
  };

  const [activeFilters, setActiveFilters] = useState(initialFilters);
  const [isSearching, setIsSearching] = useState(false);
  const [activeAction, setActiveAction] = useState(null);
  
  // Change Itinerary State
  const [changeItineraryStep, setChangeItineraryStep] = useState(1);
  const [selectedLegToChange, setSelectedLegToChange] = useState('');
  const [changeRequestNote, setChangeRequestNote] = useState('');
  const [preferredNewDate, setPreferredNewDate] = useState('');

  const resetChangeItineraryState = () => {
    setChangeItineraryStep(1);
    setSelectedLegToChange('');
    setChangeRequestNote('');
    setPreferredNewDate('');
    setActiveAction(null);
  };

  // Runs a search against an explicit filter set. A Customer Id / Booking Id
  // search that lands on a single record opens the found page directly, unless
  // autoOpen is disabled (the "All Bookings Of CXID" link wants the table).
  const applySearch = (nextFilters, { autoOpen = true } = {}) => {
    setIsSearching(true);
    setTimeout(() => {
      setActiveFilters(nextFilters);
      setIsSearching(false);
      if (!autoOpen) return;
      const matches = filterBookings(bookings, nextFilters);
      if (matches.length === 1 && (nextFilters.cxId || nextFilters.bookingId || nextFilters.cxPhone)) {
        openDetails(matches[0]);
      }
    }, 500);
  };

  // Deep link from the Dashboard (/search?cxId=... or ?bookingId=...) opens the
  // found page once, after the booking list has loaded.
  useEffect(() => {
    if (!bookingsLoaded || hasAutoOpened.current || selectedBooking) return;
    hasAutoOpened.current = true;
    const query = activeFilters.cxId || activeFilters.bookingId || activeFilters.cxPhone;
    if (!query) return;
    const matches = filterBookings(bookings, activeFilters);
    if (matches.length === 1) {
      openDetails(matches[0]);
    }
  }, [bookingsLoaded, bookings, activeFilters, selectedBooking]);

  const handleClear = () => {
    setActiveFilters(initialFilters);
    setSelectedBooking(null);
  };

  const copyReference = async () => {
    const booking = selectedBooking;
    const text = [
      `Ref No: ${booking.refNo}`,
      `Booking ID: ${booking.id}`,
      `CX ID: ${booking.cxId}`,
      `PNR: ${booking.pnr}`,
      `Sale Date: ${booking.saleDate || booking.date || '—'}`,
      `Charge Date: ${booking.chargeDate || '—'}`,
      `Vendor: ${booking.vendorCode || booking.vendor || '—'}`,
    ].join(' | ');
    try {
      await navigator.clipboard.writeText(text);
      setNotification('Booking reference copied to clipboard.');
    } catch {
      setNotification('Unable to copy booking reference.');
    }
    setTimeout(() => setNotification(''), 3000);
  };

  const handleConfirmClick = (booking) => {
    setBookingToConfirm(booking);
    setIsConfirmModalOpen(true);
  };

  const confirmBooking = async () => {
    if (!bookingToConfirm) return;
    
    const confirmed = { ...bookingToConfirm, status: 'Charged' };
    const updatedBookings = bookings.map(b => 
      b.id === bookingToConfirm.id ? confirmed : b
    );
    
    setBookings(updatedBookings);
    await saveBooking(confirmed);
    
    setIsConfirmModalOpen(false);
    setBookingToConfirm(null);
    setNotification('Booking confirmed successfully.');
    
    setTimeout(() => setNotification(''), 3000);
  };

  const updateBookingStatus = async () => {
    if (!selectedBooking) return;
    
    const updatedSelected = { ...selectedBooking, status: detailsStatus };
    const newActivity = {
      id: Math.floor(Math.random() * 100000),
      type: 'Lifecycle Update',
      note: 'Booking statuses and lifecycle properties updated.',
      user: 'Current User',
      timestamp: new Date().toLocaleString()
    };
    
    updatedSelected.activityLog = [...(updatedSelected.activityLog || []), newActivity];
    
    const updatedBookings = bookings.map(b => 
      b.id === selectedBooking.id ? updatedSelected : b
    );
    
    setBookings(updatedBookings);
    await saveBooking(updatedSelected);
    setSelectedBooking(updatedSelected);
    
    setNotification('Booking lifecycle updated successfully.');
    setTimeout(() => setNotification(''), 3000);
  };

  const submitChangeItinerary = async () => {
    if (!selectedLegToChange) return;
    
    const newRequest = {
      id: `REQ-${Math.floor(Math.random() * 10000)}`,
      type: selectedLegToChange,
      note: changeRequestNote,
      preferredDate: preferredNewDate,
      status: 'Pending',
      createdAt: new Date().toLocaleString(),
      agent: 'Current User'
    };
    
    const updatedBookings = bookings.map(b => {
      if (b.id === selectedBooking.id) {
        const currentRequests = b.itineraryChangeRequests || [];
        const currentLog = b.activityLog || [];
        
        const activityEvent = {
          id: Math.floor(Math.random() * 100000),
          type: 'Itinerary Changed',
          note: `Requested change for ${selectedLegToChange}. Notes: ${changeRequestNote}`,
          user: 'Current User',
          timestamp: new Date().toLocaleString()
        };

        return { 
          ...b, 
          itineraryChangeRequests: [...currentRequests, newRequest],
          activityLog: [...currentLog, activityEvent]
        };
      }
      return b;
    });
    
    setBookings(updatedBookings);
    const updatedSelected = updatedBookings.find(b => b.id === selectedBooking.id);
    await saveBooking(updatedSelected);
    setSelectedBooking(updatedSelected);
    
    resetChangeItineraryState();
    setNotification('Change Itinerary request submitted successfully.');
    setTimeout(() => setNotification(''), 3000);
  };

  const filteredBookings = filterBookings(bookings, activeFilters);
  const relatedBookings = selectedBooking
    ? bookings.filter((booking) => booking.cxId && booking.cxId === selectedBooking.cxId)
    : [];

  return (
    <div className="page-container">
      <style>{pageStyles}</style>
      {!selectedBooking ? (
        /* Results Table */
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="card-title">Recent Bookings</h2>
            <span className="text-secondary text-sm">Showing {filteredBookings.length} result(s)</span>
          </div>
          
          {isSearching ? (
             <div style={{ padding: '4rem', textAlign: 'center', color: mutedColor }}>
               <Loader2 size={48} className="spin" style={{ margin: '0 auto 1rem', animation: 'spin 1s linear infinite', color: 'var(--primary-accent)' }} />
               <p style={{ fontSize: '1.125rem' }}>Searching bookings...</p>
             </div>
          ) : filteredBookings.length === 0 ? (
             <div style={{ padding: '4rem', textAlign: 'center', color: mutedColor }}>
               <ShieldAlert size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
               <p style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>No bookings found</p>
               <p className="mb-4">Try adjusting your search filters to find what you're looking for.</p>
               <button onClick={handleClear} className="btn btn-secondary">Clear All Filters</button>
             </div>
          ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td style={{ fontWeight: 600, color: 'var(--primary-accent)' }}>
                      {booking.id}
                      <div className="text-secondary" style={{ fontSize: '0.75rem', fontWeight: 400 }}>{normalizeService(booking.service)}</div>
                    </td>
                    <td>
                      <div>{booking.name}</div>
                      <div className="text-secondary" style={{ fontSize: '0.75rem' }}>CX: {booking.cxId}</div>
                    </td>
                    <td>
                      <div className="text-secondary" style={{ fontSize: '0.875rem' }}>{booking.email}</div>
                      <div className="text-secondary" style={{ fontSize: '0.875rem' }}>{booking.phone}</div>
                    </td>
                    <td>
                      <div>{booking.date}</div>
                      <div className="text-secondary" style={{ fontSize: '0.75rem' }}>Agent: {booking.agent}</div>
                    </td>
                    <td>
                      <span className={badgeClass(booking.status)}>
                        {booking.status}
                      </span>
                    </td>
                    <td>
                      <div>{booking.amount}</div>
                      <div className="text-secondary" style={{ fontSize: '0.75rem' }}>PNR: {booking.pnr}</div>
                    </td>
                    <td>
                      <div className="flex gap-2" style={{ alignItems: 'center' }}>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                          onClick={() => openDetails(booking)}
                        >
                          View Details
                        </button>
                        {booking.status === 'Pending' ? (
                          <button 
                            className="btn btn-primary" 
                            style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'var(--primary-accent)', color: 'white', border: 'none' }}
                            onClick={() => handleConfirmClick(booking)}
                          >
                            Confirm Booking
                          </button>
                        ) : (booking.status === 'Booking Confirmed' || booking.status === 'Charged') ? (
                          <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                            {booking.status} ✓
                          </span>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>
      ) : (
        /* Booking Details View */
        <div className="animate-fade-in">
          <button 
            className="btn btn-secondary mb-4" 
            onClick={() => setSelectedBooking(null)}
          >
            ← Back to Results
          </button>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Main Content */}
            <div className="flex-col gap-4" style={{ display: 'flex' }}>
              {/* Header Info */}
              <div className="found-header">
                <div className="found-ref">Ref No: {selectedBooking.refNo}</div>
                <div className="found-booking-status">Booking Status: {selectedBooking.status}</div>
              </div>

              {/* Enquiry strip */}
              <div className="found-strip">
                <span>Service: <b>{normalizeService(selectedBooking.service)}</b></span>
                <span>Enquiry status: <b>{selectedBooking.enquiryStatus || 'New'}</b></span>
                <span>Enquiry Referred date: <b>{selectedBooking.enquiryDate || '—'}</b></span>
                <span>Enquiry completed date: <b>{selectedBooking.enquiryCompletedDate || '—'}</b></span>
              </div>

              {/* Status dropdowns */}
              <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
                <div className="status-grid">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>Booking Status</label>
                <select className="form-input" value={detailsStatus} onChange={(e) => setDetailsStatus(e.target.value)}>
                  {BOOKING_STATUSES.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>Payment Status</label>
                    <select className="form-input" value={selectedBooking.paymentStatus} onChange={(e) => setSelectedBooking({...selectedBooking, paymentStatus: e.target.value})}>
                      {PAYMENT_STATUSES.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>Work Status</label>
                        <select className="form-input" value={selectedBooking.workStatus} onChange={(e) => setSelectedBooking({...selectedBooking, workStatus: e.target.value})}>
                          {WORK_STATUSES.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>SMS Status</label>
                    <select className="form-input" value={selectedBooking.smsStatus} onChange={(e) => setSelectedBooking({...selectedBooking, smsStatus: e.target.value})}>
                      <option value="Pending">Pending</option>
                      <option value="Sent">Sent</option>
                      <option value="Failed">Failed</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>Call Status</label>
                    <select className="form-input" value={selectedBooking.callStatus} onChange={(e) => setSelectedBooking({...selectedBooking, callStatus: e.target.value})}>
                      <option value="Pending">Pending</option>
                      <option value="Contacted">Contacted</option>
                      <option value="No Answer">No Answer</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>CRM Audit Status</label>
                        <select className="form-input" value={selectedBooking.crmAuditStatus} onChange={(e) => setSelectedBooking({...selectedBooking, crmAuditStatus: e.target.value})}>
                          {CRM_AUDIT_STATUSES.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>Merchant</label>
                        <select className="form-input" value={selectedBooking.merchantStatus} onChange={(e) => setSelectedBooking({...selectedBooking, merchantStatus: e.target.value, merchantName: e.target.value})}>
                          {MERCHANTS.map((merchant) => (
                            <option key={merchant} value={merchant}>{merchant}</option>
                          ))}
                        </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>Quality Audit Status</label>
                        <select className="form-input" value={selectedBooking.qualityAuditStatus} onChange={(e) => setSelectedBooking({...selectedBooking, qualityAuditStatus: e.target.value})}>
                          {QUALITY_AUDIT_STATUSES.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>CB Status</label>
                        <select className="form-input" value={selectedBooking.cbStatus} onChange={(e) => setSelectedBooking({...selectedBooking, cbStatus: e.target.value})}>
                          {CB_STATUSES.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                  </div>
                </div>
                <div className="flex justify-end" style={{ marginTop: '1.25rem' }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => updateBookingStatus(selectedBooking)}
                    style={{ padding: '0.75rem 2rem', fontWeight: 600 }}
                  >
                    Save Lifecycle Changes
                  </button>
                </div>
              </div>

              {/* Sale / charge meta line */}
              <div className="found-meta" style={{ backgroundColor: '#f4f5e7', padding: '1rem 1.5rem', borderRadius: '0 0 var(--radius-sm) var(--radius-sm)' }}>
    <span>Sale By : <b>{selectedBooking.saleBy || selectedBooking.agent}</b></span>
    <span>Sale Date : <b>{selectedBooking.saleDate || selectedBooking.date || '—'}</b></span>
    <span>Charge Date : <b>{selectedBooking.chargeDate || '—'}</b></span>
    <span>Vendor : <b>{selectedBooking.vendorCode || selectedBooking.vendor || '—'}</b></span>
    <span className="meta-icons" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <button style={{ backgroundColor: '#334155', color: 'white', border: 'none', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>ESIGN</button>
      <button type="button" className="meta-icon-btn" style={{ backgroundColor: '#10b981', color: 'white', border: 'none' }} title="Copy booking reference" onClick={copyReference}>
        <Copy size={14} />
      </button>
      <button type="button" className="meta-icon-btn" style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none' }} title="Print" onClick={() => window.print()}>
        <Printer size={14} />
      </button>
    </span>
  </div>

              {/* Booking Detail card - rendered from mapped detail data */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Booking Detail</h3>

                {selectedDetail ? renderBookingDetailCard(selectedDetail, { canViewPII: canViewCardBlock, actionBar: detailActionBar }) : (
                  <div style={{ height: '8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    <Loader2 size={24} className="spin" style={{ marginRight: '0.5rem' }} /> Loading detail data...
                  </div>
                )}
              </div>

{/* All bookings for this customer */}
                <button
                type="button"
                className="cxid-heading"
                onClick={() => {
              const nextFilters = { ...initialFilters, cxId: selectedBooking.cxId };
              setSelectedBooking(null);
                  applySearch(nextFilters, { autoOpen: false });
                }}
              >
                All Bookings Of CXID: {selectedBooking.cxId}
              </button>

              {/* Customer card + related bookings */}
              <div className="card">
                <div className="cx-card">
                  <span><b>CX ID:</b>{selectedBooking.cxId || '—'}</span>
                  <span><b>Name:</b>{selectedBooking.name || '—'}</span>
                  <span><b>Email:</b>{selectedBooking.email || '—'}</span>
                  <span><b>Phone:</b>{selectedBooking.phone || '—'}</span>
                  <span><b>Alt Phone:</b>{selectedBooking.altPhone || 'N/A'}</span>
                </div>

                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                  <button type="button" className="rel-toggle" onClick={() => setShowRelated((value) => !value)}>
                    {showRelated ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    All Related Booking Detail
                  </button>

                  {showRelated && (
                    relatedBookings.length > 0 ? (
                      <div className="table-container" style={{ marginTop: '0.75rem' }}>
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>BID</th>
                              <th>PNR</th>
                              <th>Booking Type</th>
                              <th>Created At</th>
                              <th>Agent</th>
                              <th>MCO</th>
                              <th>Transaction Status</th>
                              <th>Warning Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {relatedBookings.map((booking) => (
                              <tr key={booking.id} className="related-row" onClick={() => openDetails(booking)}>
                                <td style={{ fontWeight: 600, color: 'var(--primary-accent)' }}>{booking.id}</td>
                                <td>{booking.pnr || '—'}</td>
                                <td>{booking.tripType || '—'}</td>
                                <td>{booking.date || '—'}</td>
                                <td>{booking.agent || '—'}</td>
                                <td>{mcoFor(booking)}</td>
                                <td><span className={badgeClass(booking.status)}>{booking.status}</span></td>
                                <td>{warningFor(booking)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        No other bookings found for this customer.
                      </p>
                    )
                  )}
                </div>
              </div>
              {/* Current Itinerary */}
              <div className="card">
                <h2 className="card-title mb-4">Current Itinerary</h2>

                {/* Outbound */}
                {selectedBooking.outboundFlight && (
                  <div className="mb-6">
                    <h3 className="leg-label">Outbound Flight</h3>
                    <FlightLeg flight={selectedBooking.outboundFlight} />
                  </div>
                )}

                {/* Inbound */}
                {selectedBooking.inboundFlight && (
                  <div>
                    <h3 className="leg-label">Inbound Flight</h3>
                    <FlightLeg flight={selectedBooking.inboundFlight} />
                  </div>
                )}

                {!selectedBooking.outboundFlight && !selectedBooking.inboundFlight && (
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>No itinerary has been recorded for this booking.</p>
                )}
              </div>
              
              
              {/* CONNEXPAY Section */}
              <div className="card">
                <div style={{ backgroundColor: '#f0f4a8', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>CONNEXPAY</h3>
                  <ul style={{ fontSize: '0.85rem', color: 'var(--text-primary)', margin: 0, paddingLeft: '1.5rem' }}>
                    <li>1st Make Sale From Connexpay Charge Button(Charge Amount will Be Net Amount(Airline Cost Amount))</li>
                    <li>2nd Mention No Of Cards, You want to Create Including Card Amount Limit and mention the card you gonna using for Airline or Hotel or Cars Reservation.</li>
                    <li>3rd Issue Card one By one.</li>
                  </ul>
                </div>
                <div style={{ padding: '1rem' }}>
                  <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>CONNEXPAY SALE DETAIL</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <div style={{ color: 'var(--text-secondary)' }}>Sale Status</div><div>Transaction - Approved</div>
                    <div style={{ color: 'var(--text-secondary)' }}>Sale Time</div><div>2024-02-24T21:58:54.56-05:00</div>
                    <div style={{ color: 'var(--text-secondary)' }}>Sale Amount</div><div>$ 601.6</div>
                    <div style={{ color: 'var(--text-secondary)' }}>Sale Guid</div><div>4f7351ed-d3f6-4fb4-bf7d-b6541f938676</div>
                    <div style={{ color: 'var(--text-secondary)' }}>Incoming Tran Code</div><div>10A69BC638444087358272937</div>
                  </div>
                  <div style={{ marginTop: '1rem' }}>
                    <button style={{ background: 'none', border: 'none', color: '#10b981', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: 0 }}>
                      <ChevronDown size={14} /> CREATE NO OF CARD
                    </button>
                  </div>
                </div>
              </div>

              {/* Manage Cards */}
              <div className="card">
                <h2 className="card-title mb-4">Manage Cards</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-color)', borderTop: '1px solid var(--border-color)' }}>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600 }}>Use Case</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600 }}>Card Info</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600 }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan="3" style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>No cards found</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* VISITING ACTIVITY */}
              <div className="card">
                <h2 className="card-title mb-4" style={{ textTransform: 'uppercase', fontSize: '0.875rem' }}>VISITING ACTIVITY</h2>
                <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                  <button style={{ width: '100%', padding: '0.75rem 1rem', background: '#f8fafc', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3b82f6', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', textAlign: 'left' }}>
                    <ChevronDown size={14} /> ALL VISITING ACTIVITY
                  </button>
                </div>
              </div>

              {/* E-Sign Detail */}
              <div className="card">
                <h2 className="card-title mb-4">E-Sign Detail</h2>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600 }}>E-Sign Subject</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600 }}>Status</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600 }}>Completed At</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600 }}>IP Address</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600 }}>Completed Document</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600 }}>Certificate</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '1rem' }}>AMERICAN AIRLINES Ref No - #{selectedBooking?.refNo} - The Infinity Travel</td>
                        <td style={{ padding: '1rem' }}>SIGNED</td>
                        <td style={{ padding: '1rem' }}>2024-02-24<br/>18:23:26</td>
                        <td style={{ padding: '1rem' }}>108.145.164.10</td>
                        <td style={{ padding: '1rem' }}>
                          <button style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>VIEW COMPLETED<br/>DOCUMENT</button>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <button style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>GENERATE &amp;<br/>DOWNLOAD<br/>CERTIFICATE</button>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '1rem' }}>AMERICAN AIRLINES Ref No - #{selectedBooking?.refNo} - The Infinity Travel</td>
                        <td style={{ padding: '1rem' }}>SIGNED</td>
                        <td style={{ padding: '1rem' }}>2024-02-24<br/>18:57:42</td>
                        <td style={{ padding: '1rem' }}>108.145.164.10</td>
                        <td style={{ padding: '1rem' }}>
                          <button style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>VIEW COMPLETED<br/>DOCUMENT</button>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <button style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>GENERATE &amp;<br/>DOWNLOAD<br/>CERTIFICATE</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Booking History / Activity Log */}
              {selectedBooking.activityLog && selectedBooking.activityLog.length > 0 && (
                <div className="card mt-4">
                  <h2 className="card-title mb-4">Booking Activity History</h2>
                  <div className="flex-col gap-4" style={{ display: 'flex' }}>
                    {selectedBooking.activityLog.map(log => (
                      <div key={log.id} style={{ padding: '1rem', borderLeft: '4px solid var(--primary-accent)', backgroundColor: 'var(--bg-base)', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0' }}>
                        <div className="flex justify-between items-center mb-1">
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{log.type}</span>
                          <span className="text-secondary text-sm">{log.timestamp}</span>
                        </div>
                        <div className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                          <User size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }}/> 
                          {log.user}
                        </div>
                        <div style={{ backgroundColor: 'white', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                          {log.note}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Section: Actions */}
            <div className="card" style={{ backgroundColor: 'var(--bg-elevated)', marginTop: '1rem' }}>
              <h2 className="card-title mb-4 flex items-center gap-2">
                <ShieldAlert size={18} className="text-warning" />
                Service Actions
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                {serviceActions.map((action, idx) => (
                  <button 
                    key={idx} 
                    style={{ 
                      backgroundColor: action.bg, 
                      color: action.color, 
                      width: '100%', 
                      textAlign: 'center', 
                      padding: '0.75rem', 
                      fontWeight: 600,
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      transition: 'transform 0.2s, filter 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
                    onMouseOut={(e) => e.currentTarget.style.filter = 'brightness(1)'}
                    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    onClick={() => setActiveAction(action.name)}
                  >
                    {action.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Dynamic Action Modals */}
      {activeAction === 'Change Itinerary' && selectedBooking && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 className="card-title mb-4">Change Itinerary Request</h2>
            
            {changeItineraryStep === 1 ? (
              <>
                <div style={{ backgroundColor: 'var(--bg-base)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                  <h3 className="text-sm text-secondary" style={{ textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.5rem' }}>Current Itinerary</h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: selectedBooking.tripType === 'Round Trip' ? '1fr 1fr' : '1fr', gap: '1rem' }}>
                    {/* Outbound */}
                    <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Outbound: {selectedBooking.outboundFlight.departureAirport} → {selectedBooking.outboundFlight.arrivalAirport}</div>
                      <div className="text-secondary text-sm">{selectedBooking.outboundFlight.airline} {selectedBooking.outboundFlight.flightNumber}</div>
                      <div className="text-secondary text-sm">{selectedBooking.outboundFlight.departureDate}</div>
                    </div>
                    
                    {/* Inbound */}
                    {selectedBooking.inboundFlight && (
                      <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                        <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Inbound: {selectedBooking.inboundFlight.departureAirport} → {selectedBooking.inboundFlight.arrivalAirport}</div>
                        <div className="text-secondary text-sm">{selectedBooking.inboundFlight.airline} {selectedBooking.inboundFlight.flightNumber}</div>
                        <div className="text-secondary text-sm">{selectedBooking.inboundFlight.departureDate}</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group mb-6">
                  <label className="form-label" style={{ fontWeight: 600 }}>Which itinerary do you want to change? <span className="text-danger">*</span></label>
                  <div className="flex-col gap-2" style={{ display: 'flex', marginTop: '0.5rem' }}>
                    <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                      <input type="radio" name="leg" value="Outbound Flight" checked={selectedLegToChange === 'Outbound Flight'} onChange={(e) => setSelectedLegToChange(e.target.value)} />
                      Outbound Flight
                    </label>
                    {selectedBooking.tripType === 'Round Trip' && (
                      <>
                        <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                          <input type="radio" name="leg" value="Inbound Flight" checked={selectedLegToChange === 'Inbound Flight'} onChange={(e) => setSelectedLegToChange(e.target.value)} />
                          Inbound Flight
                        </label>
                        <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                          <input type="radio" name="leg" value="Both Outbound and Inbound Flights" checked={selectedLegToChange === 'Both Outbound and Inbound Flights'} onChange={(e) => setSelectedLegToChange(e.target.value)} />
                          Both Outbound and Inbound Flights
                        </label>
                      </>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>What would you like to change? <span className="text-danger">*</span></label>
                  <textarea 
                    className="form-input" 
                    rows="4" 
                    placeholder="Please describe the changes you would like to make to your itinerary (e.g., Change travel date, departure time, flight, destination, etc.)..."
                    value={changeRequestNote}
                    onChange={(e) => setChangeRequestNote(e.target.value)}
                  ></textarea>
                </div>
                
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Preferred New Date (Optional)</label>
                  <input type="date" className="form-input" value={preferredNewDate} onChange={(e) => setPreferredNewDate(e.target.value)} />
                </div>

                <div className="flex justify-between mt-6 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                  <button className="btn btn-secondary" onClick={resetChangeItineraryState}>Cancel</button>
                  <button 
                    className="btn btn-primary" 
                    disabled={!selectedLegToChange || !changeRequestNote}
                    onClick={() => setChangeItineraryStep(2)}
                    style={{ opacity: (!selectedLegToChange || !changeRequestNote) ? 0.5 : 1 }}
                  >
                    Review Changes →
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ backgroundColor: 'var(--bg-base)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontWeight: 600, marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Request Summary</h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.75rem', fontSize: '0.875rem' }}>
                    <div className="text-secondary">Booking ID:</div>
                    <div style={{ fontWeight: 500 }}>{selectedBooking.id}</div>
                    
                    <div className="text-secondary">PNR:</div>
                    <div style={{ fontWeight: 500 }}>{selectedBooking.pnr}</div>
                    
                    <div className="text-secondary">Selected Itinerary:</div>
                    <div style={{ fontWeight: 500, color: 'var(--primary-accent)' }}>{selectedLegToChange}</div>
                    
                    <div className="text-secondary">Current Route:</div>
                    <div>{selectedBooking.outboundFlight.departureAirport} → {selectedBooking.outboundFlight.arrivalAirport} {selectedBooking.inboundFlight && `(Round Trip)`}</div>
                    
                    <div className="text-secondary mt-2">Requested Change:</div>
                    <div className="mt-2" style={{ backgroundColor: 'white', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                      {changeRequestNote}
                      {preferredNewDate && <div className="mt-2 text-primary text-sm font-medium">Preferred Date: {preferredNewDate}</div>}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-6 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                  <button className="btn btn-secondary" onClick={() => setChangeItineraryStep(1)}>← Back to Edit</button>
                  <button className="btn btn-primary" onClick={submitChangeItinerary}>Submit Change Request</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      
      {activeAction && activeAction !== 'Change Itinerary' && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px' }}>
            <h2 className="card-title mb-4">{activeAction}</h2>
            <p className="text-secondary mb-6">You are initiating the <strong>{activeAction}</strong> workflow for booking <strong>{selectedBooking?.id}</strong>. This action may result in additional charges or refunds to the customer.</p>
            
            <div className="form-group">
              <label className="form-label">Internal Notes / Reason</label>
              <textarea className="form-input" rows="3" placeholder="Explain why this action is being taken..."></textarea>
            </div>
            
            <div className="flex justify-between mt-6">
              <button className="btn btn-secondary" onClick={() => setActiveAction(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => setActiveAction(null)}>Proceed</button>
            </div>
          </div>
        </div>
      )}

      {isConfirmModalOpen && bookingToConfirm && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110 }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px' }}>
            <h2 className="card-title mb-4">Confirm Booking</h2>
            <p className="text-secondary mb-6">Are you sure you want to confirm this booking?</p>
            
            <div style={{ backgroundColor: 'var(--bg-base)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <div className="text-secondary text-sm">Booking ID</div>
                  <div style={{ fontWeight: 600 }}>{bookingToConfirm.id}</div>
                </div>
                <div>
                  <div className="text-secondary text-sm">PNR</div>
                  <div style={{ fontWeight: 600 }}>{bookingToConfirm.pnr}</div>
                </div>
                <div>
                  <div className="text-secondary text-sm">Customer Name</div>
                  <div>{bookingToConfirm.name}</div>
                </div>
                <div>
                  <div className="text-secondary text-sm">Passenger Name</div>
                  <div>{bookingToConfirm.passengerName}</div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div className="text-secondary text-sm">Flight/Itinerary</div>
                  <div>{bookingToConfirm.flight}</div>
                </div>
                <div>
                  <div className="text-secondary text-sm">Travel Date</div>
                  <div>{bookingToConfirm.travelDate}</div>
                </div>
                <div>
                  <div className="text-secondary text-sm">Total Amount</div>
                  <div style={{ fontWeight: 600, color: 'var(--success)' }}>{bookingToConfirm.amount}</div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between">
              <button className="btn btn-secondary" onClick={() => setIsConfirmModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={confirmBooking}>Confirm Booking</button>
            </div>
          </div>
        </div>
      )}

      {notification && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', backgroundColor: 'var(--success)', color: 'white', padding: '1rem 2rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', zIndex: 200, display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }} className="animate-fade-in">
          ✓ {notification}
        </div>
      )}
    </div>
  );
};

export default SearchService;
