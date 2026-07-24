import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Check, PlaneTakeoff, MapPin, Grid, Ticket, AlertCircle, RefreshCw, Send, CheckCircle2 } from 'lucide-react';

const mockReservations = [
  { id: 'ZSM-10041', cxId: 'CX-1001', pnr: 'XKRT4P', pnrStatus: 'PNR Created', firstName: 'John', lastName: 'Smith', email: 'john.smith@email.com', phone: '+1 212-555-0141', altPhone: '+1 212-555-0199', route: 'JFK → LAX', origin: 'JFK', destination: 'LAX', airline: 'American Airlines', flightNumber: 'AA 100', travelDate: '2026-08-15', bookingDate: '2026-07-18', status: 'Confirmed', agent: 'Agent A', seatStatus: 'Seat Not Assigned', passengers: [{ id: 1, name: 'John Smith', type: 'Adult', seat: null }] },
  { id: 'ZSM-10042', cxId: 'CX-1002', pnr: 'BMNW2L', pnrStatus: 'PNR Created', firstName: 'Emily', lastName: 'Johnson', email: 'emily.johnson@email.com', phone: '+1 312-555-0198', altPhone: '', route: 'ORD → MIA', origin: 'ORD', destination: 'MIA', airline: 'Delta Air Lines', flightNumber: 'DL 455', travelDate: '2026-08-20', bookingDate: '2026-07-19', status: 'Confirmed', agent: 'Agent B', seatStatus: 'Partially Assigned', passengers: [{ id: 1, name: 'Emily Johnson', type: 'Adult', seat: '12A' }, { id: 2, name: 'Robert Johnson', type: 'Adult', seat: null }] },
  { id: 'ZSM-10043', cxId: 'CX-1003', pnr: '', pnrStatus: 'Not Created', firstName: 'Robert', lastName: 'Williams', email: 'robert.williams@email.com', phone: '+1 415-555-0176', altPhone: '+1 415-555-0188', route: 'SFO → SEA', origin: 'SFO', destination: 'SEA', airline: 'United Airlines', flightNumber: 'UA 12', travelDate: '2026-08-10', bookingDate: '2026-07-17', status: 'On Hold', agent: 'Agent A', seatStatus: 'Seat Not Assigned', passengers: [{ id: 1, name: 'Robert Williams', type: 'Adult', seat: null }] },
  { id: 'ZSM-10044', cxId: 'CX-1004', pnr: 'PLRV9S', pnrStatus: 'PNR Created', firstName: 'Maria', lastName: 'Garcia', email: 'maria.garcia@email.com', phone: '+1 310-555-0134', altPhone: '', route: 'LAX → JFK', origin: 'LAX', destination: 'JFK', airline: 'JetBlue Airways', flightNumber: 'B6 323', travelDate: '2026-09-01', bookingDate: '2026-07-20', status: 'Confirmed', agent: 'Agent C', seatStatus: 'Seat Assigned', passengers: [{ id: 1, name: 'Maria Garcia', type: 'Adult', seat: '14C' }] },
  { id: 'ZSM-10045', cxId: 'CX-1005', pnr: 'HCNK3W', pnrStatus: 'PNR Created', firstName: 'James', lastName: 'Brown', email: 'james.brown@email.com', phone: '+1 214-555-0167', altPhone: '+1 214-555-0145', route: 'DFW → ATL', origin: 'DFW', destination: 'ATL', airline: 'American Airlines', flightNumber: 'AA 98', travelDate: '2026-08-05', bookingDate: '2026-07-15', status: 'Cancelled', agent: 'Agent B', seatStatus: 'Seat Not Assigned', passengers: [{ id: 1, name: 'James Brown', type: 'Adult', seat: null }] },
  { id: 'ZSM-10046', cxId: 'CX-1006', pnr: 'YWMZ5A', pnrStatus: 'PNR Created', firstName: 'Patricia', lastName: 'Davis', email: 'patricia.davis@email.com', phone: '+1 617-555-0123', altPhone: '', route: 'BOS → DCA', origin: 'BOS', destination: 'DCA', airline: 'Delta Air Lines', flightNumber: 'DL 567', travelDate: '2026-08-22', bookingDate: '2026-07-21', status: 'On Hold', agent: 'Agent A', seatStatus: 'Seat Not Assigned', passengers: [{ id: 1, name: 'Patricia Davis', type: 'Adult', seat: null }, { id: 2, name: 'Michael Davis', type: 'Adult', seat: null }] },
  { id: 'ZSM-10047', cxId: 'CX-1007', pnr: 'TQJS8E', pnrStatus: 'PNR Created', firstName: 'Michael', lastName: 'Wilson', email: 'michael.wilson@email.com', phone: '+1 305-555-0189', altPhone: '+1 305-555-0102', route: 'MIA → ORD', origin: 'MIA', destination: 'ORD', airline: 'United Airlines', flightNumber: 'UA 881', travelDate: '2026-08-18', bookingDate: '2026-07-16', status: 'Confirmed', agent: 'Agent C', seatStatus: 'Seat Assigned', passengers: [{ id: 1, name: 'Michael Wilson', type: 'Adult', seat: '5A' }] },
  { id: 'ZSM-10048', cxId: 'CX-1008', pnr: '', pnrStatus: 'Not Created', firstName: 'Linda', lastName: 'Martinez', email: 'linda.martinez@email.com', phone: '+1 206-555-0156', altPhone: '', route: 'SEA → SFO', origin: 'SEA', destination: 'SFO', airline: 'Alaska Airlines', flightNumber: 'AS 101', travelDate: '2026-08-25', bookingDate: '2026-07-22', status: 'Pending', agent: 'Agent B', seatStatus: 'Seat Not Assigned', passengers: [{ id: 1, name: 'Linda Martinez', type: 'Adult', seat: null }] },
];

