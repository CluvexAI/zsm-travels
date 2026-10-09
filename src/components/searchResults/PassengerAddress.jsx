import React from 'react';
import { DASH } from './SearchResultPrimitives';

// Passenger address block (plan §12) — data-driven, hidden when absent.
export const PassengerAddress = ({ address }) => {
  if (!address) return null;
  const line = [address.line, address.city, address.zip, address.state, address.country]
    .filter(Boolean)
    .join(', ');
  if (!line) return null;
  return (
    <div className="sr-address">
      <div className="sr-address-line">
        <span className="sr-field-label">Address:</span> {line || DASH}
      </div>
      <div className="sr-address-grid">
        <span><span className="sr-field-label">City:</span> {address.city || DASH}</span>
        <span><span className="sr-field-label">ZIP:</span> {address.zip || DASH}</span>
        <span><span className="sr-field-label">State:</span> {address.state || DASH}</span>
        <span><span className="sr-field-label">Country:</span> {address.country || DASH}</span>
      </div>
    </div>
  );
};

export default PassengerAddress;
