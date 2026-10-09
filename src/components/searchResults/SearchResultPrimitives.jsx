import React from 'react';
import { AlertTriangle, Loader2, Plane, Search } from 'lucide-react';

export const DASH = '—';

export const NOT_AVAILABLE = 'Not Available';

export const formatMoney = (value, currency = 'USD') => {
  if (value === null || value === undefined || value === '' || !Number.isFinite(Number(value))) return null;
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(Number(value));
  } catch {
    return `$${Number(value).toFixed(2)}`;
  }
};

// Status pill vocabulary — consistent across every result surface.
const STATUS_STYLES = {
  Available: 'badge-info',
  Active: 'badge-success',
  Pending: 'badge-warning',
  Charged: 'badge-success',
  'Booking Confirmed': 'badge-success',
  Confirmed: 'badge-success',
  Ticketed: 'badge-success',
  Completed: 'badge-success',
  'On Hold': 'badge-warning',
  Cancelled: 'badge-danger',
  Decline: 'badge-danger',
  Refunded: 'badge-primary',
  Unknown: 'badge-warning',
  Delayed: 'badge-warning',
};

export const StatusBadge = ({ label, value }) => {
  if (!value) return null;
  const text = String(value);
  const className = STATUS_STYLES[text] || 'badge-primary';
  return (
    <span className={`badge ${className}`} title={label ? `${label}: ${text}` : text}>
      {label ? `${label}: ${text}` : text}
    </span>
  );
};

export const AvailabilityBadge = ({ value }) => {
  if (!value) return null;
  return <span className="badge badge-info">{value}</span>;
};

// Uppercase section heading used inside the expanded card (BOOKING DETAIL…).
// `anchor` lets secondary actions scroll straight to a section (plan §15).
export const SectionCard = ({ title, anchor, children, action = null }) => (
  <section className="sr-section" data-section={anchor} aria-label={title}>
    <div className="sr-section-head">
      <h4 className="sr-section-title">{title}</h4>
      {action}
    </div>
    {children}
  </section>
);

// Responsive label/value grid. Missing values render as "Not Available"
// instead of an empty or broken cell (partial-data rule).
export const FieldGrid = ({ fields, columns = 3 }) => (
  <div
    className="sr-field-grid"
    style={{ gridTemplateColumns: `repeat(auto-fit, minmax(${columns > 2 ? 170 : 200}px, 1fr))` }}
  >
    {fields.filter(Boolean).map(({ label, value }) => (
      <div className="sr-field" key={label}>
        <span className="sr-field-label">{label}</span>
        <span className={`sr-field-value${value ? '' : ' is-empty'}`}>
          {value === null || value === undefined || String(value).trim() === '' ? NOT_AVAILABLE : String(value)}
        </span>
      </div>
    ))}
  </div>
);

// ── Result states ───────────────────────────────────────────────────────────

export const ResultSkeletonCard = ({ index = 1 }) => (
  <div className="sr-card sr-skeleton" aria-hidden="true">
    <div className="sr-skeleton-line w40" />
    <div className="sr-skeleton-line w70" />
    <div className="sr-skeleton-line w90" />
    <div className="sr-skeleton-line w60" />
    <span className="sr-skeleton-tag">Combination #{index}</span>
  </div>
);

export const LoadingResults = ({ count = 3 }) => (
  <div className="sr-list" role="status" aria-live="polite">
    <div className="sr-state-note">
      <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
      Searching available flights…
    </div>
    {Array.from({ length: count }, (_, i) => <ResultSkeletonCard key={i} index={i + 1} />)}
  </div>
);

export const EmptyResults = ({ query }) => (
  <div className="sr-card sr-state" role="status">
    <div className="sr-state-icon"><Search size={22} /></div>
    <h4>No flights found</h4>
    <p>
      Try changing your dates, airports, cabin class, or number of passengers
      {query ? ` for “${query}”.` : '.'}
    </p>
  </div>
);

export const EmptySearchState = EmptyResults;


export const ErrorResults = ({ message, onRetry }) => (
  <div className="sr-card sr-state sr-state-error" role="alert">
    <div className="sr-state-icon"><AlertTriangle size={22} /></div>
    <h4>We couldn’t retrieve flight availability.</h4>
    <p>{message || 'Please try again.'}</p>
    {onRetry && (
      <button type="button" className="btn btn-secondary" onClick={onRetry}>
        Retry search
      </button>
    )}
  </div>
);

// Airline badge — logo when the backend supplies one, code initials otherwise.
export const AirlineBadge = ({ name, code, logo, size = 34 }) => {
  if (logo && /^https?:\/\//i.test(logo)) {
    return <img className="sr-airline-logo" src={logo} alt={name || code || 'Airline'} style={{ width: size, height: size }} />;
  }
  const initials = String(code || name || '?').slice(0, 2).toUpperCase();
  return (
    <span
      className="sr-airline-mark"
      style={{ width: size, height: size, background: logo || '#1a202c' }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
};

export const AirlineMark = AirlineBadge;


export const PlaneDivider = ({ duration, stops, connection = false }) => (
  <div className={`sr-seg-mid${connection ? ' is-connection' : ''}`}>
    <span className="sr-seg-duration">{duration}</span>
    <span className="sr-seg-plane" aria-hidden="true"><Plane size={14} /></span>
    {stops ? <span className="sr-seg-stops">{stops}</span> : null}
  </div>
);
