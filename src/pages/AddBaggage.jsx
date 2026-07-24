import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Check, PlaneTakeoff, MapPin, Grid, Ticket, AlertCircle, RefreshCw, Send, CheckCircle2 } from 'lucide-react';

const mockReservations = [
  { id: 'ZSM-10041', cxId: 'CX-1001', pnr: 'XKRT4P', pnrStatus: 'PNR Created', firstName: 'John', lastName: 'Smith', email: 'john.smith@email.com', phone: '+1 212-555-0141', altPhone: '+1 212-555-0199', route: 'JFK → LAX', origin: 'JFK', destination: 'LAX', airline: 'American Airlines', flightNumber: 'AA 100', travelDate: '2026-08-15', bookingDate: '2026-07-18', status: 'Confirmed', agent: 'Agent A', baggageStatus: 'No Baggage Added', 
    segments: [ { id: 'seg_1', route: 'JFK → ORD', flight: 'AA 100' }, { id: 'seg_2', route: 'ORD → LAX', flight: 'AA 250' } ],
    passengers: [{ id: 1, name: 'John Smith', type: 'Adult', baggage: { 'seg_1': [], 'seg_2': [] } }] 
  },
  { id: 'ZSM-10042', cxId: 'CX-1002', pnr: 'BMNW2L', pnrStatus: 'PNR Created', firstName: 'Emily', lastName: 'Johnson', email: 'emily.johnson@email.com', phone: '+1 312-555-0198', altPhone: '', route: 'ORD → MIA', origin: 'ORD', destination: 'MIA', airline: 'Delta Air Lines', flightNumber: 'DL 455', travelDate: '2026-08-20', bookingDate: '2026-07-19', status: 'Confirmed', agent: 'Agent B', baggageStatus: 'Baggage Added', 
    segments: [ { id: 'seg_1', route: 'ORD → ATL', flight: 'DL 455' }, { id: 'seg_2', route: 'ATL → MIA', flight: 'DL 890' } ],
    passengers: [{ id: 1, name: 'Emily Johnson', type: 'Adult', baggage: { 'seg_1': [{ id: 'b_1', label: '1 × 23 KG', price: 0, type: 'Checked Baggage', status: 'Included' }], 'seg_2': [{ id: 'b_1', label: '1 × 23 KG', price: 0, type: 'Checked Baggage', status: 'Included' }] } }, { id: 2, name: 'Robert Johnson', type: 'Adult', baggage: { 'seg_1': [], 'seg_2': [] } }] 
  },
  { id: 'ZSM-10043', cxId: 'CX-1003', pnr: '', pnrStatus: 'Not Created', firstName: 'Robert', lastName: 'Williams', email: 'robert.williams@email.com', phone: '+1 415-555-0176', altPhone: '+1 415-555-0188', route: 'SFO → SEA', origin: 'SFO', destination: 'SEA', airline: 'United Airlines', flightNumber: 'UA 12', travelDate: '2026-08-10', bookingDate: '2026-07-17', status: 'On Hold', agent: 'Agent A', baggageStatus: 'No Baggage Added', 
    segments: [ { id: 'seg_1', route: 'SFO → SEA', flight: 'UA 12' } ],
    passengers: [{ id: 1, name: 'Robert Williams', type: 'Adult', baggage: { 'seg_1': [] } }] 
  }
];

