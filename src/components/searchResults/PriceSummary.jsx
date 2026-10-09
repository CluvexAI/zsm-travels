import React from 'react';
import { DASH, formatMoney } from './SearchResultPrimitives';

// Compact price block for the collapsed card footer (plan §15 sticky/visible CTA).
export const PriceSummary = ({ fare }) => {
  const total = formatMoney(fare?.total, fare?.currency);
  if (!total) return <span className="sr-price is-empty">{DASH}</span>;
  return (
    <span className="sr-price">
      <strong>{total}</strong>
      {fare.basis ? <em>{fare.basis}</em> : null}
    </span>
  );
};

export default PriceSummary;
