import React, { useState } from 'react';
import { Search, Edit3, X, User, Phone, Mail, MapPin, Save, Check, AlertCircle } from 'lucide-react';

// Mock reservations for search
const mockReservations = [
  { id: 'ZSM-10041', pnr: 'XKRT4P', firstName: 'John', middleName: 'M.', lastName: 'Smith', email: 'john.smith@email.com', phone: '+1 212-555-0141', altPhone: '+1 212-555-0199', dob: '1985-03-15', gender: 'Male', address: '123 Broadway Ave', city: 'New York', state: 'NY', zip: '10001', country: 'United States', route: 'JFK → LAX', airline: 'American Airlines', travelDate: '2026-08-15', bookingDate: '2026-07-18', status: 'On Hold' },
  { id: 'ZSM-10042', pnr: 'BMNW2L', firstName: 'Emily', middleName: 'R.', lastName: 'Johnson', email: 'emily.johnson@email.com', phone: '+1 312-555-0198', altPhone: '', dob: '1990-07-22', gender: 'Female', address: '456 Michigan Ave', city: 'Chicago', state: 'IL', zip: '60601', country: 'United States', route: 'ORD → MIA', airline: 'Delta Air Lines', travelDate: '2026-08-20', bookingDate: '2026-07-19', status: 'Confirmed' },
  { id: 'ZSM-10043', pnr: 'FDGT7Q', firstName: 'Robert', middleName: 'A.', lastName: 'Williams', email: 'robert.williams@email.com', phone: '+1 415-555-0176', altPhone: '+1 415-555-0188', dob: '1978-11-30', gender: 'Male', address: '789 Market St', city: 'San Francisco', state: 'CA', zip: '94103', country: 'United States', route: 'SFO → SEA', airline: 'United Airlines', travelDate: '2026-08-10', bookingDate: '2026-07-17', status: 'On Hold' },
  { id: 'ZSM-10044', pnr: 'PLRV9S', firstName: 'Maria', middleName: 'T.', lastName: 'Garcia', email: 'maria.garcia@email.com', phone: '+1 310-555-0134', altPhone: '', dob: '1992-01-08', gender: 'Female', address: '321 Sunset Blvd', city: 'Los Angeles', state: 'CA', zip: '90028', country: 'United States', route: 'LAX → JFK', airline: 'JetBlue Airways', travelDate: '2026-09-01', bookingDate: '2026-07-20', status: 'Confirmed' },
  { id: 'ZSM-10045', pnr: 'HCNK3W', firstName: 'James', middleName: 'L.', lastName: 'Brown', email: 'james.brown@email.com', phone: '+1 214-555-0167', altPhone: '+1 214-555-0145', dob: '1988-05-12', gender: 'Male', address: '555 Elm St', city: 'Dallas', state: 'TX', zip: '75201', country: 'United States', route: 'DFW → ATL', airline: 'American Airlines', travelDate: '2026-08-05', bookingDate: '2026-07-15', status: 'Cancelled' },
  { id: 'ZSM-10046', pnr: 'YWMZ5A', firstName: 'Patricia', middleName: 'D.', lastName: 'Davis', email: 'patricia.davis@email.com', phone: '+1 617-555-0123', altPhone: '', dob: '1995-09-25', gender: 'Female', address: '888 Beacon St', city: 'Boston', state: 'MA', zip: '02108', country: 'United States', route: 'BOS → DCA', airline: 'Delta Air Lines', travelDate: '2026-08-22', bookingDate: '2026-07-21', status: 'On Hold' },
  { id: 'ZSM-10047', pnr: 'TQJS8E', firstName: 'Michael', middleName: 'K.', lastName: 'Wilson', email: 'michael.wilson@email.com', phone: '+1 305-555-0189', altPhone: '+1 305-555-0102', dob: '1982-12-03', gender: 'Male', address: '777 Ocean Dr', city: 'Miami', state: 'FL', zip: '33139', country: 'United States', route: 'MIA → ORD', airline: 'United Airlines', travelDate: '2026-08-18', bookingDate: '2026-07-16', status: 'Confirmed' },
  { id: 'ZSM-10048', pnr: 'VNLR6D', firstName: 'Linda', middleName: 'S.', lastName: 'Martinez', email: 'linda.martinez@email.com', phone: '+1 206-555-0156', altPhone: '', dob: '1993-04-18', gender: 'Female', address: '444 Pine St', city: 'Seattle', state: 'WA', zip: '98101', country: 'United States', route: 'SEA → SFO', airline: 'Alaska Airlines', travelDate: '2026-08-25', bookingDate: '2026-07-22', status: 'Pending' },
];

