import React from 'react';

/**
 * SearchSummary — echoes the criteria the user actually submitted on
 * /new-booking. Fields the form never collected are omitted rather than
 * rendered empty (plan §2 / §27: no fabricated criteria).
 */
export const SearchSummary = ({
  tripType,
  direction,
  query,
  from,
  to,
  cabin,
  passengers,
}) => {
  const items = [
    tripType && { label: 'Trip', value: tripType },
    direction && { label: 'Direction', value: direction },
    query && { label: 'Flight Code', value: query },
    from && to && { label: 'Route', value: `${from} → ${to}` },
    cabin && { label: 'Cabin', value: cabin },
    passengers && { label: 'Passengers', value: String(passengers) },
  ].filter(Boolean);

  if (!items.length) return null;

  return (
    <div className="sr-summary-bar" aria-label="Search criteria">
      {items.map(item => (
        <span className="sr-summary-chip" key={item.label}>
          <span className="sr-summary-chip-label">{item.label}</span>
          <span className="sr-summary-chip-value">{item.value}</span>
        </span>
      ))}
    </div>
  );
};

export default SearchSummary;
