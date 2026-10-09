import React from 'react';
import { AirlineBadge, DASH, FieldGrid, SectionCard, formatMoney } from './SearchResultPrimitives';
import CollapsibleSection from './CollapsibleSection';
import PassengerTable from './PassengerTable';
import PassengerAddress from './PassengerAddress';

// ── Airline & PNR (up to 3 rows — only populated rows render) ───────────────
export const AirlinePNRDetails = ({ airlines = [], record }) => {
  const rows = airlines.filter(a => a.name || a.pnr).slice(0, 3);
  if (!rows.length && !record) return null;

  const fields = [];
  rows.forEach((airline, index) => {
    if (airline.name) fields.push({ label: `Airline ${index + 1}`, value: airline.name });
    if (airline.pnr) fields.push({ label: `Airline ${index + 1} PNR`, value: airline.pnr });
  });
  fields.push({ label: 'GDS PNR', value: record?.gdsPnr || '' });
  fields.push({ label: 'Miles PNR', value: record?.milesPnr || '' });

  return (
    <CollapsibleSection title="Airline & PNR Detail" anchor="pnr" defaultOpen>
      <div className="sr-airline-rows">
        {rows.map((airline, index) => (
          <div className="sr-airline-row" key={`${airline.code || airline.name}-${index}`}>
            <AirlineBadge name={airline.name} code={airline.code} logo={airline.logo} size={26} />
            <span className="sr-airline-row-name">{airline.name || DASH}</span>
            <span className={`sr-airline-row-pnr${airline.pnr ? '' : ' is-empty'}`}>
              {airline.pnr || 'Not Available'}
            </span>
          </div>
        ))}
        {!rows.length && <div className="sr-empty-note">Not Available</div>}
      </div>
      <FieldGrid columns={2} fields={fields} />
    </CollapsibleSection>
  );
};

// ── Booking detail ──────────────────────────────────────────────────────────
export const BookingDetailsSection = ({ booking }) => {
  if (!booking) return null;
  const dateText = booking.bookingDate
    ? new Date(booking.bookingDate).toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit',
      })
    : '';
  return (
    <SectionCard title="Booking Detail" anchor="booking">
      <FieldGrid
        fields={[
          { label: 'Created By', value: booking.createdBy },
          { label: 'Booking Date', value: dateText },
          { label: 'Reference No', value: booking.referenceNo },
          { label: 'Shift', value: booking.shift },
          { label: 'Payment Type', value: booking.paymentType },
          { label: 'Descriptor', value: booking.descriptor },
          { label: 'Gateway', value: booking.gateway },
          { label: 'Vendor', value: booking.vendor },
          { label: 'Source', value: booking.source },
        ]}
      />
    </SectionCard>
  );
};

// ── Costing — only API-provided values render; nothing is invented ──────────
export const CostingDetails = ({ fare }) => {
  if (!fare) return null;
  const currency = fare.currency || 'USD';
  const money = (value) => formatMoney(value, currency);
  const rows = [
    { label: 'Base Fare', value: money(fare.baseFare) },
    { label: 'Tax', value: money(fare.tax) },
    { label: 'Subtotal', value: money(fare.subtotal) },
    { label: 'Total', value: money(fare.total) },
    { label: 'Actual Cost', value: money(fare.actualCost) },
    { label: 'Actual MCO', value: money(fare.actualMco) },
  ].filter(row => row.value);
  if (!rows.length) return null;
  return (
    <SectionCard title="Costing Detail" anchor="costing">
      <div className="sr-costing">
        {rows.map(row => (
          <div className={`sr-costing-row${row.label === 'Total' ? ' is-total' : ''}`} key={row.label}>
            <span>{row.label}</span>
            <strong>{row.value}</strong>
          </div>
        ))}
        {fare.basis ? <div className="sr-costing-note">{fare.basis}</div> : null}
        {fare.rules ? <div className="sr-costing-note">{fare.rules}</div> : null}
      </div>
    </SectionCard>
  );
};

// ── Costing history ─────────────────────────────────────────────────────────
export const CostingHistory = ({ rows }) => {
  if (!Array.isArray(rows) || !rows.length) return null;
  const currency = 'USD';
  return (
    <CollapsibleSection title="Costing History" anchor="costing-history">
      <div className="sr-table-wrap">
        <table className="sr-table">
          <thead>
            <tr><th>Particular</th><th>Cost</th><th>Service Cost</th></tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${row.particular}-${index}`}>
                <td>{row.particular || DASH}</td>
                <td>{formatMoney(row.cost, currency) || DASH}</td>
                <td>{formatMoney(row.serviceCost, currency) || DASH}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CollapsibleSection>
  );
};

// ── Seat availability — only rendered when the API actually supplies it ─────
export const SeatAvailability = ({ data }) => {
  if (!data) return null;
  if (Array.isArray(data)) {
    if (!data.length) return null;
    const columns = Object.keys(data[0]);
    return (
      <SectionCard title="Seat Availability" anchor="seat-availability">
        <div className="sr-table-wrap">
          <table className="sr-table">
            <thead><tr>{columns.map(column => <th key={column}>{column}</th>)}</tr></thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index}>
                  {columns.map(column => <td key={column}>{row[column] ?? DASH}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    );
  }
  if (typeof data !== 'object') {
    return (
      <SectionCard title="Seat Availability" anchor="seat-availability">
        <div className="sr-costing"><div className="sr-costing-row"><span>Availability</span><strong>{String(data)}</strong></div></div>
      </SectionCard>
    );
  }
  const fields = Object.entries(data).map(([key, value]) => ({ label: key, value: value ?? '' }));
  if (!fields.length) return null;
  return (
    <SectionCard title="Seat Availability" anchor="seat-availability">
      <FieldGrid columns={2} fields={fields} />
    </SectionCard>
  );
};

// ── Passengers + address ────────────────────────────────────────────────────
export const PassengerDetails = ({ passengers, address }) => {
  if ((!passengers || !passengers.length) && !address) return null;
  return (
    <SectionCard title="Passenger Detail" anchor="passengers">
      {passengers && passengers.length ? (
        <PassengerTable passengers={passengers} />
      ) : (
        <div className="sr-empty-note">Passenger details are not available for this result.</div>
      )}
      <PassengerAddress address={address} />
    </SectionCard>
  );
};