const ProfileInfoChange = () => {
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
    setEditData({ ...reservation });
    setSaved(false);
  };

  const handleCancelEdit = () => {
    setSelectedReservation(null);
    setEditData(null);
    setSaved(false);
  };

  const handleFieldChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setSaved(true);
    // Update the search results with edited data
    setSearchResults(prev => prev.map(r => r.id === editData.id ? { ...editData } : r));
    // Close edit form and return to search after brief success message
    setTimeout(() => {
      setSelectedReservation(null);
      setEditData(null);
      setSaved(false);
    }, 1500);
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
            Profile Info Change
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
                    {['Booking ID', 'PNR', 'Passenger', 'Email', 'Phone', 'Route', 'Travel Date', 'Status', 'Action'].map(h => (
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
                      <td style={{ padding: '0.6rem 0.75rem', fontSize: '0.8rem', borderBottom: '1px solid #f3f4f6', color: '#6b7280' }}>{r.email}</td>
                      <td style={{ padding: '0.6rem 0.75rem', fontSize: '0.8rem', borderBottom: '1px solid #f3f4f6' }}>{r.phone}</td>
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
                          <Edit3 size={12} />
                          Edit Profile
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

      {/* Edit Profile Form */}
      {selectedReservation && editData && (
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
            background: '#faf5ff',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Edit3 size={18} color="#6d28d9" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1f2937', margin: 0 }}>
                Edit Profile — {editData.id}
              </h3>
              <span style={{
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                fontWeight: 600,
                background: '#ede9fe',
                color: '#6d28d9',
                padding: '0.15rem 0.5rem',
                borderRadius: '4px',
                letterSpacing: '0.5px',
              }}>
                PNR: {editData.pnr}
              </span>
            </div>
            <button
              onClick={handleCancelEdit}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.4rem 0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                background: 'white',
                fontSize: '0.8rem',
                fontWeight: 500,
                cursor: 'pointer',
                color: '#374151',
              }}
            >
              <X size={14} />
              Cancel
            </button>
          </div>

          <div style={{ padding: '1.5rem' }}>
            {/* Success message */}
            {saved && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                background: '#d1fae5',
                border: '1px solid #a7f3d0',
                borderRadius: '6px',
                marginBottom: '1.5rem',
                color: '#065f46',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}>
                <Check size={16} />
                Profile information updated successfully!
              </div>
            )}

            {/* Personal Information */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={sectionTitleStyle}>
                <User size={16} color="#6d28d9" />
                Personal Information
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>First Name</label>
                  <input type="text" value={editData.firstName} onChange={(e) => handleFieldChange('firstName', e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Middle Name</label>
                  <input type="text" value={editData.middleName} onChange={(e) => handleFieldChange('middleName', e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Last Name</label>
                  <input type="text" value={editData.lastName} onChange={(e) => handleFieldChange('lastName', e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Gender</label>
                  <select value={editData.gender} onChange={(e) => handleFieldChange('gender', e.target.value)} style={{ ...inputStyle, cursor: 'pointer', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', paddingRight: '2rem' }}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Date of Birth</label>
                  <input type="date" value={editData.dob} onChange={(e) => handleFieldChange('dob', e.target.value)} style={inputStyle} />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={sectionTitleStyle}>
                <Phone size={16} color="#6d28d9" />
                Contact Information
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Email Address</label>
                  <input type="email" value={editData.email} onChange={(e) => handleFieldChange('email', e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Phone Number</label>
                  <input type="tel" value={editData.phone} onChange={(e) => handleFieldChange('phone', e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Alt Phone Number</label>
                  <input type="tel" value={editData.altPhone} onChange={(e) => handleFieldChange('altPhone', e.target.value)} style={inputStyle} placeholder="Optional" />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={sectionTitleStyle}>
                <MapPin size={16} color="#6d28d9" />
                Address Information
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={labelStyle}>Street Address</label>
                  <input type="text" value={editData.address} onChange={(e) => handleFieldChange('address', e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>City</label>
                  <input type="text" value={editData.city} onChange={(e) => handleFieldChange('city', e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>State</label>
                  <input type="text" value={editData.state} onChange={(e) => handleFieldChange('state', e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>ZIP Code</label>
                  <input type="text" value={editData.zip} onChange={(e) => handleFieldChange('zip', e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Country</label>
                  <input type="text" value={editData.country} onChange={(e) => handleFieldChange('country', e.target.value)} style={inputStyle} />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid #e5e7eb' }}>
              <button
                onClick={handleSave}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.6rem 1.5rem',
                  backgroundColor: '#805ad5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background-color 0.15s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#6d28d9'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#805ad5'}
              >
                <Save size={16} />
                Save Changes
              </button>
              <button
                onClick={handleCancelEdit}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.6rem 1.5rem',
                  backgroundColor: 'white',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileInfoChange;
