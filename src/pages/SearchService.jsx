import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, User, Mail, Phone, MoreVertical, ShieldAlert, Loader2 } from 'lucide-react';
import { fetchBookings, saveBookings } from '../services/supabase';

const baseMockData = {
  enquiryStatus: 'New', enquiryDate: '2026-07-01', enquiryCompletedDate: '2026-07-02',
  paymentStatus: 'Pending', workStatus: 'Pending', smsStatus: 'Pending', callStatus: 'Pending',
  crmAuditStatus: 'Pending', qualityAuditStatus: 'Pending', upcomingFollowUp: '2026-07-25',
  cbStatus: 'Pending', saleDate: '2026-07-03', changeDate: '2026-07-20',
  merchantName: 'ZSM TRAVEL USA', vendor: 'Standard', vendorCode: 'VND-STD',
  activityLog: [{ id: 1, type: 'Booking Created', note: 'Initial booking created', user: 'System', timestamp: '2026-07-03 10:00 AM' }]
};

const initialMockBookings = [
  { 
    ...baseMockData,
    id: 'ZSM-8942-B', refNo: 'A1708826527', cxId: 'CX-1001', pnr: 'G7X9K2', name: 'John Doe', passengerName: 'John Doe', email: 'john@example.com', phone: '555-0100', altPhone: '555-0101', agent: 'Agent A', saleBy: 'Agent A', status: 'Pending', date: '2026-07-18', travelDate: '2026-08-15', amount: '$380.50',
    tripType: 'Round Trip',
    outboundFlight: { airline: 'Delta Air Lines', flightNumber: 'DL101', departureAirport: 'JFK', departureDate: '2026-08-15', departureTime: '08:00 AM', arrivalAirport: 'LAX', arrivalDate: '2026-08-15', arrivalTime: '11:30 AM', duration: '5h 30m', cabinClass: 'Economy', stops: 'Non-stop', ticketStatus: 'Active', pnr: 'G7X9K2' },
    inboundFlight: { airline: 'Delta Air Lines', flightNumber: 'DL202', departureAirport: 'LAX', departureDate: '2026-08-22', departureTime: '02:00 PM', arrivalAirport: 'JFK', arrivalDate: '2026-08-22', arrivalTime: '10:15 PM', duration: '5h 15m', cabinClass: 'Economy', stops: 'Non-stop', ticketStatus: 'Active', pnr: 'G7X9K2' },
    itineraryChangeRequests: []
  },
  { 
    ...baseMockData,
    id: 'ZSM-1049-C', refNo: 'A1708826528', cxId: 'CX-1002', pnr: 'A4B2C9', name: 'Jane Smith', passengerName: 'Jane Smith', email: 'jane@example.com', phone: '555-0199', altPhone: '555-0299', agent: 'Agent B', saleBy: 'Agent B', status: 'Booking Confirmed', date: '2026-07-17', travelDate: '2026-09-10', amount: '$425.00',
    tripType: 'One Way',
    outboundFlight: { airline: 'British Airways', flightNumber: 'BA117', departureAirport: 'LHR', departureDate: '2026-09-10', departureTime: '09:15 AM', arrivalAirport: 'JFK', arrivalDate: '2026-09-10', arrivalTime: '12:05 PM', duration: '7h 50m', cabinClass: 'Premium Economy', stops: 'Non-stop', ticketStatus: 'Confirmed', pnr: 'A4B2C9' },
    itineraryChangeRequests: []
  },
  { 
    ...baseMockData,
    id: 'ZSM-2911-A', refNo: 'A1708826529', cxId: 'CX-1003', pnr: 'L8K1M3', name: 'Mike Ross', passengerName: 'Mike Ross', email: 'mike@example.com', phone: '555-0122', altPhone: '555-0322', agent: 'Agent A', saleBy: 'Agent A', status: 'Cancelled', date: '2026-07-15', travelDate: '2026-07-20', amount: '$0.00',
    tripType: 'Round Trip',
    outboundFlight: { airline: 'Alaska Airlines', flightNumber: 'AS231', departureAirport: 'SFO', departureDate: '2026-07-20', departureTime: '06:30 AM', arrivalAirport: 'SEA', arrivalDate: '2026-07-20', arrivalTime: '08:45 AM', duration: '2h 15m', cabinClass: 'Economy', stops: 'Non-stop', ticketStatus: 'Cancelled', pnr: 'L8K1M3' },
    inboundFlight: { airline: 'Alaska Airlines', flightNumber: 'AS442', departureAirport: 'SEA', departureDate: '2026-07-25', departureTime: '04:15 PM', arrivalAirport: 'SFO', arrivalDate: '2026-07-25', arrivalTime: '06:20 PM', duration: '2h 05m', cabinClass: 'Economy', stops: 'Non-stop', ticketStatus: 'Cancelled', pnr: 'L8K1M3' },
    itineraryChangeRequests: []
  },
  { 
    ...baseMockData,
    id: 'ZSM-3321-F', refNo: 'A1708826530', cxId: 'CX-1004', pnr: 'K9P2M4', name: 'Sarah Lee', passengerName: 'Sarah Lee', email: 'sarah@example.com', phone: '555-0455', altPhone: '', agent: 'Agent C', saleBy: 'Agent C', status: 'Completed', date: '2026-06-10', travelDate: '2026-07-05', amount: '$290.00',
    tripType: 'One Way',
    outboundFlight: { airline: 'American Airlines', flightNumber: 'AA105', departureAirport: 'ORD', departureDate: '2026-07-05', departureTime: '10:00 AM', arrivalAirport: 'MIA', arrivalDate: '2026-07-05', arrivalTime: '02:00 PM', duration: '3h 00m', cabinClass: 'Economy', stops: 'Non-stop', ticketStatus: 'Flown', pnr: 'K9P2M4' },
    itineraryChangeRequests: []
  },
  { 
    ...baseMockData,
    id: 'ZSM-4455-H', refNo: 'A1708826531', cxId: 'CX-1005', pnr: 'J1T8L9', name: 'Robert King', passengerName: 'Robert King', email: 'robert@example.com', phone: '555-0677', altPhone: '', agent: 'Agent B', saleBy: 'Agent B', status: 'On Hold', date: '2026-07-20', travelDate: '2026-10-12', amount: '$540.00',
    tripType: 'Round Trip',
    outboundFlight: { airline: 'American Airlines', flightNumber: 'AA212', departureAirport: 'MIA', departureDate: '2026-10-12', departureTime: '07:00 AM', arrivalAirport: 'JFK', arrivalDate: '2026-10-12', arrivalTime: '10:00 AM', duration: '3h 00m', cabinClass: 'Economy', stops: 'Non-stop', ticketStatus: 'On Hold', pnr: 'J1T8L9' },
    inboundFlight: { airline: 'American Airlines', flightNumber: 'AA505', departureAirport: 'JFK', departureDate: '2026-10-19', departureTime: '01:30 PM', arrivalAirport: 'MIA', arrivalDate: '2026-10-19', arrivalTime: '04:30 PM', duration: '3h 00m', cabinClass: 'Economy', stops: 'Non-stop', ticketStatus: 'On Hold', pnr: 'J1T8L9' },
    itineraryChangeRequests: []
  },
];