// Generate a mock seat map (e.g. rows 1-20, seats A-F)
const generateSeatMap = () => {
  const map = [];
  for (let r = 1; r <= 20; r++) {
    const row = [];
    ['A', 'B', 'C', 'D', 'E', 'F'].forEach(l => {
      // randomly assign occupied or available
      const status = Math.random() > 0.7 ? 'Occupied' : 'Available';
      // Extra legroom for rows 1, 10, 11
      const type = [1, 10, 11].includes(r) ? 'Extra Legroom' : 'Standard';
      const price = type === 'Extra Legroom' ? 35 : 0;
      row.push({ id: `${r}${l}`, label: `${r}${l}`, status, type, price });
    });
    map.push(row);
  }
  return map;
};

const SeatAssign = () => {
  const [searchFilters, setSearchFilters] = useState({
    cxId: '', bookingId: '', pnr: '', customerName: '', cxPhone: '', customerEmail: '',
    agent: '', bookingStatus: 'All Statuses', customerAltNumber: '', passengerName: '',
    fromDate: '', toDate: '', seatStatus: 'All Statuses'
  });
  
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [seatMap, setSeatMap] = useState([]);
  const [isSeatMapOpen, setIsSeatMapOpen] = useState(false);
  
  const [selectedPassenger, setSelectedPassenger] = useState(null);
  const [pendingSeatSelection, setPendingSeatSelection] = useState(null);
  
  const [alertMessage, setAlertMessage] = useState(null);

  const handleFilterChange = (field, value) => {
    setSearchFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handleSearch(); }
  };

  const handleSearch = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setHasSearched(true);
    setSelectedBooking(null);
    
    const results = mockReservations.filter(r => {
      let match = true;
      // CX ID filter
      if (searchFilters.cxId && !r.cxId.toLowerCase().includes(searchFilters.cxId.toLowerCase().trim())) match = false;
      // Booking ID filter
      if (searchFilters.bookingId && !r.id.toLowerCase().includes(searchFilters.bookingId.toLowerCase().trim())) match = false;
      // PNR filter
      if (searchFilters.pnr && !r.pnr.toLowerCase().includes(searchFilters.pnr.toLowerCase().trim())) match = false;
      // Customer Name filter
      const fullName = `${r.firstName} ${r.lastName}`.toLowerCase();
      if (searchFilters.customerName && !fullName.includes(searchFilters.customerName.toLowerCase().trim())) match = false;
      // Passenger Name filter (searches passenger list)
      if (searchFilters.passengerName) {
        const paxMatch = r.passengers.some(p => p.name.toLowerCase().includes(searchFilters.passengerName.toLowerCase().trim()));
        if (!paxMatch) match = false;
      }
      // CX Phone filter
      if (searchFilters.cxPhone && !r.phone.includes(searchFilters.cxPhone.trim())) match = false;
      // Customer Alternate Number filter
      if (searchFilters.customerAltNumber && (!r.altPhone || !r.altPhone.includes(searchFilters.customerAltNumber.trim()))) match = false;
      // Customer Email filter
      if (searchFilters.customerEmail && !r.email.toLowerCase().includes(searchFilters.customerEmail.toLowerCase().trim())) match = false;
      // Agent filter
      if (searchFilters.agent && !r.agent.toLowerCase().includes(searchFilters.agent.toLowerCase().trim())) match = false;
      // Booking Status dropdown
      if (searchFilters.bookingStatus !== 'All Statuses' && r.status !== searchFilters.bookingStatus) match = false;
      // Seat Status dropdown
      if (searchFilters.seatStatus !== 'All Statuses' && r.seatStatus !== searchFilters.seatStatus) match = false;
      // Date range filter
      if (searchFilters.fromDate && r.bookingDate < searchFilters.fromDate) match = false;
      if (searchFilters.toDate && r.bookingDate > searchFilters.toDate) match = false;
      return match;
    });
    setSearchResults(results);
  };

  const handleClear = () => {
    setSearchFilters({
      cxId: '', bookingId: '', pnr: '', customerName: '', cxPhone: '', customerEmail: '',
      agent: '', bookingStatus: 'All Statuses', customerAltNumber: '', passengerName: '',
      fromDate: '', toDate: '', seatStatus: 'All Statuses'
    });
    setSearchResults([]);
    setHasSearched(false);
    setSelectedBooking(null);
  };

  const openSeatMap = (booking) => {
    setSelectedBooking(booking);
    setSeatMap(generateSeatMap());
    setSelectedPassenger(booking.passengers[0]);
    setPendingSeatSelection(null);
    setIsSeatMapOpen(true);
  };

  const closeSeatMap = () => {
    setIsSeatMapOpen(false);
    setSelectedBooking(null);
  };

  const selectSeat = (seat) => {
    if (seat.status === 'Occupied') return;
    
    // Check if another passenger already has this seat in pending selection
    const isTakenByAnother = selectedBooking.passengers.some(p => p.seat === seat.id && p.id !== selectedPassenger.id);
    if (isTakenByAnother) {
       setAlertMessage("Seat already assigned to another passenger in this booking.");
       return;
    }

    setPendingSeatSelection(seat);
  };

  const confirmSeatAssignment = () => {
    if (!pendingSeatSelection) return;
    
    const updatedPassengers = selectedBooking.passengers.map(p => {
       if (p.id === selectedPassenger.id) {
           return { ...p, seat: pendingSeatSelection.id };
       }
       return p;
    });

    const assignedCount = updatedPassengers.filter(p => p.seat !== null).length;
    let newSeatStatus = 'Seat Not Assigned';
    if (assignedCount === updatedPassengers.length) newSeatStatus = 'Seat Assigned';
    else if (assignedCount > 0) newSeatStatus = 'Partially Assigned';

    const updatedBooking = { ...selectedBooking, passengers: updatedPassengers, seatStatus: newSeatStatus };
    
    setSelectedBooking(updatedBooking);
    
    // Update the search results to reflect the new state
    setSearchResults(prev => prev.map(r => r.id === updatedBooking.id ? updatedBooking : r));
    
    setPendingSeatSelection(null);
  };

  const handleCreatePNR = () => {
     // Mock PNR creation
     const newPNR = 'Z' + Math.random().toString(36).substring(2, 6).toUpperCase();
     const updatedBooking = { ...selectedBooking, pnr: newPNR, pnrStatus: 'PNR Created' };
     setSelectedBooking(updatedBooking);
     setSearchResults(prev => prev.map(r => r.id === updatedBooking.id ? updatedBooking : r));
     setAlertMessage(`PNR Created Successfully: ${newPNR}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="page-container" style={{ padding: '2rem' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>Seat Assignment & PNR</h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>Manage seat assignments and create PNRs for flight reservations.</p>
        </div>
        
        {/* Search Panel */}
        <div style={{ background: 'white', borderRadius: '6px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={{ borderBottom: '3px solid #38b2ac', padding: '1.25rem 1.5rem 1rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#319795', margin: 0 }}>
              Seat Assignment & PNR
            </h2>
          </div>

          <div style={{ padding: '1.5rem', background: '#f8fafc' }}>
            {/* Row 1: 6 columns */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6b7280', marginBottom: '0.375rem' }}>CXID</label>
                <input type="text" placeholder="CXId" value={searchFilters.cxId} onChange={(e) => handleFilterChange('cxId', e.target.value)} onKeyDown={handleKeyDown} style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.875rem', color: '#374151', backgroundColor: 'white', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6b7280', marginBottom: '0.375rem' }}>BOOKINGID</label>
                <input type="text" placeholder="BookingId" value={searchFilters.bookingId} onChange={(e) => handleFilterChange('bookingId', e.target.value)} onKeyDown={handleKeyDown} style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.875rem', color: '#374151', backgroundColor: 'white', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6b7280', marginBottom: '0.375rem' }}>PNR</label>
                <input type="text" placeholder="PNR" value={searchFilters.pnr} onChange={(e) => handleFilterChange('pnr', e.target.value)} onKeyDown={handleKeyDown} style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.875rem', color: '#374151', backgroundColor: 'white', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6b7280', marginBottom: '0.375rem' }}>CUSTOMER NAME</label>
                <input type="text" placeholder="Customer Name" value={searchFilters.customerName} onChange={(e) => handleFilterChange('customerName', e.target.value)} onKeyDown={handleKeyDown} style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.875rem', color: '#374151', backgroundColor: 'white', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6b7280', marginBottom: '0.375rem' }}>CX PHONE</label>
                <input type="text" placeholder="CX Phone" value={searchFilters.cxPhone} onChange={(e) => handleFilterChange('cxPhone', e.target.value)} onKeyDown={handleKeyDown} style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.875rem', color: '#374151', backgroundColor: 'white', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6b7280', marginBottom: '0.375rem' }}>CUSTOMER EMAIL</label>
                <input type="text" placeholder="Customer Email" value={searchFilters.customerEmail} onChange={(e) => handleFilterChange('customerEmail', e.target.value)} onKeyDown={handleKeyDown} style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.875rem', color: '#374151', backgroundColor: 'white', outline: 'none' }} />
              </div>
            </div>
            
            {/* Row 2: 5 columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6b7280', marginBottom: '0.375rem' }}>SELECT AGENT</label>
                <input type="text" placeholder="Search Agent..." value={searchFilters.agent} onChange={(e) => handleFilterChange('agent', e.target.value)} onKeyDown={handleKeyDown} style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.875rem', color: '#374151', backgroundColor: 'white', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6b7280', marginBottom: '0.375rem' }}>BOOKING STATUS</label>
                <select value={searchFilters.bookingStatus} onChange={(e) => handleFilterChange('bookingStatus', e.target.value)} style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.875rem', color: '#374151', backgroundColor: 'white', outline: 'none', cursor: 'pointer' }}>
                  <option value="All Statuses">All Statuses</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6b7280', marginBottom: '0.375rem' }}>CUSTOMER ALTERNATE NUMBER</label>
                <input type="text" placeholder="Customer Alternate Number" value={searchFilters.customerAltNumber} onChange={(e) => handleFilterChange('customerAltNumber', e.target.value)} onKeyDown={handleKeyDown} style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.875rem', color: '#374151', backgroundColor: 'white', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6b7280', marginBottom: '0.375rem' }}>PASSENGER NAME</label>
                <input type="text" placeholder="Passenger name" value={searchFilters.passengerName} onChange={(e) => handleFilterChange('passengerName', e.target.value)} onKeyDown={handleKeyDown} style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.875rem', color: '#374151', backgroundColor: 'white', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button type="button" onClick={handleSearch} style={{ width: '100%', padding: '0.6rem', backgroundColor: '#38b2ac', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', textTransform: 'uppercase', transition: 'background-color 0.15s ease' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#319795'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#38b2ac'}>SEARCH</button>
              </div>
            </div>
            
            {/* Row 3: Date range + Seat Status + actions */}
            <div style={{ borderTop: '1px solid #e5e7eb', margin: '1.5rem 0 0', paddingTop: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', maxWidth: '100%' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6b7280', marginBottom: '0.375rem' }}>FROM DATE</label>
                  <input type="date" value={searchFilters.fromDate} onChange={(e) => handleFilterChange('fromDate', e.target.value)} onKeyDown={handleKeyDown} style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.875rem', color: '#374151', backgroundColor: 'white', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6b7280', marginBottom: '0.375rem' }}>TO DATE</label>
                  <input type="date" value={searchFilters.toDate} onChange={(e) => handleFilterChange('toDate', e.target.value)} onKeyDown={handleKeyDown} style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.875rem', color: '#374151', backgroundColor: 'white', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6b7280', marginBottom: '0.375rem' }}>SEAT STATUS</label>
                  <select value={searchFilters.seatStatus} onChange={(e) => handleFilterChange('seatStatus', e.target.value)} style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.875rem', color: '#374151', backgroundColor: 'white', outline: 'none', cursor: 'pointer' }}>
                    <option value="All Statuses">All Statuses</option>
                    <option value="Seat Assigned">Seat Assigned</option>
                    <option value="Seat Not Assigned">Seat Not Assigned</option>
                    <option value="Partially Assigned">Partially Assigned</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                   <button type="button" onClick={handleSearch} style={{ width: '100%', padding: '0.6rem', backgroundColor: '#38b2ac', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', textTransform: 'uppercase', transition: 'background-color 0.15s ease' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#319795'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#38b2ac'}>SEARCH</button>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                   <button type="button" onClick={handleClear} style={{ width: '100%', padding: '0.6rem', backgroundColor: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'background-color 0.15s ease' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>Clear Filters</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Results */}
        {hasSearched && !selectedBooking && (
          <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
            {searchResults.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: 'var(--bg-base)', color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <tr>
                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Booking ID</th>
                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Customer</th>
                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Route</th>
                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>PNR Status</th>
                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Seat Status</th>
                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map((reservation) => (
                    <tr key={reservation.id} style={{ borderTop: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>{reservation.id}</td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{reservation.firstName} {reservation.lastName}</div>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>{reservation.route}</td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <span style={{ padding: '0.25rem 0.75rem', background: reservation.pnrStatus === 'PNR Created' ? '#d1fae5' : '#fef3c7', color: reservation.pnrStatus === 'PNR Created' ? '#065f46' : '#92400e', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600 }}>
                          {reservation.pnrStatus}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <span style={{ padding: '0.25rem 0.75rem', background: reservation.seatStatus === 'Seat Assigned' ? '#d1fae5' : (reservation.seatStatus === 'Seat Not Assigned' ? '#fee2e2' : '#e0f2fe'), color: reservation.seatStatus === 'Seat Assigned' ? '#065f46' : (reservation.seatStatus === 'Seat Not Assigned' ? '#991b1b' : '#075985'), borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600 }}>
                          {reservation.seatStatus}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                        <button onClick={() => openSeatMap(reservation)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'white', border: '1px solid var(--primary-accent)', color: 'var(--primary-accent)', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer' }}>
                          <Grid size={16} /> Manage Seats
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
               <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                  <AlertCircle size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No Bookings Found</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your search filters.</p>
               </div>
            )}
          </div>
        )}
      </div>

      {/* Seat Map Modal */}
      {isSeatMapOpen && selectedBooking && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '2rem' }}>
          <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '1200px', height: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: 'var(--shadow-xl)' }}>
            
            {/* Modal Header */}
            <div style={{ padding: '1.5rem 2rem', background: 'var(--bg-topnav)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                     <Ticket size={24} /> Seat Assignment & PNR
                  </h2>
                  <div style={{ fontSize: '0.875rem', marginTop: '0.25rem', color: 'rgba(255,255,255,0.8)' }}>Booking: {selectedBooking.id} • Route: {selectedBooking.route}</div>
               </div>
               <button onClick={closeSeatMap} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                 <X size={24} />
               </button>
            </div>

            {/* Modal Body */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              
              {/* Left Sidebar - Passenger & PNR Control */}
              <div style={{ width: '350px', background: '#f8fafc', borderRight: '1px solid var(--border-color)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto' }}>
                 
                 {/* PNR Section */}
                 <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>PNR Status</h3>
                    {selectedBooking.pnr ? (
                       <div>
                         <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-accent)', fontFamily: 'monospace', letterSpacing: '2px', marginBottom: '0.5rem' }}>{selectedBooking.pnr}</div>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', fontSize: '0.875rem', fontWeight: 600 }}>
                           <CheckCircle2 size={16} /> Successfully Created
                         </div>
                       </div>
                    ) : (
                       <div>
                         <div style={{ color: 'var(--warning)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                           <AlertCircle size={16} /> Not Created Yet
                         </div>
                         <button onClick={handleCreatePNR} style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'var(--primary-accent)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer' }}>
                           <RefreshCw size={16} /> Generate PNR
                         </button>
                       </div>
                    )}
                 </div>

                 {/* Passenger Selection */}
                 <div>
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Select Passenger to Assign</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                       {selectedBooking.passengers.map(p => (
                          <div 
                             key={p.id} 
                             onClick={() => { setSelectedPassenger(p); setPendingSeatSelection(null); }}
                             style={{ 
                                padding: '1rem', 
                                background: selectedPassenger?.id === p.id ? 'white' : 'transparent', 
                                border: `2px solid ${selectedPassenger?.id === p.id ? 'var(--primary-accent)' : 'var(--border-color)'}`, 
                                borderRadius: 'var(--radius-md)', 
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: selectedPassenger?.id === p.id ? 'var(--shadow-sm)' : 'none'
                             }}
                          >
                             <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</div>
                             <div style={{ fontSize: '0.875rem', color: p.seat ? 'var(--success)' : 'var(--text-muted)', marginTop: '0.25rem', display: 'flex', justifyContent: 'space-between' }}>
                                <span>{p.seat ? `Assigned: Seat ${p.seat}` : 'Not Assigned'}</span>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>

                 {/* Confirmation Box */}
                 {pendingSeatSelection && (
                    <div style={{ background: '#ebf8ff', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid #90cdf4', marginTop: 'auto' }}>
                       <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: 700, color: '#2b6cb0', textTransform: 'uppercase' }}>Confirm Seat</h4>
                       <div style={{ marginBottom: '1rem', color: '#2c5282', fontSize: '0.875rem' }}>
                          Assign <strong>Seat {pendingSeatSelection.id}</strong> ({pendingSeatSelection.type}) to <strong>{selectedPassenger?.name}</strong>?
                       </div>
                       <button onClick={confirmSeatAssignment} style={{ width: '100%', padding: '0.75rem', background: '#3182ce', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer' }}>
                          Confirm Assignment
                       </button>
                    </div>
                 )}
              </div>

              {/* Right Area - Seat Map */}
              <div style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column', background: 'white', overflowY: 'auto' }}>
                 
                 {/* Legend */}
                 <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem', padding: '1rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                       <div style={{ width: '20px', height: '20px', background: 'white', border: '2px solid var(--border-color)', borderRadius: '4px' }}></div> Available
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                       <div style={{ width: '20px', height: '20px', background: 'white', border: '2px solid #90cdf4', borderRadius: '4px' }}></div> Extra Legroom
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                       <div style={{ width: '20px', height: '20px', background: '#e2e8f0', border: '2px solid #cbd5e1', borderRadius: '4px', position: 'relative' }}>
                          <X size={16} color="#94a3b8" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
                       </div> Occupied
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                       <div style={{ width: '20px', height: '20px', background: 'var(--primary-accent)', borderRadius: '4px' }}></div> Selected
                    </div>
                 </div>

                 {/* Aircraft Layout Grid */}
                 <div style={{ margin: '0 auto', background: '#f1f5f9', padding: '3rem', borderRadius: '2rem 2rem 1rem 1rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '4px solid #cbd5e1' }}>
                    <div style={{ textAlign: 'center', color: '#64748b', fontWeight: 700, letterSpacing: '4px', marginBottom: '2rem' }}>FRONT GALLEY</div>
                    
                    {seatMap.map((row, rowIndex) => (
                       <div key={rowIndex} style={{ display: 'flex', gap: '1rem', justifyContent: 'center', alignItems: 'center' }}>
                          {/* Row Number */}
                          <div style={{ width: '30px', textAlign: 'center', fontWeight: 700, color: '#94a3b8', fontSize: '0.875rem' }}>{rowIndex + 1}</div>
                          
                          {/* Left Seats (A, B, C) */}
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                             {row.slice(0, 3).map(seat => {
                                const isOccupied = seat.status === 'Occupied';
                                const isPending = pendingSeatSelection?.id === seat.id;
                                // Check if assigned to any passenger in current booking
                                const assignedToPassenger = selectedBooking.passengers.find(p => p.seat === seat.id);
                                const isAssignedToCurrent = assignedToPassenger?.id === selectedPassenger?.id;
                                const isAssignedToOther = assignedToPassenger && assignedToPassenger.id !== selectedPassenger?.id;
                                
                                const isSelected = isPending || isAssignedToCurrent;
                                const isUnavailable = isOccupied || isAssignedToOther;

                                return (
                                   <button 
                                      key={seat.id}
                                      onClick={() => selectSeat(seat)}
                                      disabled={isUnavailable && !isAssignedToCurrent}
                                      style={{ 
                                         width: '45px', height: '45px', borderRadius: '8px', 
                                         background: isSelected ? 'var(--primary-accent)' : (isUnavailable ? '#e2e8f0' : 'white'),
                                         border: `2px solid ${isSelected ? 'var(--primary-accent)' : (isUnavailable ? '#cbd5e1' : (seat.type === 'Extra Legroom' ? '#90cdf4' : 'var(--border-color)'))}`,
                                         color: isSelected ? 'white' : (isUnavailable ? '#94a3b8' : 'var(--text-primary)'),
                                         fontWeight: 700, fontSize: '0.75rem',
                                         cursor: (isUnavailable && !isAssignedToCurrent) ? 'not-allowed' : 'pointer',
                                         display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
                                         transition: 'all 0.1s'
                                      }}
                                   >
                                      {isUnavailable && !isSelected && <X size={20} style={{ position: 'absolute', opacity: 0.5 }} />}
                                      {seat.id.replace(/[0-9]/g, '')}
                                   </button>
                                );
                             })}
                          </div>

                          {/* Aisle */}
                          <div style={{ width: '40px' }}></div>

                          {/* Right Seats (D, E, F) */}
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                             {row.slice(3, 6).map(seat => {
                                const isOccupied = seat.status === 'Occupied';
                                const isPending = pendingSeatSelection?.id === seat.id;
                                const assignedToPassenger = selectedBooking.passengers.find(p => p.seat === seat.id);
                                const isAssignedToCurrent = assignedToPassenger?.id === selectedPassenger?.id;
                                const isAssignedToOther = assignedToPassenger && assignedToPassenger.id !== selectedPassenger?.id;
                                
                                const isSelected = isPending || isAssignedToCurrent;
                                const isUnavailable = isOccupied || isAssignedToOther;

                                return (
                                   <button 
                                      key={seat.id}
                                      onClick={() => selectSeat(seat)}
                                      disabled={isUnavailable && !isAssignedToCurrent}
                                      style={{ 
                                         width: '45px', height: '45px', borderRadius: '8px', 
                                         background: isSelected ? 'var(--primary-accent)' : (isUnavailable ? '#e2e8f0' : 'white'),
                                         border: `2px solid ${isSelected ? 'var(--primary-accent)' : (isUnavailable ? '#cbd5e1' : (seat.type === 'Extra Legroom' ? '#90cdf4' : 'var(--border-color)'))}`,
                                         color: isSelected ? 'white' : (isUnavailable ? '#94a3b8' : 'var(--text-primary)'),
                                         fontWeight: 700, fontSize: '0.75rem',
                                         cursor: (isUnavailable && !isAssignedToCurrent) ? 'not-allowed' : 'pointer',
                                         display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
                                         transition: 'all 0.1s'
                                      }}
                                   >
                                      {isUnavailable && !isSelected && <X size={20} style={{ position: 'absolute', opacity: 0.5 }} />}
                                      {seat.id.replace(/[0-9]/g, '')}
                                   </button>
                                );
                             })}
                          </div>
                       </div>
                    ))}
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
            <AlertCircle size={48} color="#06b6d4" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>Notice</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1rem' }}>{alertMessage}</p>
            <button 
              onClick={() => setAlertMessage(null)}
              style={{ width: '100%', padding: '0.875rem', background: '#06b6d4', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, cursor: 'pointer', boxShadow: 'var(--shadow-md)' }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatAssign;
