import React from 'react';
import { DASH } from './SearchResultPrimitives';

// Passenger rows render exactly what the API returned — no limits on count.
export const PassengerTable = ({ passengers = [] }) => {
  if (!passengers.length) return null;
  return (
    <div className="sr-table-wrap">
      <table className="sr-table sr-passenger-table">
        <thead>
          <tr>
            <th>Type</th><th>Name</th><th>Gender</th><th>DOB</th><th>E-Ticket</th>
            <th>Seat</th><th>Carry On</th><th>Check-in</th><th>Insurance</th>
          </tr>
        </thead>
        <tbody>
          {passengers.map((p, index) => (
            <tr key={`${p.name}-${index}`}>
              <td>{p.type || DASH}</td>
              <td>{p.name || DASH}</td>
              <td>{p.gender || DASH}</td>
              <td>{p.dob || DASH}</td>
              <td>{p.eTicket || DASH}</td>
              <td>{p.seat || DASH}</td>
              <td>{p.carryOn || DASH}</td>
              <td>{p.checkIn || DASH}</td>
              <td>{p.insurance || DASH}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PassengerTable;
