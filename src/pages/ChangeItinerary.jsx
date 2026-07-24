import React, { useState } from 'react';
import { Search, Edit3, X, Save, Check, AlertCircle, PlaneTakeoff, MapPin, Calendar, Hash, ArrowRightLeft, Plane } from 'lucide-react';

// Mock reservations for search
const mockReservations = [
  { id: 'ZSM-10041', pnr: 'XKRT4P', firstName: 'John', middleName: 'M.', lastName: 'Smith', email: 'john.smith@email.com', phone: '+1 212-555-0141', altPhone: '+1 212-555-0199', dob: '1985-03-15', gender: 'Male', address: '123 Broadway Ave', city: 'New York', state: 'NY', zip: '10001', country: 'United States', route: 'JFK → LAX', origin: 'JFK', destination: 'LAX', airline: 'American Airlines', flightNumber: 'AA 100', travelDate: '2026-08-15', returnDate: '2026-08-25', bookingDate: '2026-07-18', status: 'On Hold' },
  { id: 'ZSM-10042', pnr: 'BMNW2L', firstName: 'Emily', middleName: 'R.', lastName: 'Johnson', email: 'emily.johnson@email.com', phone: '+1 312-555-0198', altPhone: '', dob: '1990-07-22', gender: 'Female', address: '456 Michigan Ave', city: 'Chicago', state: 'IL', zip: '60601', country: 'United States', route: 'ORD → MIA', origin: 'ORD', destination: 'MIA', airline: 'Delta Air Lines', flightNumber: 'DL 455', travelDate: '2026-08-20', returnDate: '', bookingDate: '2026-07-19', status: 'Confirmed' },
  { id: 'ZSM-10043', pnr: 'FDGT7Q', firstName: 'Robert', middleName: 'A.', lastName: 'Williams', email: 'robert.williams@email.com', phone: '+1 415-555-0176', altPhone: '+1 415-555-0188', dob: '1978-11-30', gender: 'Male', address: '789 Market St', city: 'San Francisco', state: 'CA', zip: '94103', country: 'United States', route: 'SFO → SEA', origin: 'SFO', destination: 'SEA', airline: 'United Airlines', flightNumber: 'UA 12', travelDate: '2026-08-10', returnDate: '2026-08-17', bookingDate: '2026-07-17', status: 'On Hold' },
  { id: 'ZSM-10044', pnr: 'PLRV9S', firstName: 'Maria', middleName: 'T.', lastName: 'Garcia', email: 'maria.garcia@email.com', phone: '+1 310-555-0134', altPhone: '', dob: '1992-01-08', gender: 'Female', address: '321 Sunset Blvd', city: 'Los Angeles', state: 'CA', zip: '90028', country: 'United States', route: 'LAX → JFK', origin: 'LAX', destination: 'JFK', airline: 'JetBlue Airways', flightNumber: 'B6 323', travelDate: '2026-09-01', returnDate: '2026-09-10', bookingDate: '2026-07-20', status: 'Confirmed' },
  { id: 'ZSM-10045', pnr: 'HCNK3W', firstName: 'James', middleName: 'L.', lastName: 'Brown', email: 'james.brown@email.com', phone: '+1 214-555-0167', altPhone: '+1 214-555-0145', dob: '1988-05-12', gender: 'Male', address: '555 Elm St', city: 'Dallas', state: 'TX', zip: '75201', country: 'United States', route: 'DFW → ATL', origin: 'DFW', destination: 'ATL', airline: 'American Airlines', flightNumber: 'AA 98', travelDate: '2026-08-05', returnDate: '', bookingDate: '2026-07-15', status: 'Cancelled' },
  { id: 'ZSM-10046', pnr: 'YWMZ5A', firstName: 'Patricia', middleName: 'D.', lastName: 'Davis', email: 'patricia.davis@email.com', phone: '+1 617-555-0123', altPhone: '', dob: '1995-09-25', gender: 'Female', address: '888 Beacon St', city: 'Boston', state: 'MA', zip: '02108', country: 'United States', route: 'BOS → DCA', origin: 'BOS', destination: 'DCA', airline: 'Delta Air Lines', flightNumber: 'DL 567', travelDate: '2026-08-22', returnDate: '2026-08-29', bookingDate: '2026-07-21', status: 'On Hold' },
  { id: 'ZSM-10047', pnr: 'TQJS8E', firstName: 'Michael', middleName: 'K.', lastName: 'Wilson', email: 'michael.wilson@email.com', phone: '+1 305-555-0189', altPhone: '+1 305-555-0102', dob: '1982-12-03', gender: 'Male', address: '777 Ocean Dr', city: 'Miami', state: 'FL', zip: '33139', country: 'United States', route: 'MIA → ORD', origin: 'MIA', destination: 'ORD', airline: 'United Airlines', flightNumber: 'UA 881', travelDate: '2026-08-18', returnDate: '', bookingDate: '2026-07-16', status: 'Confirmed' },
  { id: 'ZSM-10048', pnr: 'VNLR6D', firstName: 'Linda', middleName: 'S.', lastName: 'Martinez', email: 'linda.martinez@email.com', phone: '+1 206-555-0156', altPhone: '', dob: '1993-04-18', gender: 'Female', address: '444 Pine St', city: 'Seattle', state: 'WA', zip: '98101', country: 'United States', route: 'SEA → SFO', origin: 'SEA', destination: 'SFO', airline: 'Alaska Airlines', flightNumber: 'AS 101', travelDate: '2026-08-25', returnDate: '2026-09-02', bookingDate: '2026-07-22', status: 'Pending' },
];

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

