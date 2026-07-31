import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, AlertTriangle, Calendar, Users, MapPin, Search, Filter, RefreshCw, Download, ChevronDown, Clock } from 'lucide-react';
import { fetchLeads } from '../services/supabase';

const UpcomingTrips = () => {
  const navigate = useNavigate();
  const [allLeads, setAllLeads] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date().getTime());
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState('48h'); // '6h', '12h', '24h', '48h', 'custom'
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [bookingStatus, setBookingStatus] = useState('Converted'); // 'All Active', 'Converted', 'Cancelled', etc.
  const [paymentStatus, setPaymentStatus] = useState('All');

  // Load data and set up live timer
  useEffect(() => {
    const loadLeads = async () => {
      const savedLeads = await fetchLeads();
      setAllLeads(savedLeads);
    };
    loadLeads();

    // Update current time every minute to keep countdowns accurate
    const interval = setInterval(() => {
      setCurrentTime(new Date().getTime());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const getFlightTimestamp = (dateStr, timeStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    // Use local timezone. If dateStr is YYYY-MM-DD it parses as UTC midnight, so let's adjust.
    // A more robust way:
    const [year, month, day] = dateStr.split('-').map(Number);
    if (!year) return null;
    
    let hours = 0, minutes = 0;
    if (timeStr) {
      const parts = timeStr.split(':');
      hours = parseInt(parts[0], 10);
      minutes = parseInt(parts[1], 10);
    }
    
    // Create Date in local timezone
    return new Date(year, month - 1, day, hours, minutes, 0).getTime();
  };

  const getTimeRemaining = (flightTime, nowTime) => {
    const diff = flightTime - nowTime;
    if (diff <= 0) return { text: 'Departed', status: 'departed', color: '#94a3b8', bg: '#f1f5f9' };
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const days = Math.floor(hours / 24);
    
    let status = 'safe';
    let color = '#10b981';
    let bg = '#d1fae5';

    if (hours < 6) {
      status = 'critical';
      color = '#e11d48';
      bg = '#ffe4e6';
    } else if (hours < 12) {
      status = 'warning';
      color = '#d97706';
      bg = '#fef3c7';
    } else if (hours < 24) {
      status = 'caution';
      color = '#ca8a04';
      bg = '#fef08a';
    }

    let text = '';
    if (days > 0) {
      text = `${days} Day${days > 1 ? 's' : ''} ${hours % 24} Hr${hours % 24 !== 1 ? 's' : ''}`;
    } else if (hours > 0) {
      text = `${hours} Hr${hours !== 1 ? 's' : ''} ${minutes} Min`;
    } else {
      text = `${minutes} Min`;
    }
    
    return { text, status, color, bg };
  };

  const handleReset = () => {
    setSearchTerm('');
    setTimeFilter('48h');
    setCustomStart('');
    setCustomEnd('');
    setBookingStatus('Converted');
    setPaymentStatus('All');
  };

  const exportCSV = () => {
    if (filteredFlights.length === 0) return;
    const headers = ['PNR', 'Passenger', 'Flight Number', 'Airline', 'Origin', 'Destination', 'Departure Date', 'Departure Time', 'Booking Status', 'Payment Status', 'Sales Agent'];
    const rows = filteredFlights.map(f => [
      f.vendorId || 'N/A', f.fullName || 'N/A', f.flightNumber || 'N/A', f.preferredAirline || 'N/A',
      f.origin || 'N/A', f.destination || 'N/A', f.departureDate || 'N/A', f.departureTime || 'N/A',
      f.leadStatus || 'N/A', f.paymentStatus || 'N/A', f.salesAgent || 'N/A'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "upcoming_flights.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter Logic
  const filteredFlights = allLeads.filter(lead => {
    // 1. Must be a flight booking
    if (lead.leadType !== 'Flight Booking') return false;

    // 2. Booking Status
    if (bookingStatus === 'Converted' && lead.leadStatus !== 'Converted') return false;
    if (bookingStatus === 'Cancelled' && lead.leadStatus !== 'Cancelled') return false;
    if (bookingStatus === 'All Active' && lead.leadStatus === 'Cancelled') return false;

    // 3. Payment Status
    if (paymentStatus !== 'All' && (lead.paymentStatus || 'Pending') !== paymentStatus) return false;

    // 4. Departure Time & Date Logic
    const flightTime = getFlightTimestamp(lead.departureDate, lead.departureTime);
    if (!flightTime) return false;

    // Calculate diff from current exact timestamp
    const diffHours = (flightTime - currentTime) / (1000 * 60 * 60);

    // Exclude departed flights unless specifically searching custom dates in the past
    if (timeFilter !== 'custom' && diffHours <= 0) return false;

    if (timeFilter === '6h' && diffHours > 6) return false;
    if (timeFilter === '12h' && diffHours > 12) return false;
    if (timeFilter === '24h' && diffHours > 24) return false;
    if (timeFilter === '48h' && diffHours > 48) return false;

    if (timeFilter === 'custom') {
      const start = customStart ? getFlightTimestamp(customStart, '00:00') : null;
      const end = customEnd ? getFlightTimestamp(customEnd, '23:59') : null;
      if (start && flightTime < start) return false;
      if (end && flightTime > end) return false;
    }

    // 5. Search Text (Partial, Case-insensitive)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const searchableStr = [
        lead.vendorId, lead.fullName, lead.flightNumber, lead.preferredAirline,
        lead.origin, lead.destination, lead.salesAgent
      ].join(' ').toLowerCase();
      if (!searchableStr.includes(term)) return false;
    }

    return true;
  });

  // Sort by time remaining ascending
  filteredFlights.sort((a, b) => {
    const tA = getFlightTimestamp(a.departureDate, a.departureTime) || Infinity;
    const tB = getFlightTimestamp(b.departureDate, b.departureTime) || Infinity;
    return tA - tB;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f1f5f9', fontFamily: "'Inter', sans-serif" }}>
      
      {/* Header */}
      <header style={{ height: '72px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '40px', height: '40px', backgroundColor: '#0ea5e9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(14, 165, 233, 0.2)' }}>
            <Plane size={24} color="white" strokeWidth={2} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#0f172a' }}>Upcoming Flights</h1>
            <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={12} /> Live tracking for departures
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={exportCSV}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#ffffff', color: '#334155', fontWeight: '600', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer', transition: 'all 0.2s' }}>
            <Download size={16} /> Export Results
          </button>
          <button 
            onClick={() => navigate('/reports/create-lead')}
            style={{ padding: '10px 20px', backgroundColor: '#0f172a', color: '#ffffff', fontWeight: '600', fontSize: '13px', borderRadius: '6px', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>
            Back to Dashboard
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* Sidebar Filters */}
        <div style={{ width: '320px', backgroundColor: '#ffffff', borderRight: '1px solid #e2e8f0', padding: '24px', overflowY: 'auto', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={18} /> Filters
            </h3>
            <button 
              onClick={handleReset}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: '#3b82f6', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
              <RefreshCw size={14} /> Reset
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Search Bar */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Global Search</label>
              <div style={{ position: 'relative' }}>
                <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '10px' }} />
                <input 
                  type="text" 
                  placeholder="PNR, Passenger, Flight..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box', outline: 'none' }}
                />
              </div>
            </div>

            {/* Time Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Departure Window</label>
              <select 
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#f8fafc', outline: 'none' }}
              >
                <option value="6h">Departing in Next 6 Hours</option>
                <option value="12h">Departing in Next 12 Hours</option>
                <option value="24h">Departing in Next 24 Hours</option>
                <option value="48h">All Upcoming (48 Hours)</option>
                <option value="custom">Custom Date Range</option>
              </select>
            </div>

            {timeFilter === 'custom' && (
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Start Date</label>
                  <input type="date" value={customStart} onChange={(e)=>setCustomStart(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px', boxSizing: 'border-box' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>End Date</label>
                  <input type="date" value={customEnd} onChange={(e)=>setCustomEnd(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px', boxSizing: 'border-box' }} />
                </div>
              </div>
            )}

            {/* Booking Status */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Booking Status</label>
              <select 
                value={bookingStatus}
                onChange={(e) => setBookingStatus(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
              >
                <option value="All Active">All Active Bookings</option>
                <option value="Converted">Confirmed / Converted</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Payment Status */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Payment Status</label>
              <select 
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Paid">Paid</option>
              </select>
            </div>

          </div>
        </div>

        {/* Results Area */}
        <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
            <div>
              <h2 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>Search Results</h2>
              <div style={{ color: '#64748b', fontSize: '14px' }}>Found {filteredFlights.length} matching flight{filteredFlights.length !== 1 ? 's' : ''}</div>
            </div>
          </div>

          {filteredFlights.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 24px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <AlertTriangle size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
              <h3 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '18px' }}>No Flights Match Your Criteria</h3>
              <p style={{ margin: 0, color: '#64748b' }}>Try adjusting your filters, changing the date range, or clicking Reset.</p>
            </div>
          ) : (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '16px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Time Remaining</th>
                      <th style={{ padding: '16px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>PNR / Passenger</th>
                      <th style={{ padding: '16px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Flight Info</th>
                      <th style={{ padding: '16px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Route</th>
                      <th style={{ padding: '16px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFlights.map(flight => {
                      const flightTime = getFlightTimestamp(flight.departureDate, flight.departureTime);
                      const countdown = getTimeRemaining(flightTime, currentTime);

                      return (
                        <tr key={flight.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background-color 0.15s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                          <td style={{ padding: '16px' }}>
                            <div style={{ display: 'inline-block', backgroundColor: countdown.bg, color: countdown.color, padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', border: `1px solid ${countdown.color}40` }}>
                              {countdown.text}
                            </div>
                            <div style={{ marginTop: '8px', fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Calendar size={12} /> {flight.departureDate} {flight.departureTime || ''}
                            </div>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>{flight.vendorId || 'TBA'}</div>
                            <div style={{ fontSize: '13px', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={12} /> {flight.fullName || 'Unknown'}</div>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>{flight.flightNumber || 'TBA'}</div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>{flight.preferredAirline || 'Airline TBA'}</div>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600', color: '#334155' }}>
                              <span>{flight.origin || 'N/A'}</span>
                              <Plane size={14} color="#94a3b8" />
                              <span>{flight.destination || 'N/A'}</span>
                            </div>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: flight.leadStatus === 'Converted' ? '#10b981' : '#f59e0b' }}></span>
                                <span style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>{flight.leadStatus}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 6px', borderRadius: '4px', backgroundColor: flight.paymentStatus === 'Paid' ? '#dcfce3' : '#f1f5f9', color: flight.paymentStatus === 'Paid' ? '#166534' : '#475569' }}>
                                  Payment: {flight.paymentStatus || 'Pending'}
                                </span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default UpcomingTrips;