const baggageOptions = [
  { id: 'cb_1', type: 'Cabin Baggage', label: '1 × 7 KG', price: 15 },
  { id: 'ch_1', type: 'Checked Baggage', label: '1 × 15 KG', price: 35 },
  { id: 'ch_2', type: 'Checked Baggage', label: '1 × 23 KG', price: 55 },
  { id: 'ch_3', type: 'Checked Baggage', label: '2 × 23 KG', price: 110 },
  { id: 'ex_1', type: 'Excess Baggage', label: '1 × 32 KG (Heavy)', price: 100 },
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

const AddBaggage = () => {
  const [searchFilters, setSearchFilters] = useState({
    cxId: '', bookingId: '', pnr: '', customerName: '', cxPhone: '', customerEmail: '',
    agent: '', bookingStatus: 'All Statuses', customerAltNumber: '', passengerName: '',
    fromDate: '', toDate: '', baggageStatus: 'All Statuses'
  });
  
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isBaggagePanelOpen, setIsBaggagePanelOpen] = useState(false);
  
  const [selectedPassenger, setSelectedPassenger] = useState(null);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [selectedBaggageType, setSelectedBaggageType] = useState('Checked Baggage');
  const [selectedBaggageOption, setSelectedBaggageOption] = useState(null);
  const [customPrice, setCustomPrice] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Customer');
  const [serviceFeeAmount, setServiceFeeAmount] = useState('10');
  const [agentNote, setAgentNote] = useState('');
  const [noteTimestamp, setNoteTimestamp] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  
  const [alertMessage, setAlertMessage] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

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
      if (searchFilters.cxId && !r.cxId.toLowerCase().includes(searchFilters.cxId.toLowerCase().trim())) match = false;
      if (searchFilters.bookingId && !r.id.toLowerCase().includes(searchFilters.bookingId.toLowerCase().trim())) match = false;
      if (searchFilters.pnr && !r.pnr.toLowerCase().includes(searchFilters.pnr.toLowerCase().trim())) match = false;
      const fullName = `${r.firstName} ${r.lastName}`.toLowerCase();
      if (searchFilters.customerName && !fullName.includes(searchFilters.customerName.toLowerCase().trim())) match = false;
      if (searchFilters.passengerName) {
        const paxMatch = r.passengers.some(p => p.name.toLowerCase().includes(searchFilters.passengerName.toLowerCase().trim()));
        if (!paxMatch) match = false;
      }
      if (searchFilters.cxPhone && !r.phone.includes(searchFilters.cxPhone.trim())) match = false;
      if (searchFilters.customerAltNumber && (!r.altPhone || !r.altPhone.includes(searchFilters.customerAltNumber.trim()))) match = false;
      if (searchFilters.customerEmail && !r.email.toLowerCase().includes(searchFilters.customerEmail.toLowerCase().trim())) match = false;
      if (searchFilters.agent && !r.agent.toLowerCase().includes(searchFilters.agent.toLowerCase().trim())) match = false;
      if (searchFilters.bookingStatus !== 'All Statuses' && r.status !== searchFilters.bookingStatus) match = false;
      if (searchFilters.baggageStatus !== 'All Statuses' && r.baggageStatus !== searchFilters.baggageStatus) match = false;
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
      fromDate: '', toDate: '', baggageStatus: 'All Statuses'
    });
    setSearchResults([]);
    setHasSearched(false);
    setSelectedBooking(null);
  };

  const openBaggagePanel = (booking) => {
    setSelectedBooking(booking);
    setSelectedPassenger(booking.passengers[0]);
    setSelectedSegment(booking.segments[0]);
    setSelectedBaggageOption(null);
    setCustomPrice('');
    setPaymentMethod('Customer');
    setServiceFeeAmount('10');
    setAgentNote('');
    setNoteTimestamp(getStrictPST());
    setIsBaggagePanelOpen(true);
  };

  const closeBaggagePanel = () => {
    setIsBaggagePanelOpen(false);
    setSelectedBooking(null);
  };

  const confirmBaggageAssignment = () => {
    if (!selectedBaggageOption) return;
    if (agentNote.trim() === '') {
      setAlertMessage("Please enter an Agent Note before confirming.");
      return;
    }
    setIsPaymentModalOpen(true);
  };

  const processPaymentAndAdd = () => {
    const finalPrice = customPrice !== '' ? parseFloat(customPrice) : selectedBaggageOption.price;
    
    const updatedPassengers = selectedBooking.passengers.map(p => {
       if (p.id === selectedPassenger.id) {
           const segmentBaggage = [...(p.baggage[selectedSegment.id] || [])];
           segmentBaggage.push({
             id: Math.random().toString(36).substring(2, 9),
             label: selectedBaggageOption.label,
             price: finalPrice,
             payment: paymentMethod,
             type: selectedBaggageOption.type,
             status: 'Added',
             note: agentNote.trim() !== '' ? { text: agentNote.trim(), timestamp: noteTimestamp } : null
           });
           
           return { 
             ...p, 
             baggage: {
               ...p.baggage,
               [selectedSegment.id]: segmentBaggage
             }
           };
       }
       return p;
    });

    let hasAnyBaggage = false;
    updatedPassengers.forEach(p => {
      Object.values(p.baggage).forEach(segBags => {
        if (segBags.length > 0) hasAnyBaggage = true;
      });
    });

    const newBaggageStatus = hasAnyBaggage ? 'Baggage Added' : 'No Baggage Added';
    const updatedBooking = { ...selectedBooking, passengers: updatedPassengers, baggageStatus: newBaggageStatus };
    
    setSelectedBooking(updatedBooking);
    setSelectedPassenger(updatedPassengers.find(p => p.id === selectedPassenger.id));
    setSearchResults(prev => prev.map(r => r.id === updatedBooking.id ? updatedBooking : r));
    setSelectedBaggageOption(null);
    setIsPaymentModalOpen(false);
  };

  const handleRemoveBaggage = (bagId) => {
     setConfirmAction({
       message: "Are you sure you want to remove this baggage?",
       onConfirm: () => {
         const updatedPassengers = selectedBooking.passengers.map(p => {
           if (p.id === selectedPassenger.id) {
               const segmentBaggage = (p.baggage[selectedSegment.id] || []).filter(b => b.id !== bagId);
               return { 
                 ...p, 
                 baggage: {
                   ...p.baggage,
                   [selectedSegment.id]: segmentBaggage
                 }
               };
           }
           return p;
        });
        
        let hasAnyBaggage = false;
        updatedPassengers.forEach(p => {
          Object.values(p.baggage).forEach(segBags => {
            if (segBags.length > 0) hasAnyBaggage = true;
          });
        });

        const newBaggageStatus = hasAnyBaggage ? 'Baggage Added' : 'No Baggage Added';
        const updatedBooking = { ...selectedBooking, passengers: updatedPassengers, baggageStatus: newBaggageStatus };
        
        setSelectedBooking(updatedBooking);
        setSelectedPassenger(updatedPassengers.find(p => p.id === selectedPassenger.id));
        setSearchResults(prev => prev.map(r => r.id === updatedBooking.id ? updatedBooking : r));
        
        setConfirmAction(null);
       }
     });
  };

  const getPassengerTotalBags = (passenger) => {
    let count = 0;
    Object.values(passenger.baggage).forEach(segBags => {
      count += segBags.length;
    });
    return count;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="page-container" style={{ padding: '2rem' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>Add / Edit Baggage</h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>Manage baggage allowances per passenger and flight segment.</p>
        </div>
        
        <div style={{ background: 'white', borderRadius: '6px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={{ borderBottom: '3px solid #38b2ac', padding: '1.25rem 1.5rem 1rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#319795', margin: 0 }}>Baggage Management</h2>
          </div>

          <div style={{ padding: '1.5rem', background: '#f8fafc' }}>
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
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6b7280', marginBottom: '0.375rem' }}>BAGGAGE STATUS</label>
                  <select value={searchFilters.baggageStatus} onChange={(e) => handleFilterChange('baggageStatus', e.target.value)} style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.875rem', color: '#374151', backgroundColor: 'white', outline: 'none', cursor: 'pointer' }}>
                    <option value="All Statuses">All Statuses</option>
                    <option value="Baggage Added">Baggage Added</option>
                    <option value="No Baggage Added">No Baggage Added</option>
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

        {hasSearched && !selectedBooking && (
          <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden', marginTop: '2rem' }}>
            {searchResults.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: 'var(--bg-base)', color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <tr>
                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Booking ID</th>
                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Customer</th>
                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Route</th>
                    <th style={{ padding: '1rem 1.5rem', borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase' }}>PNR Status</th>
                    <th style={{ padding: '1rem 1.5rem', borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase' }}>Baggage Status</th>
                    <th style={{ padding: '1rem 1.5rem', borderBottom: '2px solid var(--border-color)', textAlign: 'right' }}></th>
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
                        <span style={{ padding: '0.25rem 0.75rem', background: reservation.baggageStatus === 'Baggage Added' ? '#d1fae5' : '#fee2e2', color: reservation.baggageStatus === 'Baggage Added' ? '#065f46' : '#991b1b', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600 }}>
                          {reservation.baggageStatus}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                        <button onClick={() => openBaggagePanel(reservation)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'white', border: '1px solid var(--primary-accent)', color: 'var(--primary-accent)', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer' }}>
                          <Grid size={16} /> Manage Baggage
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

      {isBaggagePanelOpen && selectedBooking && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '2rem' }}>
          <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '1300px', height: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: 'var(--shadow-xl)' }}>
            
            <div style={{ padding: '1.5rem 2rem', background: 'var(--bg-topnav)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                     <Ticket size={24} /> Baggage Management
                  </h2>
                  <div style={{ fontSize: '0.875rem', marginTop: '0.25rem', color: 'rgba(255,255,255,0.8)' }}>Booking: {selectedBooking.id} • PNR: {selectedBooking.pnr || 'N/A'}</div>
               </div>
               <button onClick={closeBaggagePanel} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                 <X size={24} />
               </button>
            </div>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              
              <div style={{ width: '380px', background: '#f8fafc', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                 <div style={{ padding: '1.5rem', background: '#f1f5f9', borderBottom: '1px solid var(--border-color)' }}>
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Baggage Summary</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                       {selectedBooking.passengers.map(p => (
                          <button 
                             key={p.id} 
                             onClick={() => { setSelectedPassenger(p); setSelectedBaggageOption(null); }}
                             style={{ 
                                padding: '1rem', 
                                background: selectedPassenger?.id === p.id ? 'white' : 'transparent', 
                                border: `2px solid ${selectedPassenger?.id === p.id ? 'var(--primary-accent)' : 'var(--border-color)'}`, 
                                borderRadius: 'var(--radius-md)', 
                                cursor: 'pointer', textAlign: 'left',
                                transition: 'all 0.2s',
                                boxShadow: selectedPassenger?.id === p.id ? 'var(--shadow-sm)' : 'none'
                             }}
                          >
                             <div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                               {p.name}
                               <span style={{ fontSize: '0.75rem', background: '#e2e8f0', color: '#475569', padding: '0.2rem 0.5rem', borderRadius: '99px' }}>
                                 {getPassengerTotalBags(p)} Bags
                               </span>
                             </div>
                          </button>
                       ))}
                    </div>
                 </div>

                 <div style={{ padding: '1.5rem', flex: 1 }}>
                    <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                      Current Allowances
                    </h4>
                    
                    {selectedPassenger && selectedBooking.segments.map(seg => {
                      const bags = selectedPassenger.baggage[seg.id] || [];
                      
                      return (
                        <div key={seg.id} style={{ marginBottom: '1.5rem', background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                          <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                            {seg.flight} — {seg.route}
                          </div>
                          <div style={{ padding: '1rem' }}>
                            {bags.length === 0 ? (
                              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No baggage assigned.</div>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {bags.map(b => (
                                  <div key={b.id} style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
                                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{b.label}</span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.type} • {b.status}</span>
                                      </div>
                                      {b.status !== 'Included' && (
                                        <button onClick={() => handleRemoveBaggage(b.id)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--danger)', background: 'transparent', border: '1px solid var(--danger)', borderRadius: '4px', cursor: 'pointer' }}>
                                          Remove
                                        </button>
                                      )}
                                    </div>
                                    {b.note && (
                                      <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#f1f5f9', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                        <strong>Note ({b.note.timestamp}):</strong> {b.note.text}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                 </div>
              </div>

              <div style={{ flex: 1, padding: '2.5rem', display: 'flex', flexDirection: 'column', background: 'white', overflowY: 'auto' }}>
                 <div style={{ marginBottom: '2rem' }}>
                   <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                     Add or Modify Baggage
                   </h3>
                   <p style={{ color: 'var(--text-secondary)' }}>Follow the steps below to add additional baggage options for <strong>{selectedPassenger?.name}</strong>.</p>
                 </div>

                 <div style={{ marginBottom: '2rem' }}>
                   <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                     <span style={{ background: 'var(--primary-accent)', color: 'white', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem' }}>1</span>
                     Select Flight Segment
                   </h4>
                   <div style={{ display: 'flex', gap: '1rem' }}>
                     {selectedBooking.segments.map(seg => (
                       <button
                         key={seg.id}
                         onClick={() => setSelectedSegment(seg)}
                         style={{
                           padding: '1rem 1.5rem',
                           border: `2px solid ${selectedSegment?.id === seg.id ? 'var(--primary-accent)' : 'var(--border-color)'}`,
                           borderRadius: 'var(--radius-md)',
                           background: selectedSegment?.id === seg.id ? '#f0f9ff' : 'white',
                           cursor: 'pointer',
                           fontWeight: 600,
                           color: 'var(--text-primary)',
                           transition: 'all 0.2s'
                         }}
                       >
                         {seg.flight} — {seg.route}
                       </button>
                     ))}
                   </div>
                 </div>

                 <div style={{ marginBottom: '2rem' }}>
                   <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                     <span style={{ background: 'var(--primary-accent)', color: 'white', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem' }}>2</span>
                     Select Baggage Type
                   </h4>
                   <div style={{ display: 'flex', gap: '1rem' }}>
                     {['Checked Baggage', 'Cabin Baggage', 'Excess Baggage'].map(type => (
                       <button
                         key={type}
                         onClick={() => { setSelectedBaggageType(type); setSelectedBaggageOption(null); setCustomPrice(''); }}
                         style={{
                           padding: '0.75rem 1.5rem',
                           border: `2px solid ${selectedBaggageType === type ? 'var(--primary-accent)' : 'var(--border-color)'}`,
                           borderRadius: 'var(--radius-full)',
                           background: selectedBaggageType === type ? 'var(--primary-accent)' : 'white',
                           color: selectedBaggageType === type ? 'white' : 'var(--text-primary)',
                           cursor: 'pointer',
                           fontWeight: 600,
                           transition: 'all 0.2s'
                         }}
                       >
                         {type}
                       </button>
                     ))}
                   </div>
                 </div>

                 <div style={{ marginBottom: '2rem', flex: 1 }}>
                   <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                     <span style={{ background: 'var(--primary-accent)', color: 'white', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem' }}>3</span>
                     Choose Option
                   </h4>
                   
                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                      {baggageOptions.filter(opt => opt.type === selectedBaggageType).map(option => (
                        <div 
                          key={option.id}
                          onClick={() => { setSelectedBaggageOption(option); setCustomPrice(''); }}
                          style={{
                            padding: '1.5rem',
                            border: `2px solid ${selectedBaggageOption?.id === option.id ? 'var(--primary-accent)' : 'var(--border-color)'}`,
                            borderRadius: 'var(--radius-lg)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            background: selectedBaggageOption?.id === option.id ? '#f0f9ff' : 'white',
                            boxShadow: selectedBaggageOption?.id === option.id ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'
                          }}
                        >
                          <div style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                            {option.label}
                          </div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            $
                            {selectedBaggageOption?.id === option.id ? (
                               <input 
                                 type="number"
                                 value={customPrice !== '' ? customPrice : option.price}
                                 onChange={(e) => setCustomPrice(e.target.value)}
                                 onClick={(e) => e.stopPropagation()}
                                 style={{ width: '60px', marginLeft: '0.25rem', padding: '0.25rem', border: '1px solid var(--primary-accent)', borderRadius: '4px', outline: 'none', color: 'var(--primary-accent)', fontWeight: 800, fontSize: '1.1rem', textAlign: 'center', background: 'white' }}
                               />
                            ) : (
                               option.price
                            )}
                          </div>
                        </div>
                      ))}
                      {baggageOptions.filter(opt => opt.type === selectedBaggageType).length === 0 && (
                        <div style={{ color: 'var(--text-muted)' }}>No options available for this type.</div>
                      )}
                   </div>
                 </div>

                 {selectedBaggageOption && (
                   <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid #cbd5e1', marginTop: 'auto' }}>
                     <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Pricing Summary</h4>
                     
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', fontSize: '0.875rem' }}>
                       <span>Base Baggage Fee</span>
                       <span>${customPrice !== '' ? parseFloat(customPrice || 0).toFixed(2) : selectedBaggageOption.price.toFixed(2)}</span>
                     </div>

                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', fontSize: '0.875rem' }}>
                       <span>Charge Credit Card</span>
                       <select 
                         value={paymentMethod}
                         onChange={(e) => setPaymentMethod(e.target.value)}
                         style={{ padding: '0.25rem 0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', outline: 'none', background: 'white', cursor: 'pointer' }}
                       >
                         <option value="Customer">Customer</option>
                         <option value="Own">Own (Agency)</option>
                       </select>
                     </div>

                     {(() => {
                       const base = customPrice !== '' ? parseFloat(customPrice) || 0 : selectedBaggageOption.price;
                       const serviceFee = serviceFeeAmount !== '' ? parseFloat(serviceFeeAmount) || 0 : 0;
                       const total = base + serviceFee;
                       return (
                         <>
                           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', fontSize: '0.875rem' }}>
                             <span>Service Fee</span>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                               <span style={{ color: 'var(--text-muted)' }}>$</span>
                               <input 
                                 type="number" 
                                 value={serviceFeeAmount}
                                 onChange={(e) => setServiceFeeAmount(e.target.value)}
                                 style={{ width: '80px', padding: '0.25rem 0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'right', outline: 'none' }}
                               />
                             </div>
                           </div>
                           <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid #cbd5e1', fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                             <span>Total</span>
                             <span>${total.toFixed(2)}</span>
                           </div>
                         </>
                       );
                     })()}

                     <div style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>
                       <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Agent Note (Required)</label>
                       
                       <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                         <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Date & Time:</span>
                         <input 
                           type="text" 
                           value={noteTimestamp} 
                           readOnly 
                           style={{ flex: 1, padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#f1f5f9', color: '#64748b', fontSize: '0.875rem', outline: 'none', cursor: 'not-allowed' }}
                         />
                       </div>

                       <textarea 
                         value={agentNote}
                         onChange={(e) => setAgentNote(e.target.value)}
                         placeholder="Enter your note here..."
                         style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px', outline: 'none', resize: 'vertical', minHeight: '60px', boxSizing: 'border-box' }}
                       ></textarea>
                     </div>

                     <button onClick={confirmBaggageAssignment} style={{ marginTop: '1rem', width: '100%', padding: '1rem', background: '#3182ce', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = '#2b6cb0'} onMouseLeave={(e) => e.target.style.background = '#3182ce'}>
                       Confirm & Add to Booking
                     </button>
                   </div>
                 )}
              </div>
            </div>
          </div>
        </div>
      )}

      {isPaymentModalOpen && selectedBaggageOption && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', padding: '2.5rem', borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: '400px', boxShadow: 'var(--shadow-xl)', animation: 'slideUp 0.3s ease-out' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ background: 'var(--primary-accent)', color: 'white', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1rem' }}>
                💳
              </div>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>Process Payment</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Review and confirm the baggage charge.</p>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Payment Method</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{paymentMethod === 'Customer' ? "Customer's Card" : "Agency's Card"}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Baggage Option</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedBaggageOption.label}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid #cbd5e1', fontSize: '1.125rem', fontWeight: 800, color: 'var(--primary-accent)' }}>
                <span>Total Amount</span>
                <span>
                  ${(() => {
                     const base = customPrice !== '' ? parseFloat(customPrice) || 0 : selectedBaggageOption.price;
                     const serviceFee = serviceFeeAmount !== '' ? parseFloat(serviceFeeAmount) || 0 : 0;
                     return (base + serviceFee).toFixed(2);
                  })()}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Cardholder Name</label>
                <input type="text" placeholder="Name on card" defaultValue={paymentMethod === 'Customer' ? selectedPassenger?.name : 'ZSM Travel Agency'} style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-md)', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Card Number</label>
                <input type="text" placeholder="0000 0000 0000 0000" style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-md)', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Expiry Date</label>
                  <input type="text" placeholder="MM/YY" style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-md)', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>CVV</label>
                  <input type="text" placeholder="123" style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-md)', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => setIsPaymentModalOpen(false)}
                style={{ flex: 1, padding: '0.875rem', background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={processPaymentAndAdd}
                style={{ flex: 1, padding: '0.875rem', background: 'var(--primary-accent)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, cursor: 'pointer', boxShadow: 'var(--shadow-md)' }}
              >
                Charge Card
              </button>
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

export default AddBaggage;
