import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, PlaneTakeoff, X, Check } from 'lucide-react';

const mockReservations = [
  { id: 'ZSM-10041', pnr: 'XKRT4P', firstName: 'John', middleName: 'M.', lastName: 'Smith', email: 'john.smith@email.com', phone: '+1 212-555-0141', altPhone: '+1 212-555-0199', dob: '1985-03-15', gender: 'Male', address: '123 Broadway Ave', city: 'New York', state: 'NY', zip: '10001', country: 'United States', route: 'JFK → LAX', origin: 'JFK', destination: 'LAX', airline: 'American Airlines', flightNumber: 'AA 100', travelDate: '2026-08-15', returnDate: '2026-08-25', bookingDate: '2026-07-18', status: 'On Hold', totalAmount: 450.00, amountPaid: 450.00, amountDue: 0.00, paymentStatus: 'Paid', enquiryStatus: 'Closed', cancellationStatus: 'Not Cancelled', cancellationFee: 50.00 },
  { id: 'ZSM-10042', pnr: 'BMNW2L', firstName: 'Emily', middleName: 'R.', lastName: 'Johnson', email: 'emily.johnson@email.com', phone: '+1 312-555-0198', altPhone: '', dob: '1990-07-22', gender: 'Female', address: '456 Michigan Ave', city: 'Chicago', state: 'IL', zip: '60601', country: 'United States', route: 'ORD → MIA', origin: 'ORD', destination: 'MIA', airline: 'Delta Air Lines', flightNumber: 'DL 455', travelDate: '2026-08-20', returnDate: '', bookingDate: '2026-07-19', status: 'Confirmed', totalAmount: 320.50, amountPaid: 320.50, amountDue: 0.00, paymentStatus: 'Paid', enquiryStatus: 'Closed', cancellationStatus: 'Not Cancelled', cancellationFee: 50.00 },
  { id: 'ZSM-10043', pnr: 'FDGT7Q', firstName: 'Robert', middleName: 'A.', lastName: 'Williams', email: 'robert.williams@email.com', phone: '+1 415-555-0176', altPhone: '+1 415-555-0188', dob: '1978-11-30', gender: 'Male', address: '789 Market St', city: 'San Francisco', state: 'CA', zip: '94103', country: 'United States', route: 'SFO → SEA', origin: 'SFO', destination: 'SEA', airline: 'United Airlines', flightNumber: 'UA 12', travelDate: '2026-08-10', returnDate: '2026-08-17', bookingDate: '2026-07-17', status: 'On Hold', totalAmount: 580.00, amountPaid: 200.00, amountDue: 380.00, paymentStatus: 'Partial', enquiryStatus: 'Open', cancellationStatus: 'Not Cancelled', cancellationFee: 50.00 },
  { id: 'ZSM-10044', pnr: 'PLRV9S', firstName: 'Maria', middleName: 'T.', lastName: 'Garcia', email: 'maria.garcia@email.com', phone: '+1 310-555-0134', altPhone: '', dob: '1992-01-08', gender: 'Female', address: '321 Sunset Blvd', city: 'Los Angeles', state: 'CA', zip: '90028', country: 'United States', route: 'LAX → JFK', origin: 'LAX', destination: 'JFK', airline: 'JetBlue Airways', flightNumber: 'B6 323', travelDate: '2026-09-01', returnDate: '2026-09-10', bookingDate: '2026-07-20', status: 'Confirmed', totalAmount: 410.00, amountPaid: 410.00, amountDue: 0.00, paymentStatus: 'Paid', enquiryStatus: 'Closed', cancellationStatus: 'Not Cancelled', cancellationFee: 50.00 },
  { id: 'ZSM-10045', pnr: 'HCNK3W', firstName: 'James', middleName: 'L.', lastName: 'Brown', email: 'james.brown@email.com', phone: '+1 214-555-0167', altPhone: '+1 214-555-0145', dob: '1988-05-12', gender: 'Male', address: '555 Elm St', city: 'Dallas', state: 'TX', zip: '75201', country: 'United States', route: 'DFW → ATL', origin: 'DFW', destination: 'ATL', airline: 'American Airlines', flightNumber: 'AA 98', travelDate: '2026-08-05', returnDate: '', bookingDate: '2026-07-15', status: 'Cancelled', totalAmount: 290.00, amountPaid: 290.00, amountDue: 0.00, paymentStatus: 'Paid', enquiryStatus: 'Closed', cancellationStatus: 'Cancelled', cancellationFee: 50.00 },
];