const serviceActions = [
  { name: 'Change Itinerary', bg: '#3b82f6', color: '#ffffff' }, // Blue
  { name: 'Cancellation for Refund', bg: '#ef4444', color: '#ffffff' }, // Red
  { name: 'Cancellation for Credit', bg: '#f97316', color: '#ffffff' }, // Orange
  { name: 'Name Correction', bg: '#8b5cf6', color: '#ffffff' }, // Purple
  { name: 'Seat Assign', bg: '#10b981', color: '#ffffff' }, // Emerald
  { name: 'Seat Upgrade', bg: '#059669', color: '#ffffff' }, // Dark Emerald
  { name: 'Add Baggage', bg: '#f59e0b', color: '#ffffff' }, // Amber
  { name: 'Add Seat and Baggage', bg: '#d97706', color: '#ffffff' }, // Dark Amber
  { name: 'Pet Booking', bg: '#ec4899', color: '#ffffff' }, // Pink
  { name: 'Minor Alone Booking', bg: '#06b6d4', color: '#ffffff' }, // Cyan
  { name: 'Checking Service', bg: '#64748b', color: '#ffffff' } // Slate
];

const SearchService = () => {
  const [searchParams] = useSearchParams();

  const [bookings, setBookings] = useState(initialMockBookings);

  useEffect(() => {
    const loadBookings = async () => {
      const saved = await fetchBookings();
      if (saved && saved.length > 0) {
        setBookings(saved);
      } else {
        await saveBookings(initialMockBookings);
      }
    };
    loadBookings();
  }, []);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [bookingToConfirm, setBookingToConfirm] = useState(null);
  const [notification, setNotification] = useState('');
  
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailsStatus, setDetailsStatus] = useState('');
  
  const openDetails = (booking) => {
    setSelectedBooking(booking);
    setDetailsStatus(booking.status);
  };

  const initialFilters = {
    cxId: searchParams.get('cxId') || '', 
    bookingId: searchParams.get('bookingId') || '', 
    pnr: '', 
    customerName: searchParams.get('customerName') || '', 
    cxPhone: '', 
    customerEmail: '',
    agent: '', altPhone: '', passengerName: '', fromDate: '', toDate: '', status: ''
  };

  const [filters, setFilters] = useState(initialFilters);
  const [activeFilters, setActiveFilters] = useState(initialFilters);
  const [isSearching, setIsSearching] = useState(false);
  const [activeAction, setActiveAction] = useState(null);
  
  // Change Itinerary State
  const [changeItineraryStep, setChangeItineraryStep] = useState(1);
  const [selectedLegToChange, setSelectedLegToChange] = useState('');
  const [changeRequestNote, setChangeRequestNote] = useState('');
  const [preferredNewDate, setPreferredNewDate] = useState('');

  const resetChangeItineraryState = () => {
    setChangeItineraryStep(1);
    setSelectedLegToChange('');
    setChangeRequestNote('');
    setPreferredNewDate('');
    setActiveAction(null);
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    setIsSearching(true);
    setTimeout(() => {
      setActiveFilters(filters);
      setIsSearching(false);
    }, 500);
  };

  const handleClear = () => {
    setFilters(initialFilters);
    setActiveFilters(initialFilters);
  };

  const handleConfirmClick = (booking) => {
    setBookingToConfirm(booking);
    setIsConfirmModalOpen(true);
  };

  const confirmBooking = async () => {
    if (!bookingToConfirm) return;
    
    const updatedBookings = bookings.map(b => 
      b.id === bookingToConfirm.id ? { ...b, status: 'Booking Confirmed' } : b
    );
    
    setBookings(updatedBookings);
    await saveBookings(updatedBookings);
    
    setIsConfirmModalOpen(false);
    setBookingToConfirm(null);
    setNotification('Booking confirmed successfully.');
    
    setTimeout(() => setNotification(''), 3000);
  };

  const updateBookingStatus = async () => {
    if (!selectedBooking) return;
    
    const updatedSelected = { ...selectedBooking, status: detailsStatus };
    const newActivity = {
      id: Math.floor(Math.random() * 100000),
      type: 'Lifecycle Update',
      note: 'Booking statuses and lifecycle properties updated.',
      user: 'Current User',
      timestamp: new Date().toLocaleString()
    };
    
    updatedSelected.activityLog = [...(updatedSelected.activityLog || []), newActivity];
    
    const updatedBookings = bookings.map(b => 
      b.id === selectedBooking.id ? updatedSelected : b
    );
    
    setBookings(updatedBookings);
    await saveBookings(updatedBookings);
    setSelectedBooking(updatedSelected);
    
    setNotification('Booking lifecycle updated successfully.');
    setTimeout(() => setNotification(''), 3000);
  };

  const submitChangeItinerary = async () => {
    if (!selectedLegToChange) return;
    
    const newRequest = {
      id: `REQ-${Math.floor(Math.random() * 10000)}`,
      type: selectedLegToChange,
      note: changeRequestNote,
      preferredDate: preferredNewDate,
      status: 'Pending',
      createdAt: new Date().toLocaleString(),
      agent: 'Current User'
    };
    
    const updatedBookings = bookings.map(b => {
      if (b.id === selectedBooking.id) {
        const currentRequests = b.itineraryChangeRequests || [];
        const currentLog = b.activityLog || [];
        
        const activityEvent = {
          id: Math.floor(Math.random() * 100000),
          type: 'Itinerary Changed',
          note: `Requested change for ${selectedLegToChange}. Notes: ${changeRequestNote}`,
          user: 'Current User',
          timestamp: new Date().toLocaleString()
        };

        return { 
          ...b, 
          itineraryChangeRequests: [...currentRequests, newRequest],
          activityLog: [...currentLog, activityEvent]
        };
      }
      return b;
    });
    
    setBookings(updatedBookings);
    await saveBookings(updatedBookings);
    
    const updatedSelected = updatedBookings.find(b => b.id === selectedBooking.id);
    setSelectedBooking(updatedSelected);
    
    resetChangeItineraryState();
    setNotification('Change Itinerary request submitted successfully.');
    setTimeout(() => setNotification(''), 3000);
  };

  const filteredBookings = bookings.filter(booking => {
    const { cxId, bookingId, pnr, customerName, cxPhone, customerEmail, agent, altPhone, passengerName, fromDate, toDate, status } = activeFilters;
    const match = (field, query) => !query || (field && field.toLowerCase().includes(query.toLowerCase()));
    
    if (!match(booking.cxId, cxId)) return false;
    if (!match(booking.id, bookingId)) return false;
    if (!match(booking.pnr, pnr)) return false;
    if (!match(booking.name, customerName)) return false;
    if (!match(booking.phone, cxPhone)) return false;
    if (!match(booking.email, customerEmail)) return false;
    if (!match(booking.altPhone, altPhone)) return false;
    if (!match(booking.passengerName, passengerName)) return false;
    
    if (agent && agent !== 'All Agents' && booking.agent !== agent) return false;
    if (status && booking.status !== status) return false;
    if (fromDate && booking.date < fromDate) return false;
    if (toDate && booking.date > toDate) return false;
    
    return true;
  });

  return (
    <div className="page-container">
      <h1 className="page-title">Search & Service</h1>
      <p className="page-subtitle">Locate bookings and perform post-booking actions</p>

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

      {!selectedBooking ? (
        /* Results Table */
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="card-title">Recent Bookings</h2>
            <span className="text-secondary text-sm">Showing {filteredBookings.length} result(s)</span>
          </div>
          
          {isSearching ? (
             <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
               <Loader2 size={48} className="spin" style={{ margin: '0 auto 1rem', animation: 'spin 1s linear infinite', color: 'var(--primary-accent)' }} />
               <p style={{ fontSize: '1.125rem' }}>Searching bookings...</p>
             </div>
          ) : filteredBookings.length === 0 ? (
             <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
               <ShieldAlert size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
               <p style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>No bookings found</p>
               <p className="mb-4">Try adjusting your search filters to find what you're looking for.</p>
               <button onClick={handleClear} className="btn btn-secondary">Clear All Filters</button>
             </div>
          ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td style={{ fontWeight: 600, color: 'var(--primary-accent)' }}>{booking.id}</td>
                    <td>
                      <div>{booking.name}</div>
                      <div className="text-secondary" style={{ fontSize: '0.75rem' }}>CX: {booking.cxId}</div>
                    </td>
                    <td>
                      <div className="text-secondary" style={{ fontSize: '0.875rem' }}>{booking.email}</div>
                      <div className="text-secondary" style={{ fontSize: '0.875rem' }}>{booking.phone}</div>
                    </td>
                    <td>
                      <div>{booking.date}</div>
                      <div className="text-secondary" style={{ fontSize: '0.75rem' }}>Agent: {booking.agent}</div>
                    </td>
                    <td>
                      <span className={`badge ${
                        booking.status === 'Booking Confirmed' ? 'badge-success' : 
                        booking.status === 'Completed' ? 'badge-primary' : 
                        booking.status === 'Pending' || booking.status === 'On Hold' ? 'badge-warning' : 'badge-danger'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td>
                      <div>{booking.amount}</div>
                      <div className="text-secondary" style={{ fontSize: '0.75rem' }}>PNR: {booking.pnr}</div>
                    </td>
                    <td>
                      <div className="flex gap-2" style={{ alignItems: 'center' }}>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                          onClick={() => openDetails(booking)}
                        >
                          View Details
                        </button>
                        {booking.status === 'Pending' ? (
                          <button 
                            className="btn btn-primary" 
                            style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'var(--primary-accent)', color: 'white', border: 'none' }}
                            onClick={() => handleConfirmClick(booking)}
                          >
                            Confirm Booking
                          </button>
                        ) : booking.status === 'Booking Confirmed' ? (
                          <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                            Booking Confirmed ✓
                          </span>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>
      ) : (
        /* Booking Details View */
        <div className="animate-fade-in">
          <button 
            className="btn btn-secondary mb-4" 
            onClick={() => setSelectedBooking(null)}
          >
            ← Back to Results
          </button>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Main Content */}
            <div className="flex-col gap-4" style={{ display: 'flex' }}>
              {/* Header Info */}
              <div className="flex justify-between items-center mb-2">
                <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Ref No: {selectedBooking.refNo}
                </div>
                <div style={{ fontSize: '1.125rem', fontWeight: 600 }} className={`text-${
                  selectedBooking.status === 'Booking Confirmed' ? 'success' : 
                  selectedBooking.status === 'Completed' ? 'primary' : 
                  selectedBooking.status === 'Pending' || selectedBooking.status === 'On Hold' ? 'warning' : 'danger'
                }`}>
                  Booking Status: {selectedBooking.status}
                </div>
              </div>

              {/* Customer Information Card */}
              <div className="card">
                <h2 className="card-title mb-4">Customer Information</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div>
                    <div className="text-secondary text-sm mb-1">CX ID</div>
                    <div style={{ fontWeight: 600 }}>{selectedBooking.cxId}</div>
                  </div>
                  <div>
                    <div className="text-secondary text-sm mb-1">Customer Name</div>
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-secondary" />
                      {selectedBooking.name}
                    </div>
                  </div>
                  <div>
                    <div className="text-secondary text-sm mb-1">Passenger Name</div>
                    <div>{selectedBooking.passengerName}</div>
                  </div>
                  <div>
                    <div className="text-secondary text-sm mb-1">Email</div>
                    <div className="flex items-center gap-2"><Mail size={16} className="text-secondary" /> {selectedBooking.email}</div>
                  </div>
                  <div>
                    <div className="text-secondary text-sm mb-1">Phone</div>
                    <div className="flex items-center gap-2"><Phone size={16} className="text-secondary" /> {selectedBooking.phone}</div>
                  </div>
                  <div>
                    <div className="text-secondary text-sm mb-1">Alternate Phone</div>
                    <div className="flex items-center gap-2"><Phone size={16} className="text-secondary" /> {selectedBooking.altPhone || 'N/A'}</div>
                  </div>
                </div>
                <button 
                  className="btn btn-secondary" 
                  style={{ width: '100%' }}
                  onClick={() => {
                    handleClear();
                    setFilters({...initialFilters, cxId: selectedBooking.cxId});
                    setSelectedBooking(null);
                    setTimeout(() => handleSearch(), 100);
                  }}
                >
                  View All Related Booking Details
                </button>
              </div>
              {/* Lifecycle Management Card */}
              <div className="card">
                <h2 className="card-title mb-4">Booking Lifecycle Management</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label text-sm" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Booking Status</label>
                    <select className="form-input" value={detailsStatus} onChange={(e) => setDetailsStatus(e.target.value)}>
                      <option value="Pending">Pending</option>
                      <option value="Booking Confirmed">Booking Confirmed</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="Completed">Completed</option>
                      <option value="On Hold">On Hold</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label text-sm" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Payment Status</label>
                    <select className="form-input" value={selectedBooking.paymentStatus} onChange={(e) => setSelectedBooking({...selectedBooking, paymentStatus: e.target.value})}>
                      <option value="Pending">Pending</option>
                      <option value="Partially Paid">Partially Paid</option>
                      <option value="Paid">Paid</option>
                      <option value="Refunded">Refunded</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label text-sm" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Work Status</label>
                    <select className="form-input" value={selectedBooking.workStatus} onChange={(e) => setSelectedBooking({...selectedBooking, workStatus: e.target.value})}>
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label text-sm" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>SMS Status</label>
                    <select className="form-input" value={selectedBooking.smsStatus} onChange={(e) => setSelectedBooking({...selectedBooking, smsStatus: e.target.value})}>
                      <option value="Pending">Pending</option>
                      <option value="Sent">Sent</option>
                      <option value="Failed">Failed</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label text-sm" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Call Status</label>
                    <select className="form-input" value={selectedBooking.callStatus} onChange={(e) => setSelectedBooking({...selectedBooking, callStatus: e.target.value})}>
                      <option value="Pending">Pending</option>
                      <option value="Contacted">Contacted</option>
                      <option value="No Answer">No Answer</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label text-sm" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>CRM Audit Status</label>
                    <select className="form-input" value={selectedBooking.crmAuditStatus} onChange={(e) => setSelectedBooking({...selectedBooking, crmAuditStatus: e.target.value})}>
                      <option value="Pending">Pending</option>
                      <option value="Passed">Passed</option>
                      <option value="Failed">Failed</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label text-sm" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Quality Audit Status</label>
                    <select className="form-input" value={selectedBooking.qualityAuditStatus} onChange={(e) => setSelectedBooking({...selectedBooking, qualityAuditStatus: e.target.value})}>
                      <option value="Pending">Pending</option>
                      <option value="Passed">Passed</option>
                      <option value="Failed">Failed</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label text-sm" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>CB Status</label>
                    <select className="form-input" value={selectedBooking.cbStatus} onChange={(e) => setSelectedBooking({...selectedBooking, cbStatus: e.target.value})}>
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  <div>
                    <div className="text-secondary text-sm mb-1" style={{ textTransform: 'uppercase' }}>Merchant Name</div>
                    <div style={{ fontWeight: 600 }}>{selectedBooking.merchantName}</div>
                  </div>

                  <div>
                    <div className="text-secondary text-sm mb-1" style={{ textTransform: 'uppercase' }}>Vendor Code</div>
                    <div style={{ fontWeight: 600 }}>{selectedBooking.vendorCode}</div>
                  </div>

                </div>
                <div className="flex justify-end">
                  <button 
                    className="btn btn-primary" 
                    onClick={() => updateBookingStatus(selectedBooking)}
                    style={{ padding: '0.75rem 2rem', fontWeight: 600 }}
                  >
                    Save Lifecycle Changes
                  </button>
                </div>
              </div>
              
              {/* Flight Itinerary */}
              <div className="card">
                <h2 className="card-title mb-4">Itinerary</h2>
                
                {/* Outbound */}
                {selectedBooking.outboundFlight && (
                  <div className="mb-6">
                    <h3 className="text-secondary text-sm mb-2" style={{ textTransform: 'uppercase', fontWeight: 600 }}>Outbound Flight</h3>
                    <div style={{ borderLeft: '2px solid var(--border-color)', paddingLeft: '1.5rem', position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '-5px', top: '0', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary-accent)' }}></div>
                      <div style={{ position: 'absolute', left: '-5px', bottom: '0', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)' }}></div>
                      
                      <div className="mb-4">
                        <div style={{ fontWeight: 600 }}>{selectedBooking.outboundFlight.departureAirport} - Departure</div>
                        <div className="text-secondary text-sm">{selectedBooking.outboundFlight.departureDate} • {selectedBooking.outboundFlight.departureTime}</div>
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{selectedBooking.outboundFlight.arrivalAirport} - Arrival</div>
                        <div className="text-secondary text-sm">{selectedBooking.outboundFlight.arrivalDate} • {selectedBooking.outboundFlight.arrivalTime}</div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 flex justify-between items-center" style={{ borderTop: '1px solid var(--border-color)' }}>
                      <div className="flex items-center gap-2">
                        <span style={{ fontWeight: 500 }}>{selectedBooking.outboundFlight.airline} ({selectedBooking.outboundFlight.flightNumber})</span>
                      </div>
                      <div className="badge badge-info">PNR: {selectedBooking.outboundFlight.pnr}</div>
                    </div>
                  </div>
                )}
                
                {/* Inbound */}
                {selectedBooking.inboundFlight && (
                  <div>
                    <h3 className="text-secondary text-sm mb-2" style={{ textTransform: 'uppercase', fontWeight: 600 }}>Inbound Flight</h3>
                    <div style={{ borderLeft: '2px solid var(--border-color)', paddingLeft: '1.5rem', position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '-5px', top: '0', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary-accent)' }}></div>
                      <div style={{ position: 'absolute', left: '-5px', bottom: '0', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)' }}></div>
                      
                      <div className="mb-4">
                        <div style={{ fontWeight: 600 }}>{selectedBooking.inboundFlight.departureAirport} - Departure</div>
                        <div className="text-secondary text-sm">{selectedBooking.inboundFlight.departureDate} • {selectedBooking.inboundFlight.departureTime}</div>
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{selectedBooking.inboundFlight.arrivalAirport} - Arrival</div>
                        <div className="text-secondary text-sm">{selectedBooking.inboundFlight.arrivalDate} • {selectedBooking.inboundFlight.arrivalTime}</div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 flex justify-between items-center" style={{ borderTop: '1px solid var(--border-color)' }}>
                      <div className="flex items-center gap-2">
                        <span style={{ fontWeight: 500 }}>{selectedBooking.inboundFlight.airline} ({selectedBooking.inboundFlight.flightNumber})</span>
                      </div>
                      <div className="badge badge-info">PNR: {selectedBooking.inboundFlight.pnr}</div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Booking History / Activity Log */}
              {selectedBooking.activityLog && selectedBooking.activityLog.length > 0 && (
                <div className="card mt-4">
                  <h2 className="card-title mb-4">Booking Activity History</h2>
                  <div className="flex-col gap-4" style={{ display: 'flex' }}>
                    {selectedBooking.activityLog.map(log => (
                      <div key={log.id} style={{ padding: '1rem', borderLeft: '4px solid var(--primary-accent)', backgroundColor: 'var(--bg-base)', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0' }}>
                        <div className="flex justify-between items-center mb-1">
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{log.type}</span>
                          <span className="text-secondary text-sm">{log.timestamp}</span>
                        </div>
                        <div className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                          <User size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }}/> 
                          {log.user}
                        </div>
                        <div style={{ backgroundColor: 'white', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                          {log.note}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Section: Actions */}
            <div className="card" style={{ backgroundColor: 'var(--bg-elevated)', marginTop: '1rem' }}>
              <h2 className="card-title mb-4 flex items-center gap-2">
                <ShieldAlert size={18} className="text-warning" />
                Service Actions
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                {serviceActions.map((action, idx) => (
                  <button 
                    key={idx} 
                    style={{ 
                      backgroundColor: action.bg, 
                      color: action.color, 
                      width: '100%', 
                      textAlign: 'center', 
                      padding: '0.75rem', 
                      fontWeight: 600,
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      transition: 'transform 0.2s, filter 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
                    onMouseOut={(e) => e.currentTarget.style.filter = 'brightness(1)'}
                    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    onClick={() => setActiveAction(action.name)}
                  >
                    {action.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Dynamic Action Modals */}
      {activeAction === 'Change Itinerary' && selectedBooking && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 className="card-title mb-4">Change Itinerary Request</h2>
            
            {changeItineraryStep === 1 ? (
              <>
                <div style={{ backgroundColor: 'var(--bg-base)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                  <h3 className="text-sm text-secondary" style={{ textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.5rem' }}>Current Itinerary</h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: selectedBooking.tripType === 'Round Trip' ? '1fr 1fr' : '1fr', gap: '1rem' }}>
                    {/* Outbound */}
                    <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Outbound: {selectedBooking.outboundFlight.departureAirport} → {selectedBooking.outboundFlight.arrivalAirport}</div>
                      <div className="text-secondary text-sm">{selectedBooking.outboundFlight.airline} {selectedBooking.outboundFlight.flightNumber}</div>
                      <div className="text-secondary text-sm">{selectedBooking.outboundFlight.departureDate}</div>
                    </div>
                    
                    {/* Inbound */}
                    {selectedBooking.inboundFlight && (
                      <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                        <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Inbound: {selectedBooking.inboundFlight.departureAirport} → {selectedBooking.inboundFlight.arrivalAirport}</div>
                        <div className="text-secondary text-sm">{selectedBooking.inboundFlight.airline} {selectedBooking.inboundFlight.flightNumber}</div>
                        <div className="text-secondary text-sm">{selectedBooking.inboundFlight.departureDate}</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group mb-6">
                  <label className="form-label" style={{ fontWeight: 600 }}>Which itinerary do you want to change? <span className="text-danger">*</span></label>
                  <div className="flex-col gap-2" style={{ display: 'flex', marginTop: '0.5rem' }}>
                    <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                      <input type="radio" name="leg" value="Outbound Flight" checked={selectedLegToChange === 'Outbound Flight'} onChange={(e) => setSelectedLegToChange(e.target.value)} />
                      Outbound Flight
                    </label>
                    {selectedBooking.tripType === 'Round Trip' && (
                      <>
                        <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                          <input type="radio" name="leg" value="Inbound Flight" checked={selectedLegToChange === 'Inbound Flight'} onChange={(e) => setSelectedLegToChange(e.target.value)} />
                          Inbound Flight
                        </label>
                        <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                          <input type="radio" name="leg" value="Both Outbound and Inbound Flights" checked={selectedLegToChange === 'Both Outbound and Inbound Flights'} onChange={(e) => setSelectedLegToChange(e.target.value)} />
                          Both Outbound and Inbound Flights
                        </label>
                      </>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>What would you like to change? <span className="text-danger">*</span></label>
                  <textarea 
                    className="form-input" 
                    rows="4" 
                    placeholder="Please describe the changes you would like to make to your itinerary (e.g., Change travel date, departure time, flight, destination, etc.)..."
                    value={changeRequestNote}
                    onChange={(e) => setChangeRequestNote(e.target.value)}
                  ></textarea>
                </div>
                
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Preferred New Date (Optional)</label>
                  <input type="date" className="form-input" value={preferredNewDate} onChange={(e) => setPreferredNewDate(e.target.value)} />
                </div>

                <div className="flex justify-between mt-6 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                  <button className="btn btn-secondary" onClick={resetChangeItineraryState}>Cancel</button>
                  <button 
                    className="btn btn-primary" 
                    disabled={!selectedLegToChange || !changeRequestNote}
                    onClick={() => setChangeItineraryStep(2)}
                    style={{ opacity: (!selectedLegToChange || !changeRequestNote) ? 0.5 : 1 }}
                  >
                    Review Changes →
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ backgroundColor: 'var(--bg-base)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontWeight: 600, marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Request Summary</h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.75rem', fontSize: '0.875rem' }}>
                    <div className="text-secondary">Booking ID:</div>
                    <div style={{ fontWeight: 500 }}>{selectedBooking.id}</div>
                    
                    <div className="text-secondary">PNR:</div>
                    <div style={{ fontWeight: 500 }}>{selectedBooking.pnr}</div>
                    
                    <div className="text-secondary">Selected Itinerary:</div>
                    <div style={{ fontWeight: 500, color: 'var(--primary-accent)' }}>{selectedLegToChange}</div>
                    
                    <div className="text-secondary">Current Route:</div>
                    <div>{selectedBooking.outboundFlight.departureAirport} → {selectedBooking.outboundFlight.arrivalAirport} {selectedBooking.inboundFlight && `(Round Trip)`}</div>
                    
                    <div className="text-secondary mt-2">Requested Change:</div>
                    <div className="mt-2" style={{ backgroundColor: 'white', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                      {changeRequestNote}
                      {preferredNewDate && <div className="mt-2 text-primary text-sm font-medium">Preferred Date: {preferredNewDate}</div>}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-6 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                  <button className="btn btn-secondary" onClick={() => setChangeItineraryStep(1)}>← Back to Edit</button>
                  <button className="btn btn-primary" onClick={submitChangeItinerary}>Submit Change Request</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      
      {activeAction && activeAction !== 'Change Itinerary' && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px' }}>
            <h2 className="card-title mb-4">{activeAction}</h2>
            <p className="text-secondary mb-6">You are initiating the <strong>{activeAction}</strong> workflow for booking <strong>{selectedBooking?.id}</strong>. This action may result in additional charges or refunds to the customer.</p>
            
            <div className="form-group">
              <label className="form-label">Internal Notes / Reason</label>
              <textarea className="form-input" rows="3" placeholder="Explain why this action is being taken..."></textarea>
            </div>
            
            <div className="flex justify-between mt-6">
              <button className="btn btn-secondary" onClick={() => setActiveAction(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => setActiveAction(null)}>Proceed</button>
            </div>
          </div>
        </div>
      )}

      {isConfirmModalOpen && bookingToConfirm && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110 }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px' }}>
            <h2 className="card-title mb-4">Confirm Booking</h2>
            <p className="text-secondary mb-6">Are you sure you want to confirm this booking?</p>
            
            <div style={{ backgroundColor: 'var(--bg-base)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <div className="text-secondary text-sm">Booking ID</div>
                  <div style={{ fontWeight: 600 }}>{bookingToConfirm.id}</div>
                </div>
                <div>
                  <div className="text-secondary text-sm">PNR</div>
                  <div style={{ fontWeight: 600 }}>{bookingToConfirm.pnr}</div>
                </div>
                <div>
                  <div className="text-secondary text-sm">Customer Name</div>
                  <div>{bookingToConfirm.name}</div>
                </div>
                <div>
                  <div className="text-secondary text-sm">Passenger Name</div>
                  <div>{bookingToConfirm.passengerName}</div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div className="text-secondary text-sm">Flight/Itinerary</div>
                  <div>{bookingToConfirm.flight}</div>
                </div>
                <div>
                  <div className="text-secondary text-sm">Travel Date</div>
                  <div>{bookingToConfirm.travelDate}</div>
                </div>
                <div>
                  <div className="text-secondary text-sm">Total Amount</div>
                  <div style={{ fontWeight: 600, color: 'var(--success)' }}>{bookingToConfirm.amount}</div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between">
              <button className="btn btn-secondary" onClick={() => setIsConfirmModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={confirmBooking}>Confirm Booking</button>
            </div>
          </div>
        </div>
      )}

      {notification && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', backgroundColor: 'var(--success)', color: 'white', padding: '1rem 2rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', zIndex: 200, display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }} className="animate-fade-in">
          ✓ {notification}
        </div>
      )}
    </div>
  );
};

export default SearchService;