const ChangeItinerary = () => {
  const [searchFilters, setSearchFilters] = useState({
    cxId: '',
    bookingId: '',
    pnr: '',
    customerName: '',
    cxPhone: '',
    customerEmail: '',
    agent: '',
    bookingStatus: 'All Statuses',
    customerAltNumber: '',
    passengerName: '',
    fromDate: '',
    toDate: ''
  });

  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [editData, setEditData] = useState(null);
  const [saved, setSaved] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  
  // Search states for edit itinerary
  const [outboundSearched, setOutboundSearched] = useState(false);
  const [inboundSearched, setInboundSearched] = useState(false);

  const handleFilterChange = (field, value) => {
    setSearchFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setSearchFilters({
      cxId: '', bookingId: '', pnr: '', customerName: '', cxPhone: '', customerEmail: '',
      agent: '', bookingStatus: 'All Statuses', customerAltNumber: '', passengerName: '', fromDate: '', toDate: ''
    });
    setSearchResults([]);
    setHasSearched(false);
  };

  const handleSearch = () => {
    setHasSearched(true);
    setSelectedReservation(null);
    setEditData(null);
    setSaved(false);
    
    const results = mockReservations.filter(r => {
      let match = true;
      if (searchFilters.bookingId && !r.id.toLowerCase().includes(searchFilters.bookingId.toLowerCase().trim())) match = false;
      if (searchFilters.pnr && !r.pnr.toLowerCase().includes(searchFilters.pnr.toLowerCase().trim())) match = false;
      
      const fullName = `${r.firstName} ${r.middleName} ${r.lastName}`.toLowerCase();
      if (searchFilters.customerName && !fullName.includes(searchFilters.customerName.toLowerCase().trim())) match = false;
      if (searchFilters.passengerName && !fullName.includes(searchFilters.passengerName.toLowerCase().trim())) match = false;
      
      if (searchFilters.cxPhone && !r.phone.includes(searchFilters.cxPhone.trim())) match = false;
      if (searchFilters.customerAltNumber && (!r.altPhone || !r.altPhone.includes(searchFilters.customerAltNumber.trim()))) match = false;
      if (searchFilters.customerEmail && !r.email.toLowerCase().includes(searchFilters.customerEmail.toLowerCase().trim())) match = false;
      if (searchFilters.bookingStatus !== 'All Statuses' && r.status !== searchFilters.bookingStatus) match = false;
      
      if (searchFilters.fromDate) {
        if (new Date(r.bookingDate) < new Date(searchFilters.fromDate)) match = false;
      }
      if (searchFilters.toDate) {
         if (new Date(r.bookingDate) > new Date(searchFilters.toDate)) match = false;
      }
      
      return match;
    });
    setSearchResults(results);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleEdit = (reservation) => {
    setSelectedReservation(reservation);
    setEditData({ 
      ...reservation,
      tripType: reservation.returnDate ? 'Round Trip' : 'One Way',
      newOutboundFlight: '',
      newInboundFlight: '',
      editDateTime: getStrictPST(),
      paymentOption: 'Customer Card',
      billingAmount: 125.00
    });
    setOutboundSearched(false);
    setInboundSearched(false);
    setSaved(false);
  };

  const handleCancelEdit = () => {
    setSelectedReservation(null);
    setEditData(null);
    setSaved(false);
  };

  const handleFieldChange = (field, value) => {
    if (field === 'origin' || field === 'destination') {
      setEditData(prev => ({ 
        ...prev, 
        [field]: value,
        route: field === 'origin' ? `${value} → ${prev.destination}` : `${prev.origin} → ${value}` 
      }));
    } else {
      setEditData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSave = () => {
    if (!editData.note || editData.note.trim() === '') {
      setAlertMessage('Please provide a note for this itinerary change (required).');
      return;
    }

    setConfirmAction({
      message: "Are you sure you want to save these itinerary changes?",
      onConfirm: () => {
        setSaved(true);
        setConfirmAction(null);
        setSearchResults(prev => prev.map(r => r.id === editData.id ? { ...editData } : r));
        setTimeout(() => {
          setSelectedReservation(null);
          setEditData(null);
          setSaved(false);
        }, 1500);
      }
    });
  };

  const getBadgeStyle = (status) => {
    const map = {
      'On Hold': { bg: '#fef3c7', color: '#92400e' },
      'Confirmed': { bg: '#d1fae5', color: '#065f46' },
      'Cancelled': { bg: '#fee2e2', color: '#991b1b' },
      'Pending': { bg: '#e0f2fe', color: '#075985' },
    };
    const s = map[status] || { bg: '#f3f4f6', color: '#374151' };
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

  const labelStyle = {
    display: 'block',
    fontSize: '0.7rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: '#6b7280',
    marginBottom: '0.375rem',
  };

  const inputStyle = {
    width: '100%',
    padding: '0.5rem 0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '0.875rem',
    color: '#374151',
    backgroundColor: 'white',
    outline: 'none',
  };

  const sectionTitleStyle = {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#374151',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    paddingBottom: '0.5rem',
    borderBottom: '1px solid #e5e7eb',
  };

  return (
    <div className="page-container">
      <style dangerouslySetInnerHTML={{__html: `
        .layout-container { display: flex; gap: 2rem; align-items: flex-start; justify-content: space-between; width: 100%; }
        .layout-main { flex: 0 0 calc(100% - 340px - 2rem); max-width: 800px; min-width: 0; display: flex; flex-direction: column; gap: 1.5rem; width: 100%; }
        .layout-sidebar { flex: 0 0 340px; width: 340px; position: sticky; top: 2rem; z-index: 10; }
        @media (max-width: 992px) {
           .layout-container { flex-direction: column; }
           .layout-sidebar { width: 100%; position: static; }
           .layout-main { max-width: 100%; flex-basis: 100%; width: 100%; }
        }
      `}} />
      {/* Search Card */}
      <div style={{
        background: 'white',
        borderRadius: '6px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        overflow: 'hidden',
      }}>
        <div style={{ borderBottom: '3px solid #805ad5', padding: '1.25rem 1.5rem 1rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#6d28d9', margin: 0 }}>
            Change Itinerary
          </h2>
        </div>

        <div style={{ padding: '1.5rem', background: '#f8fafc' }}>
          {/* Row 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={labelStyle}>CXID</label>
              <input type="text" placeholder="CXId" value={searchFilters.cxId} onChange={(e) => handleFilterChange('cxId', e.target.value)} onKeyDown={handleKeyDown} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>BOOKINGID</label>
              <input type="text" placeholder="BookingId" value={searchFilters.bookingId} onChange={(e) => handleFilterChange('bookingId', e.target.value)} onKeyDown={handleKeyDown} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>PNR</label>
              <input type="text" placeholder="PNR" value={searchFilters.pnr} onChange={(e) => handleFilterChange('pnr', e.target.value)} onKeyDown={handleKeyDown} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>CUSTOMER NAME</label>
              <input type="text" placeholder="Customer Name" value={searchFilters.customerName} onChange={(e) => handleFilterChange('customerName', e.target.value)} onKeyDown={handleKeyDown} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>CX PHONE</label>
              <input type="text" placeholder="CX Phone" value={searchFilters.cxPhone} onChange={(e) => handleFilterChange('cxPhone', e.target.value)} onKeyDown={handleKeyDown} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>CUSTOMER EMAIL</label>
              <input type="text" placeholder="Customer Email" value={searchFilters.customerEmail} onChange={(e) => handleFilterChange('customerEmail', e.target.value)} onKeyDown={handleKeyDown} style={inputStyle} />
            </div>
          </div>
          
          {/* Row 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={labelStyle}>SELECT AGENT</label>
              <input type="text" placeholder="Search Agent..." value={searchFilters.agent} onChange={(e) => handleFilterChange('agent', e.target.value)} onKeyDown={handleKeyDown} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>BOOKING STATUS</label>
              <select value={searchFilters.bookingStatus} onChange={(e) => handleFilterChange('bookingStatus', e.target.value)} style={{ ...inputStyle, cursor: 'pointer', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', paddingRight: '2rem' }}>
                <option value="All Statuses">All Statuses</option>
                <option value="Confirmed">Confirmed</option>
                <option value="On Hold">On Hold</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>CUSTOMER ALTERNATE NUMBER</label>
              <input type="text" placeholder="Customer Alternate Number" value={searchFilters.customerAltNumber} onChange={(e) => handleFilterChange('customerAltNumber', e.target.value)} onKeyDown={handleKeyDown} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>PASSENGER NAME</label>
              <input type="text" placeholder="Passenger name" value={searchFilters.passengerName} onChange={(e) => handleFilterChange('passengerName', e.target.value)} onKeyDown={handleKeyDown} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button onClick={handleSearch} style={{ width: '100%', padding: '0.6rem', backgroundColor: '#38b2ac', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', textTransform: 'uppercase', transition: 'background-color 0.15s ease' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#319795'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#38b2ac'}>SEARCH</button>
            </div>
          </div>
          
          {/* Divider and Row 3 */}
          <div style={{ borderTop: '1px solid #e5e7eb', margin: '1.5rem 0 0', paddingTop: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', maxWidth: '800px' }}>
              <div>
                <label style={labelStyle}>FROM DATE</label>
                <input type="date" value={searchFilters.fromDate} onChange={(e) => handleFilterChange('fromDate', e.target.value)} onKeyDown={handleKeyDown} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>TO DATE</label>
                <input type="date" value={searchFilters.toDate} onChange={(e) => handleFilterChange('toDate', e.target.value)} onKeyDown={handleKeyDown} style={inputStyle} />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                 <button onClick={handleSearch} style={{ width: '100%', padding: '0.6rem', backgroundColor: '#38b2ac', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', textTransform: 'uppercase', transition: 'background-color 0.15s ease' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#319795'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#38b2ac'}>SEARCH</button>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                 <button onClick={clearFilters} style={{ width: '100%', padding: '0.6rem', backgroundColor: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'background-color 0.15s ease' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>Clear Filters</button>
              </div>
            </div>
          </div>
        </div>
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
                          onClick={() => handleEdit(r)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.35rem 0.75rem',
                            backgroundColor: '#805ad5',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'background-color 0.15s',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#6d28d9'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#805ad5'}
                        >
                          <PlaneTakeoff size={12} />
                          Edit Itinerary
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

      {/* Edit Itinerary Form */}
      {selectedReservation && editData && (
        <div className="layout-container" style={{ marginTop: '1.25rem' }}>
          <div className="layout-main">
            <div style={{
              background: 'white',
              borderRadius: '6px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              overflow: 'hidden',
            }}>
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#faf5ff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <PlaneTakeoff size={18} color="#6d28d9" />
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1f2937', margin: 0 }}>
                    Edit Itinerary — {editData.id}
                  </h3>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600, background: '#ede9fe', color: '#6d28d9', padding: '0.15rem 0.5rem', borderRadius: '4px', letterSpacing: '0.5px' }}>
                    PNR: {editData.pnr}
                  </span>
                </div>
                <button onClick={handleCancelEdit} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '4px', background: 'white', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', color: '#374151' }}>
                  <X size={14} /> Cancel
                </button>
              </div>

              <div style={{ padding: '1.5rem' }}>
                {saved && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: '#d1fae5', border: '1px solid #a7f3d0', borderRadius: '6px', marginBottom: '1.5rem', color: '#065f46', fontSize: '0.85rem', fontWeight: 600 }}>
                    <Check size={16} /> Itinerary updated successfully!
                  </div>
                )}

                {/* Trip Type Selector */}
                <div style={{ display: 'flex', gap: '0.25rem', padding: '0.25rem', background: 'white', borderRadius: '9999px', border: '1px solid #e2e8f0', width: 'fit-content', marginBottom: '1.5rem' }}>
                  <button onClick={() => handleFieldChange('tripType', 'Round Trip')} style={{ padding: '0.5rem 1.25rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600, border: 'none', background: editData.tripType === 'Round Trip' ? '#38b2ac' : 'transparent', color: editData.tripType === 'Round Trip' ? 'white' : '#4a5568', cursor: 'pointer', transition: 'all 0.2s' }}>Round Trip</button>
                  <button onClick={() => handleFieldChange('tripType', 'One Way')} style={{ padding: '0.5rem 1.25rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600, border: 'none', background: editData.tripType === 'One Way' ? '#38b2ac' : 'transparent', color: editData.tripType === 'One Way' ? 'white' : '#4a5568', cursor: 'pointer', transition: 'all 0.2s' }}>One Way</button>
                </div>

                {/* Side-by-side Flight Cards */}
                <div style={{ display: 'flex', gap: '1rem', flexDirection: editData.tripType === 'Round Trip' ? 'row' : 'column' }}>
                  {/* Outbound Card */}
                  <div style={{ flex: 1, background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                       <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#2d3748' }}>Outbound Flight</span>
                       <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#319795', background: '#e6fffa', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>{editData.origin} → {editData.destination}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: outboundSearched ? '1rem' : 0 }}>
                       <div style={{ position: 'relative', flex: 1 }}>
                         <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }} />
                         <input type="text" placeholder={`e.g. DL ${editData.origin} ${editData.destination}`} style={{ width: '100%', padding: '0.65rem 0.75rem 0.65rem 2.25rem', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '0.875rem', outline: 'none' }} />
                       </div>
                       <button onClick={() => setOutboundSearched(true)} style={{ padding: '0.65rem 1rem', background: '#38b2ac', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#319795'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#38b2ac'}>Search</button>
                    </div>
                    {outboundSearched && (
                      <div style={{ paddingTop: '1rem', borderTop: '1px dashed #e2e8f0' }}>
                        <select value={editData.newOutboundFlight} onChange={(e) => handleFieldChange('newOutboundFlight', e.target.value)} style={{ ...inputStyle, cursor: 'pointer', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', paddingRight: '2rem' }}>
                          <option value="">-- Choose Flight --</option>
                          <option value="AA 100 - 08:00 AM">AA 100 - 08:00 AM (American Airlines) - Direct</option>
                          <option value="DL 455 - 11:30 AM">DL 455 - 11:30 AM (Delta Air Lines) - Direct</option>
                          <option value="UA 12 - 03:15 PM">UA 12 - 03:15 PM (United Airlines) - Direct</option>
                          <option value="B6 323 - 07:45 PM">B6 323 - 07:45 PM (JetBlue Airways) - Direct</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Inbound Card */}
                  {editData.tripType === 'Round Trip' && (
                  <div style={{ flex: 1, background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                       <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#2d3748' }}>Inbound Flight</span>
                       <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#319795', background: '#e6fffa', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>{editData.destination} → {editData.origin}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: inboundSearched ? '1rem' : 0 }}>
                       <div style={{ position: 'relative', flex: 1 }}>
                         <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }} />
                         <input type="text" placeholder={`e.g. DL ${editData.destination} ${editData.origin}`} style={{ width: '100%', padding: '0.65rem 0.75rem 0.65rem 2.25rem', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '0.875rem', outline: 'none' }} />
                       </div>
                       <button onClick={() => setInboundSearched(true)} style={{ padding: '0.65rem 1rem', background: '#38b2ac', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#319795'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#38b2ac'}>Search</button>
                    </div>
                    {inboundSearched && (
                      <div style={{ paddingTop: '1rem', borderTop: '1px dashed #e2e8f0' }}>
                        <select value={editData.newInboundFlight} onChange={(e) => handleFieldChange('newInboundFlight', e.target.value)} style={{ ...inputStyle, cursor: 'pointer', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', paddingRight: '2rem' }}>
                          <option value="">-- Choose Flight --</option>
                          <option value="AA 200 - 09:15 AM">AA 200 - 09:15 AM (American Airlines) - Direct</option>
                          <option value="DL 655 - 01:00 PM">DL 655 - 01:00 PM (Delta Air Lines) - Direct</option>
                          <option value="UA 52 - 04:45 PM">UA 52 - 04:45 PM (United Airlines) - Direct</option>
                          <option value="B6 423 - 09:20 PM">B6 423 - 09:20 PM (JetBlue Airways) - Direct</option>
                        </select>
                      </div>
                    )}
                  </div>
                  )}
                </div>

                {/* Billing & Timing Details */}
                <div style={{ marginTop: '2rem', padding: '1.25rem', border: '1px solid #e5e7eb', borderRadius: '6px', backgroundColor: '#f9fafb' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#4b5563', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Billing & Timing Details
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>Payment Option</label>
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600, color: '#374151' }}>
                          <input 
                            type="radio" 
                            name="paymentOption" 
                            value="Customer Card" 
                            checked={editData.paymentOption === 'Customer Card'} 
                            onChange={(e) => handleFieldChange('paymentOption', e.target.value)}
                            style={{ accentColor: '#805ad5' }}
                          /> Customer Card
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600, color: '#374151' }}>
                          <input 
                            type="radio" 
                            name="paymentOption" 
                            value="Company Card" 
                            checked={editData.paymentOption === 'Company Card'} 
                            onChange={(e) => handleFieldChange('paymentOption', e.target.value)}
                            style={{ accentColor: '#805ad5' }}
                          /> Company Card
                        </label>
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Editable Billing Amount ($)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        value={editData.billingAmount || ''} 
                        onChange={(e) => handleFieldChange('billingAmount', e.target.value)} 
                        style={inputStyle} 
                      />
                    </div>
                  </div>
                </div>

                {/* Notes (Required) */}
                <div style={{ marginTop: '2rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 700, color: '#374151', marginBottom: '0.5rem' }}>
                    Note <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Date & Time:</span>
                    <input 
                      type="text" 
                      value={editData.editDateTime || ''} 
                      readOnly 
                      style={{ flex: 1, padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#f1f5f9', color: '#64748b', fontSize: '0.875rem', outline: 'none', cursor: 'not-allowed' }}
                    />
                  </div>
                  <textarea 
                    value={editData.note || ''} 
                    onChange={(e) => handleFieldChange('note', e.target.value)}
                    required
                    placeholder="Enter reason for itinerary change..."
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.875rem', outline: 'none', minHeight: '80px', fontFamily: 'inherit', resize: 'vertical' }}
                  />
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
                  <button onClick={handleSave} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.5rem', backgroundColor: '#805ad5', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', transition: 'background-color 0.15s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#6d28d9'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#805ad5'}>
                    <Save size={16} /> Save Itinerary
                  </button>
                  <button onClick={handleCancelEdit} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.5rem', backgroundColor: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="layout-sidebar">
            <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
              <div style={{ background: 'var(--bg-topnav)', padding: '1.25rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plane size={20} style={{ color: 'var(--primary-accent)' }} />
                <h3 style={{ fontWeight: 600, fontSize: '1.125rem', margin: 0 }}>Changed Booking Summary</h3>
              </div>
              
              <div style={{ padding: '1.5rem' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.5rem' }}>Itinerary</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600, fontSize: '1.125rem', color: 'var(--text-primary)' }}>
                    <span>{editData.origin}</span>
                    <ArrowRightLeft size={16} style={{ color: 'var(--text-muted)' }} />
                    <span>{editData.destination}</span>
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                   <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.75rem' }}>Outbound Flight</div>
                   {editData.newOutboundFlight ? (
                     <div>
                       <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{editData.newOutboundFlight.split('(')[1]?.replace(')', '') || 'Selected Flight'}</div>
                       <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                         <span style={{ fontWeight: 600 }}>Depart:</span> {new Date(editData.travelDate).toLocaleDateString()} at {editData.newOutboundFlight.split(' - ')[1]?.split(' (')[0] || '--:--'}
                       </div>
                     </div>
                   ) : (
                     <div style={{ fontSize: '0.875rem', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                       <AlertCircle size={14} /> Select new outbound flight
                     </div>
                   )}
                </div>

                {editData.tripType === 'Round Trip' && (
                  <div style={{ marginBottom: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                     <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.75rem' }}>Inbound Flight</div>
                     {editData.newInboundFlight ? (
                       <div>
                         <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{editData.newInboundFlight.split('(')[1]?.replace(')', '') || 'Selected Flight'}</div>
                         <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                           <span style={{ fontWeight: 600 }}>Return:</span> {editData.returnDate ? new Date(editData.returnDate).toLocaleDateString() : '--'} at {editData.newInboundFlight.split(' - ')[1]?.split(' (')[0] || '--:--'}
                         </div>
                       </div>
                     ) : (
                       <div style={{ fontSize: '0.875rem', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                         <AlertCircle size={14} /> Select new inbound flight
                       </div>
                     )}
                  </div>
                )}
                
                <div style={{ background: 'var(--bg-base)', margin: '-1.5rem -1.5rem 0', padding: '1.5rem', borderTop: '1px solid var(--border-color)', marginTop: '0' }}>
                   <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Fare Difference</span>
                     <span style={{ fontSize: '1.25rem', fontWeight: 800, color: (editData.newOutboundFlight || editData.newInboundFlight) ? 'var(--success)' : 'var(--text-muted)' }}>
                       {(editData.newOutboundFlight || editData.newInboundFlight) ? `+$${parseFloat(editData.billingAmount || 0).toFixed(2)}` : '---'}
                     </span>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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

export default ChangeItinerary;