const getBadgeStyle = (status) => {
  const styles = {
    'Confirmed': { bg: '#def7ec', color: '#03543f' },
    'On Hold': { bg: '#fef3c7', color: '#92400e' },
    'Cancelled': { bg: '#fde8e8', color: '#9b1c1c' },
    'Pending': { bg: '#e1effe', color: '#1e429f' },
  };
  const s = styles[status] || { bg: '#f3f4f6', color: '#374151' };
  return {
    display: 'inline-block',
    padding: '0.2rem 0.6rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: 600,
    backgroundColor: s.bg,
    color: s.color,
  };
};

const getStrictPST = () => {
  const d = new Date();
  const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
  const pst = new Date(utc - (3600000 * 8));
  return pst.toLocaleString('en-US', {
    month: 'numeric', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', second: '2-digit',
    hour12: true
  }) + ' PST';
};

const CancellationRefund = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    cxId: '', bookingId: '', pnr: '', customerName: '', cxPhone: '', customerEmail: '',
    agent: '', altPhone: '', passengerName: '', fromDate: '', toDate: '', status: ''
  });
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [cancellationData, setCancellationData] = useState(null);
  const [note, setNote] = useState('');
  const [noteTimestamp, setNoteTimestamp] = useState('');
  const [alertMessage, setAlertMessage] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [cancelled, setCancelled] = useState(false);
  const [customCancelFee, setCustomCancelFee] = useState(0);
  const [customRefundAmount, setCustomRefundAmount] = useState(0);

  const handleSearch = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setHasSearched(true);
    setSelectedReservation(null);
    
    const results = mockReservations.filter(r => {
      let match = true;
      if (filters.bookingId && !r.id.toLowerCase().includes(filters.bookingId.toLowerCase().trim())) match = false;
      if (filters.pnr && !r.pnr.toLowerCase().includes(filters.pnr.toLowerCase().trim())) match = false;
      
      const fullName = `${r.firstName} ${r.middleName} ${r.lastName}`.toLowerCase();
      if (filters.customerName && !fullName.includes(filters.customerName.toLowerCase().trim())) match = false;
      if (filters.passengerName && !fullName.includes(filters.passengerName.toLowerCase().trim())) match = false;
      
      if (filters.cxPhone && !r.phone.includes(filters.cxPhone.trim())) match = false;
      if (filters.altPhone && (!r.altPhone || !r.altPhone.includes(filters.altPhone.trim()))) match = false;
      if (filters.customerEmail && !r.email.toLowerCase().includes(filters.customerEmail.toLowerCase().trim())) match = false;
      if (filters.status && filters.status !== 'All Statuses' && r.status !== filters.status) match = false;
      
      if (filters.fromDate) {
        if (r.bookingDate < filters.fromDate) match = false;
      }
      if (filters.toDate) {
         if (r.bookingDate > filters.toDate) match = false;
      }
      
      return match;
    });
    setSearchResults(results);
  };

  const handleClear = () => {
    setFilters({
      cxId: '', bookingId: '', pnr: '', customerName: '', cxPhone: '', customerEmail: '',
      agent: '', altPhone: '', passengerName: '', fromDate: '', toDate: '', status: ''
    });
    setSearchResults([]);
    setHasSearched(false);
    setSelectedReservation(null);
  };

  const handleCancelInit = (reservation) => {
    setSelectedReservation(reservation);
    setCancellationData({ 
      ...reservation,
      cancelDateTime: new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles', dateStyle: 'short', timeStyle: 'short' }),
    });
    setNote('');
    setNoteTimestamp(getStrictPST());
    setCancelled(false);
    setCustomCancelFee(reservation.cancellationFee);
    setCustomRefundAmount(Math.max(0, reservation.amountPaid - reservation.cancellationFee));
  };

  const handleConfirmCancellation = () => {
    if (!note.trim()) {
      setAlertMessage("A note is required to proceed with cancellation.");
      return;
    }
    setConfirmAction({
      message: "Are you sure you want to cancel this booking and process the refund?",
      onConfirm: () => {
        setCancelled(true);
        setConfirmAction(null);
      }
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="page-container">
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>Cancellation for Refund</h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>Search and manage refund requests.</p>
        </div>
        
        {/* Advanced Search Panel */}
        <div className="card mb-6" style={{ padding: '1.5rem 2rem' }}>
        <form onSubmit={handleSearch}>
          {/* Row 1: 6 columns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>CXId</label>
              <input type="text" className="form-input" placeholder="CXId" value={filters.cxId} onChange={(e) => setFilters({...filters, cxId: e.target.value})} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>BookingId</label>
              <input type="text" className="form-input" placeholder="BookingId" value={filters.bookingId} onChange={(e) => setFilters({...filters, bookingId: e.target.value})} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>PNR</label>
              <input type="text" className="form-input" placeholder="PNR" value={filters.pnr} onChange={(e) => setFilters({...filters, pnr: e.target.value})} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Customer Name</label>
              <input type="text" className="form-input" placeholder="Customer Name" value={filters.customerName} onChange={(e) => setFilters({...filters, customerName: e.target.value})} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>CX Phone</label>
              <input type="text" className="form-input" placeholder="CX Phone" value={filters.cxPhone} onChange={(e) => setFilters({...filters, cxPhone: e.target.value})} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Customer Email</label>
              <input type="text" className="form-input" placeholder="Customer Email" value={filters.customerEmail} onChange={(e) => setFilters({...filters, customerEmail: e.target.value})} />
            </div>
          </div>

          {/* Row 2: 5 columns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem', alignItems: 'end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Select Agent</label>
              <input list="agent-options" className="form-input" placeholder="Search Agent..." value={filters.agent} onChange={(e) => setFilters({...filters, agent: e.target.value})} />
              <datalist id="agent-options">
                <option value="All Agents" />
                <option value="Agent A" />
                <option value="Agent B" />
                <option value="Agent C" />
              </datalist>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Booking Status</label>
              <select className="form-input" value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}>
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Booking Confirmed">Booking Confirmed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Customer Alternate Number</label>
              <input type="text" className="form-input" placeholder="Customer Alternate Number" value={filters.altPhone} onChange={(e) => setFilters({...filters, altPhone: e.target.value})} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Passenger Name</label>
              <input type="text" className="form-input" placeholder="Passenger name" value={filters.passengerName} onChange={(e) => setFilters({...filters, passengerName: e.target.value})} />
            </div>
            <div style={{ marginBottom: 0 }}>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', fontWeight: 600 }}>SEARCH</button>
            </div>
          </div>

          {/* Row 3: Date Range */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem', alignItems: 'end', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>From Date</label>
              <input type="date" className="form-input" value={filters.fromDate} onChange={(e) => setFilters({...filters, fromDate: e.target.value})} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>To Date</label>
              <input type="date" className="form-input" value={filters.toDate} onChange={(e) => setFilters({...filters, toDate: e.target.value})} />
            </div>
            <div style={{ marginBottom: 0 }}>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', fontWeight: 600 }}>SEARCH</button>
            </div>
            <div style={{ marginBottom: 0 }}>
              <button type="button" onClick={handleClear} className="btn btn-secondary" style={{ width: '100%', padding: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Clear Filters</button>
            </div>
          </div>
        </form>
      </div>

      {/* Search Results */}
      {hasSearched && !selectedReservation && (
        <div style={{
          background: 'white',
          borderRadius: '6px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          overflow: 'hidden',
          marginTop: '1.25rem',
        }}>
          <div style={{
            padding: '1rem 1.5rem',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1f2937', margin: 0 }}>
                Search Results
              </h3>
              <span style={{
                background: '#ede9fe',
                color: '#6d28d9',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.15rem 0.6rem',
                borderRadius: '9999px',
              }}>
                {searchResults.length} found
              </span>
            </div>
          </div>

          {searchResults.length === 0 ? (
            <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: '#9ca3af' }}>
              <AlertCircle size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
              <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem', color: '#6b7280' }}>No reservations found</div>
              <div style={{ fontSize: '0.8rem' }}>Try a different Booking ID, PNR, or passenger name.</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Booking ID', 'PNR', 'Passenger', 'Airline', 'Flight No.', 'Route', 'Travel Date', 'Status', 'Action'].map(h => (
                      <th key={h} style={{
                        padding: '0.65rem 0.75rem',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        color: '#6b7280',
                        backgroundColor: '#f9fafb',
                        borderBottom: '2px solid #e5e7eb',
                        textAlign: 'left',
                        whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map((r, idx) => (
                    <tr
                      key={r.id}
                      style={{ backgroundColor: idx % 2 === 0 ? 'white' : '#fafafa', transition: 'background 0.1s' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f3ff'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? 'white' : '#fafafa'}
                    >
                      <td style={{ padding: '0.6rem 0.75rem', fontSize: '0.8rem', borderBottom: '1px solid #f3f4f6', fontWeight: 700, color: '#6d28d9' }}>{r.id}</td>
                      <td style={{ padding: '0.6rem 0.75rem', fontSize: '0.8rem', borderBottom: '1px solid #f3f4f6', fontFamily: 'monospace', fontWeight: 600, letterSpacing: '0.5px' }}>{r.pnr}</td>
                      <td style={{ padding: '0.6rem 0.75rem', fontSize: '0.8rem', borderBottom: '1px solid #f3f4f6', fontWeight: 500 }}>{r.firstName} {r.middleName} {r.lastName}</td>
                      <td style={{ padding: '0.6rem 0.75rem', fontSize: '0.8rem', borderBottom: '1px solid #f3f4f6', color: '#6b7280' }}>{r.airline}</td>
                      <td style={{ padding: '0.6rem 0.75rem', fontSize: '0.8rem', borderBottom: '1px solid #f3f4f6', fontFamily: 'monospace' }}>{r.flightNumber}</td>
                      <td style={{ padding: '0.6rem 0.75rem', fontSize: '0.8rem', borderBottom: '1px solid #f3f4f6', fontFamily: 'monospace', fontSize: '0.75rem' }}>{r.route}</td>
                      <td style={{ padding: '0.6rem 0.75rem', fontSize: '0.8rem', borderBottom: '1px solid #f3f4f6' }}>{new Date(r.travelDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                      <td style={{ padding: '0.6rem 0.75rem', fontSize: '0.8rem', borderBottom: '1px solid #f3f4f6' }}><span style={getBadgeStyle(r.status)}>{r.status}</span></td>
                      <td style={{ padding: '0.6rem 0.75rem', fontSize: '0.8rem', borderBottom: '1px solid #f3f4f6' }}>
                        <button
                          onClick={() => handleCancelInit(r)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.35rem 0.75rem',
                            backgroundColor: '#e53e3e',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'background-color 0.15s',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c53030'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#e53e3e'}
                        >
                          <PlaneTakeoff size={12} />
                          Cancel & Refund
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Cancellation Form */}
      {selectedReservation && (
        <div style={{ background: 'white', borderRadius: '6px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden', marginTop: '1.25rem' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1f2937', margin: 0 }}>
              Selected Booking Details
            </h3>
          </div>
          
          <div style={{ padding: '1.5rem' }}>
            {!cancelled ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                
                {/* General & Financial Info */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  
                  {/* General Info */}
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', marginBottom: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>General Info</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem' }}>
                      <div>
                        <span style={{ display: 'block', color: '#6b7280', fontSize: '0.75rem', fontWeight: 600 }}>Booking Ref / PNR</span>
                        <strong style={{ color: '#1f2937', fontFamily: 'monospace', fontSize: '1rem' }}>{selectedReservation.id} / {selectedReservation.pnr}</strong>
                      </div>
                      <div>
                        <span style={{ display: 'block', color: '#6b7280', fontSize: '0.75rem', fontWeight: 600 }}>Passenger</span>
                        <strong style={{ color: '#1f2937' }}>{selectedReservation.firstName} {selectedReservation.lastName}</strong>
                      </div>
                      <div>
                        <span style={{ display: 'block', color: '#6b7280', fontSize: '0.75rem', fontWeight: 600 }}>Contact Info</span>
                        <span style={{ color: '#374151', display: 'block' }}>{selectedReservation.phone}</span>
                        <span style={{ color: '#374151', display: 'block' }}>{selectedReservation.email}</span>
                      </div>
                      <div>
                        <span style={{ display: 'block', color: '#6b7280', fontSize: '0.75rem', fontWeight: 600 }}>Dates</span>
                        <span style={{ color: '#374151', display: 'block' }}>Booked: {selectedReservation.bookingDate}</span>
                        <span style={{ color: '#374151', display: 'block' }}>Travel: {selectedReservation.travelDate}</span>
                      </div>
                      <div>
                        <span style={{ display: 'block', color: '#6b7280', fontSize: '0.75rem', fontWeight: 600 }}>Booking Status</span>
                        <span style={getBadgeStyle(selectedReservation.status)}>{selectedReservation.status}</span>
                      </div>
                      <div>
                        <span style={{ display: 'block', color: '#6b7280', fontSize: '0.75rem', fontWeight: 600 }}>Enquiry Status</span>
                        <span style={{ color: '#374151', fontWeight: 600 }}>{selectedReservation.enquiryStatus}</span>
                      </div>
                      <div>
                        <span style={{ display: 'block', color: '#6b7280', fontSize: '0.75rem', fontWeight: 600 }}>Cancellation Status</span>
                        <span style={{ color: '#374151', fontWeight: 600 }}>{selectedReservation.cancellationStatus}</span>
                      </div>
                    </div>
                  </div>

                  {/* Financial Info */}
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', marginBottom: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>Financial Info</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem' }}>
                      <div>
                        <span style={{ display: 'block', color: '#6b7280', fontSize: '0.75rem', fontWeight: 600 }}>Total Booking Amount</span>
                        <strong style={{ color: '#1f2937' }}>${selectedReservation.totalAmount.toFixed(2)}</strong>
                      </div>
                      <div>
                        <span style={{ display: 'block', color: '#6b7280', fontSize: '0.75rem', fontWeight: 600 }}>Amount Paid</span>
                        <strong style={{ color: '#059669' }}>${selectedReservation.amountPaid.toFixed(2)}</strong>
                      </div>
                      <div>
                        <span style={{ display: 'block', color: '#6b7280', fontSize: '0.75rem', fontWeight: 600 }}>Amount Due</span>
                        <strong style={{ color: selectedReservation.amountDue > 0 ? '#dc2626' : '#1f2937' }}>${selectedReservation.amountDue.toFixed(2)}</strong>
                      </div>
                      <div>
                        <span style={{ display: 'block', color: '#6b7280', fontSize: '0.75rem', fontWeight: 600 }}>Payment Status</span>
                        <strong style={{ color: '#374151' }}>{selectedReservation.paymentStatus}</strong>
                      </div>
                    </div>

                    <div style={{ marginTop: '1.5rem', background: '#fef2f2', padding: '1rem', borderRadius: '4px', border: '1px solid #fecaca' }}>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#991b1b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Refund Calculation</h4>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ color: '#7f1d1d', fontSize: '0.875rem' }}>Amount Already Paid:</span>
                        <span style={{ color: '#7f1d1d', fontSize: '0.875rem', fontWeight: 600 }}>${selectedReservation.amountPaid.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                        <span style={{ color: '#7f1d1d', fontSize: '0.875rem' }}>Cancellation Charges:</span>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span style={{ color: '#7f1d1d', fontSize: '0.875rem', fontWeight: 600, marginRight: '0.25rem' }}>-$</span>
                          <input 
                            type="number" 
                            min="0"
                            step="0.01"
                            value={customCancelFee} 
                            onChange={(e) => setCustomCancelFee(parseFloat(e.target.value) || 0)} 
                            style={{ width: '80px', padding: '0.25rem', border: '1px solid #fca5a5', borderRadius: '4px', textAlign: 'right', color: '#7f1d1d', fontWeight: 600 }}
                          />
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #fecaca', paddingTop: '0.5rem', alignItems: 'center' }}>
                        <span style={{ color: '#991b1b', fontSize: '0.875rem', fontWeight: 700 }}>Total Refund Amount:</span>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span style={{ color: '#991b1b', fontSize: '1.125rem', fontWeight: 800, marginRight: '0.25rem' }}>$</span>
                          <input 
                            type="number" 
                            min="0"
                            step="0.01"
                            value={customRefundAmount} 
                            onChange={(e) => setCustomRefundAmount(parseFloat(e.target.value) || 0)} 
                            style={{ width: '100px', padding: '0.25rem', border: '1px solid #fca5a5', borderRadius: '4px', textAlign: 'right', color: '#991b1b', fontSize: '1.125rem', fontWeight: 800, background: 'white' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem' }}>
                  <div style={{ marginBottom: '1rem', display: 'flex', gap: '2rem' }}>
                    <div>
                      <span style={{ display: 'block', color: '#6b7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Cancellation Date & Time</span>
                      <strong style={{ color: '#1f2937', fontSize: '0.875rem' }}>{cancellationData?.cancelDateTime}</strong>
                    </div>
                  </div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    A Note (Required)
                  </label>
                  
                  <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', maxWidth: '600px' }}>
                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Date & Time:</span>
                    <input 
                      type="text" 
                      value={noteTimestamp} 
                      readOnly 
                      style={{ flex: 1, padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#f1f5f9', color: '#64748b', fontSize: '0.875rem', outline: 'none', cursor: 'not-allowed' }}
                    />
                  </div>

                  <textarea 
                    rows={4}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Enter reason for cancellation..."
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.875rem', resize: 'vertical', maxWidth: '600px' }}
                  />
                </div>
                
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <button onClick={handleConfirmCancellation} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#e53e3e', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                    Cancel Booking & Process Refund
                  </button>
                  <button onClick={() => setSelectedReservation(null)} style={{ padding: '0.75rem 1.5rem', backgroundColor: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                    Back / Close / Change Booking
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#def7ec', color: '#03543f', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                  <Check size={32} strokeWidth={3} />
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1f2937', marginBottom: '0.5rem' }}>Cancellation Successful</h2>
                <p style={{ color: '#4b5563', marginBottom: '1.5rem' }}>
                  Booking {selectedReservation.id} has been cancelled and refund initiated.
                </p>
                <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '4px', border: '1px solid #e5e7eb', display: 'inline-block', textAlign: 'left', minWidth: '300px', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: 600 }}>Cancellation Date & Time:</span>
                    <span style={{ color: '#1f2937', fontSize: '0.875rem', fontWeight: 700 }}>{cancellationData.cancelDateTime}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: 600 }}>Refund Method:</span>
                    <span style={{ color: '#1f2937', fontSize: '0.875rem', fontWeight: 700 }}>Original Form of Payment</span>
                  </div>
                </div>
                <div>
                  <button onClick={() => { setSelectedReservation(null); handleSearch(); }} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#38b2ac', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                    Return to Search
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      </div>

      {/* Alert Modal */}
      {alertMessage && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '400px', boxShadow: 'var(--shadow-xl)', animation: 'slideUp 0.3s ease-out', textAlign: 'center' }}>
            <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>Notice</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1rem' }}>{alertMessage}</p>
            <button 
              onClick={() => setAlertMessage(null)}
              style={{ width: '100%', padding: '0.875rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, cursor: 'pointer', boxShadow: 'var(--shadow-md)' }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmAction && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '400px', boxShadow: 'var(--shadow-xl)', animation: 'slideUp 0.3s ease-out', textAlign: 'center' }}>
            <AlertCircle size={48} color="#f59e0b" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>Confirm Action</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1rem' }}>{confirmAction.message}</p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => setConfirmAction(null)}
                style={{ flex: 1, padding: '0.875rem', background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={confirmAction.onConfirm}
                style={{ flex: 1, padding: '0.875rem', background: '#f59e0b', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, cursor: 'pointer', boxShadow: 'var(--shadow-md)' }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CancellationRefund;
