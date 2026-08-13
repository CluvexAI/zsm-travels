import React, { useState, useMemo, useEffect } from 'react';
import { Save, Search, Filter, Eye, Edit3, ChevronLeft, ChevronRight, Download, CheckCircle, X, CreditCard } from 'lucide-react';
import { filterDataByScope } from '../services/mockAuthService';
import { useAuth } from '../contexts/AuthContext';
import { fetchBookings, saveBookings } from '../services/supabase';

const bookingStatusOptions = ['All', 'On Hold', 'Confirmed', 'Cancelled', 'Refunded', 'Pending', 'Voided'];
const paymentStatusOptions = ['All', 'Pending', 'Authorized', 'Captured', 'Declined', 'Refunded', 'Chargeback'];
const workStatusOptions = ['All', 'Pending', 'In Progress', 'Completed', 'Escalated', 'On Hold'];
const smsStatusOptions = ['All', 'Pending', 'Sent', 'Delivered', 'Failed', 'Not Required'];
const callStatusOptions = ['All', 'Pending', 'Connected', 'No Answer', 'Voicemail', 'Busy', 'Completed'];
const crmAuditOptions = ['All', 'Pending', 'Passed', 'Failed', 'In Review', 'Waived'];
const qualityAuditOptions = ['All', 'Passed', 'Failed', 'Pending', 'In Review', 'Waived'];
const cbStatusOptions = ['All', 'Completed', 'Pending', 'In Progress', 'Cancelled', 'Expired'];
const actionOptions = ['All', 'Send Reminder', 'Cancel Booking', 'Request Refund', 'Escalate Issue', 'Process Payment'];

const ROWS_PER_PAGE = 8;

const RetentionReports = () => {
  const [lifecycle, setLifecycle] = useState({
    bookingStatus: 'All',
    paymentStatus: 'All',
    workStatus: 'All',
    smsStatus: 'All',
    callStatus: 'All',
    crmAuditStatus: 'All',
    qualityAuditStatus: 'All',
    cbStatus: 'All',
    action: 'All',
  });

  const { user } = useAuth();
  
  const [rawBookings, setRawBookings] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchBookings();
      if (data) {
        setRawBookings(data);
      }
    };
    loadData();
  }, []);

  const mappedReservations = useMemo(() => {
    return rawBookings.map(b => ({
      id: b.id,
      pnr: b.pnr || b.outboundFlight?.pnr || 'N/A',
      passenger: b.passengerName || b.name || 'Unknown',
      route: b.outboundFlight ? `${b.outboundFlight.departureAirport} → ${b.outboundFlight.arrivalAirport}` : 'Unknown',
      airline: b.outboundFlight?.airline || 'Unknown',
      travelDate: b.travelDate || b.outboundFlight?.departureDate || 'N/A',
      bookingDate: b.date || 'N/A',
      amount: parseFloat((b.amount || '0').toString().replace('$', '')) || 0,
      bookingStatus: b.status || 'Pending',
      paymentStatus: b.paymentStatus || 'Pending',
      workStatus: b.workStatus || 'Pending',
      smsStatus: b.smsStatus || 'Pending',
      callStatus: b.callStatus || 'Pending',
      crmAuditStatus: b.crmAuditStatus || 'Pending',
      qualityAuditStatus: b.qualityAuditStatus || 'Pending',
      cbStatus: b.cbStatus || 'Pending',
      agent: b.agent || 'System',
      action: b.action || 'None',
      _original: b // Keep reference to original booking object
    }));
  }, [rawBookings]);

  // Simulate backend data fetching with scope limits applied BEFORE any frontend filtering
  const scopedReservations = useMemo(() => {
    return filterDataByScope(mappedReservations, user, 'Bookings', 'View');
  }, [mappedReservations, user]);

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'view', 'edit', null
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [editForm, setEditForm] = useState({});

  const handleChange = (field, value) => {
    setLifecycle(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  const handleEditChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const openEditModal = (r) => {
    setSelectedReservation(r);
    setEditForm({
      pnr: r.pnr,
      passenger: r.passenger,
      route: r.route,
      airline: r.airline,
      travelDate: r.travelDate,
      bookingDate: r.bookingDate,
      amount: r.amount,
      agent: r.agent,
      bookingStatus: r.bookingStatus,
      paymentStatus: r.paymentStatus,
      workStatus: r.workStatus,
      smsStatus: r.smsStatus,
      callStatus: r.callStatus,
      crmAuditStatus: r.crmAuditStatus,
      qualityAuditStatus: r.qualityAuditStatus,
      cbStatus: r.cbStatus
    });
    setActiveModal('edit');
  };

  const saveEditedReservation = async () => {
    if (!selectedReservation || !selectedReservation._original) return;

    // Update the specific fields that are editable
    const originalBooking = { ...selectedReservation._original };
    
    // Map editForm back to the original booking format
    if (editForm.pnr !== undefined) originalBooking.pnr = editForm.pnr;
    if (editForm.passenger !== undefined) originalBooking.name = editForm.passenger; // Or passengerName
    if (editForm.travelDate !== undefined) originalBooking.travelDate = editForm.travelDate;
    if (editForm.bookingDate !== undefined) originalBooking.date = editForm.bookingDate;
    if (editForm.amount !== undefined) originalBooking.amount = `$${editForm.amount}`;
    if (editForm.agent !== undefined) originalBooking.agent = editForm.agent;
    
    // Map lifecycle statuses
    if (editForm.bookingStatus !== undefined) originalBooking.status = editForm.bookingStatus;
    if (editForm.paymentStatus !== undefined) originalBooking.paymentStatus = editForm.paymentStatus;
    if (editForm.workStatus !== undefined) originalBooking.workStatus = editForm.workStatus;
    if (editForm.smsStatus !== undefined) originalBooking.smsStatus = editForm.smsStatus;
    if (editForm.callStatus !== undefined) originalBooking.callStatus = editForm.callStatus;
    if (editForm.crmAuditStatus !== undefined) originalBooking.crmAuditStatus = editForm.crmAuditStatus;
    if (editForm.qualityAuditStatus !== undefined) originalBooking.qualityAuditStatus = editForm.qualityAuditStatus;
    if (editForm.cbStatus !== undefined) originalBooking.cbStatus = editForm.cbStatus;

    // Update state
    const updatedRawBookings = rawBookings.map(b => b.id === originalBooking.id ? originalBooking : b);
    setRawBookings(updatedRawBookings);
    
    // Save to Supabase
    await saveBookings(updatedRawBookings);
    
    setActiveModal(null);
    setShowSuccessModal(true);
  };

  const handleBulkSave = async () => {
    const statusesToUpdate = {};
    if (lifecycle.bookingStatus !== 'All') statusesToUpdate.status = lifecycle.bookingStatus;
    if (lifecycle.paymentStatus !== 'All') statusesToUpdate.paymentStatus = lifecycle.paymentStatus;
    if (lifecycle.workStatus !== 'All') statusesToUpdate.workStatus = lifecycle.workStatus;
    if (lifecycle.smsStatus !== 'All') statusesToUpdate.smsStatus = lifecycle.smsStatus;
    if (lifecycle.callStatus !== 'All') statusesToUpdate.callStatus = lifecycle.callStatus;
    if (lifecycle.crmAuditStatus !== 'All') statusesToUpdate.crmAuditStatus = lifecycle.crmAuditStatus;
    if (lifecycle.qualityAuditStatus !== 'All') statusesToUpdate.qualityAuditStatus = lifecycle.qualityAuditStatus;
    if (lifecycle.cbStatus !== 'All') statusesToUpdate.cbStatus = lifecycle.cbStatus;

    if (Object.keys(statusesToUpdate).length === 0) {
      setShowSuccessModal(true);
      return;
    }

    const updatedRawBookings = [...rawBookings];
    let hasChanges = false;

    // Apply only to filtered reservations
    filteredReservations.forEach(r => {
      const idx = updatedRawBookings.findIndex(b => b.id === r.id);
      if (idx !== -1) {
        updatedRawBookings[idx] = { ...updatedRawBookings[idx], ...statusesToUpdate };
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setRawBookings(updatedRawBookings);
      await saveBookings(updatedRawBookings);
    }
    
    setShowSuccessModal(true);
  };

  // Filter reservations based on lifecycle filters and search
  const filteredReservations = useMemo(() => {
    return scopedReservations.filter(r => {
      if (lifecycle.bookingStatus !== 'All' && r.bookingStatus !== lifecycle.bookingStatus) return false;
      if (lifecycle.paymentStatus !== 'All' && r.paymentStatus !== lifecycle.paymentStatus) return false;
      if (lifecycle.workStatus !== 'All' && r.workStatus !== lifecycle.workStatus) return false;
      if (lifecycle.smsStatus !== 'All' && r.smsStatus !== lifecycle.smsStatus) return false;
      if (lifecycle.callStatus !== 'All' && r.callStatus !== lifecycle.callStatus) return false;
      if (lifecycle.crmAuditStatus !== 'All' && r.crmAuditStatus !== lifecycle.crmAuditStatus) return false;
      if (lifecycle.qualityAuditStatus !== 'All' && r.qualityAuditStatus !== lifecycle.qualityAuditStatus) return false;
      if (lifecycle.cbStatus !== 'All' && r.cbStatus !== lifecycle.cbStatus) return false;
      if (lifecycle.action !== 'All' && r.action !== lifecycle.action) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          r.id.toLowerCase().includes(q) ||
          r.pnr.toLowerCase().includes(q) ||
          r.passenger.toLowerCase().includes(q) ||
          r.route.toLowerCase().includes(q) ||
          r.airline.toLowerCase().includes(q) ||
          r.agent.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [lifecycle, searchQuery, scopedReservations]);

  const totalPages = Math.max(1, Math.ceil(filteredReservations.length / ROWS_PER_PAGE));
  const paginatedData = filteredReservations.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

  const selectStyle = {
    width: '100%',
    padding: '0.5rem 0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '0.875rem',
    color: '#374151',
    backgroundColor: 'white',
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 0.75rem center',
    paddingRight: '2rem',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.7rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: '#6b7280',
    marginBottom: '0.5rem',
  };

  const fieldGroupStyle = {
    flex: '1 1 0%',
    minWidth: '160px',
  };

  const getBadgeStyle = (status) => {
    const map = {
      'On Hold': { bg: '#fef3c7', color: '#92400e' },
      'Confirmed': { bg: '#d1fae5', color: '#065f46' },
      'Cancelled': { bg: '#fee2e2', color: '#991b1b' },
      'Refunded': { bg: '#ede9fe', color: '#5b21b6' },
      'Pending': { bg: '#e0f2fe', color: '#075985' },
      'Voided': { bg: '#f3f4f6', color: '#374151' },
      'Authorized': { bg: '#dbeafe', color: '#1e40af' },
      'Captured': { bg: '#d1fae5', color: '#065f46' },
      'Declined': { bg: '#fee2e2', color: '#991b1b' },
      'Chargeback': { bg: '#fce7f3', color: '#9d174d' },
      'In Progress': { bg: '#fef3c7', color: '#92400e' },
      'Completed': { bg: '#d1fae5', color: '#065f46' },
      'Escalated': { bg: '#fee2e2', color: '#991b1b' },
      'Sent': { bg: '#dbeafe', color: '#1e40af' },
      'Delivered': { bg: '#d1fae5', color: '#065f46' },
      'Failed': { bg: '#fee2e2', color: '#991b1b' },
      'Not Required': { bg: '#f3f4f6', color: '#374151' },
      'Connected': { bg: '#d1fae5', color: '#065f46' },
      'No Answer': { bg: '#fef3c7', color: '#92400e' },
      'Voicemail': { bg: '#e0f2fe', color: '#075985' },
      'Busy': { bg: '#fce7f3', color: '#9d174d' },
      'Passed': { bg: '#d1fae5', color: '#065f46' },
      'In Review': { bg: '#fef3c7', color: '#92400e' },
      'Waived': { bg: '#f3f4f6', color: '#374151' },
      'Expired': { bg: '#f3f4f6', color: '#374151' },
    };
    const s = map[status] || { bg: '#f3f4f6', color: '#374151' };
    return {
      display: 'inline-block',
      padding: '0.15rem 0.5rem',
      borderRadius: '9999px',
      fontSize: '0.7rem',
      fontWeight: 600,
      backgroundColor: s.bg,
      color: s.color,
      whiteSpace: 'nowrap',
    };
  };

  const thStyle = {
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
  };

  const tdStyle = {
    padding: '0.6rem 0.75rem',
    fontSize: '0.8rem',
    color: '#374151',
    borderBottom: '1px solid #f3f4f6',
    whiteSpace: 'nowrap',
  };

  const activeFiltersCount = Object.values(lifecycle).filter(v => v !== 'All').length;

  return (
    <div className="page-container">
      {/* Booking Lifecycle Management Card */}
      <div style={{
        background: 'white',
        borderRadius: '6px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        overflow: 'hidden',
      }}>
        {/* Card Header */}
        <div style={{
          borderBottom: '3px solid #38b2ac',
          padding: '1.25rem 1.5rem 1rem',
        }}>
          <h2 style={{
            fontSize: '1.15rem',
            fontWeight: 700,
            color: '#0d9488',
            margin: 0,
            letterSpacing: '0.2px',
          }}>
            Booking Lifecycle Management
          </h2>
        </div>

        {/* Card Body */}
        <div style={{ padding: '1.5rem' }}>
          {/* Row 1 */}
          <div style={{
            display: 'flex',
            gap: '1.25rem',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
          }}>
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Booking Status</label>
              <select
                value={lifecycle.bookingStatus}
                onChange={(e) => handleChange('bookingStatus', e.target.value)}
                style={selectStyle}
              >
                {bookingStatusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Payment Status</label>
              <select
                value={lifecycle.paymentStatus}
                onChange={(e) => handleChange('paymentStatus', e.target.value)}
                style={selectStyle}
              >
                {paymentStatusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Work Status</label>
              <select
                value={lifecycle.workStatus}
                onChange={(e) => handleChange('workStatus', e.target.value)}
                style={selectStyle}
              >
                {workStatusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            <div style={fieldGroupStyle}>
              <label style={labelStyle}>SMS Status</label>
              <select
                value={lifecycle.smsStatus}
                onChange={(e) => handleChange('smsStatus', e.target.value)}
                style={selectStyle}
              >
                {smsStatusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Call Status</label>
              <select
                value={lifecycle.callStatus}
                onChange={(e) => handleChange('callStatus', e.target.value)}
                style={selectStyle}
              >
                {callStatusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>

          {/* Row 2 */}
          <div style={{
            display: 'flex',
            gap: '1.25rem',
            marginBottom: '1.75rem',
            flexWrap: 'wrap',
          }}>
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>CRM Audit Status</label>
              <select
                value={lifecycle.crmAuditStatus}
                onChange={(e) => handleChange('crmAuditStatus', e.target.value)}
                style={selectStyle}
              >
                {crmAuditOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Quality Audit Status</label>
              <select
                value={lifecycle.qualityAuditStatus}
                onChange={(e) => handleChange('qualityAuditStatus', e.target.value)}
                style={selectStyle}
              >
                {qualityAuditOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            <div style={fieldGroupStyle}>
              <label style={labelStyle}>CB Status</label>
              <select
                value={lifecycle.cbStatus}
                onChange={(e) => handleChange('cbStatus', e.target.value)}
                style={selectStyle}
              >
                {cbStatusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Merchant Name</label>
              <div style={{
                fontSize: '0.9rem',
                fontWeight: 700,
                color: '#1f2937',
                paddingTop: '0.5rem',
              }}>
                ZSM TRAVEL USA
              </div>
            </div>

            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Vendor Code</label>
              <div style={{
                fontSize: '0.9rem',
                fontWeight: 700,
                color: '#1f2937',
                paddingTop: '0.5rem',
              }}>
                VND-STD
              </div>
            </div>

            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Actions</label>
              <select
                value={lifecycle.action}
                onChange={(e) => handleChange('action', e.target.value)}
                style={selectStyle}
              >
                {actionOptions.map(opt => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Save Button */}
          <div>
            <button
              onClick={handleBulkSave}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.5rem',
                backgroundColor: '#38b2ac',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#319795'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#38b2ac'}
            >
              <Save size={16} />
              Save Lifecycle Changes
            </button>
          </div>
        </div>
      </div>

      {/* Filtered Reservations Table */}
      <div style={{
        background: 'white',
        borderRadius: '6px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        overflow: 'hidden',
        marginTop: '1.5rem',
      }}>
        {/* Table Header Bar */}
        <div style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1f2937', margin: 0 }}>
              Reservations
            </h3>
            <span style={{
              background: '#e0f2fe',
              color: '#075985',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.15rem 0.6rem',
              borderRadius: '9999px',
            }}>
              {filteredReservations.length} {filteredReservations.length === 1 ? 'result' : 'results'}
            </span>
            {activeFiltersCount > 0 && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                background: '#fef3c7',
                color: '#92400e',
                fontSize: '0.7rem',
                fontWeight: 600,
                padding: '0.15rem 0.5rem',
                borderRadius: '9999px',
              }}>
                <Filter size={10} />
                {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input
                type="text"
                placeholder="Search by ID, PNR, name, route..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                style={{
                  padding: '0.4rem 0.75rem 0.4rem 2rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  width: '260px',
                  outline: 'none',
                  color: '#374151',
                }}
              />
            </div>
            <button
              onClick={() => {
                const csv = [
                  ['Booking ID', 'PNR', 'Passenger', 'Route', 'Airline', 'Travel Date', 'Amount', 'Booking Status', 'Payment Status', 'Work Status', 'Agent'].join(','),
                  ...filteredReservations.map(r =>
                    [r.id, r.pnr, `"${r.passenger}"`, `"${r.route}"`, `"${r.airline}"`, r.travelDate, r.amount.toFixed(2), r.bookingStatus, r.paymentStatus, r.workStatus, r.agent].join(',')
                  )
                ].join('\n');
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'retention_report.csv';
                a.click();
                URL.revokeObjectURL(url);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.4rem 0.75rem',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '0.8rem',
                fontWeight: 500,
                color: '#374151',
                cursor: 'pointer',
              }}
            >
              <Download size={13} />
              Export
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Booking ID</th>
                <th style={thStyle}>PNR</th>
                <th style={thStyle}>Passenger</th>
                <th style={thStyle}>Route</th>
                <th style={thStyle}>Airline</th>
                <th style={thStyle}>Travel Date</th>
                <th style={thStyle}>Amount</th>
                <th style={thStyle}>Booking</th>
                <th style={thStyle}>Payment</th>
                <th style={thStyle}>Work</th>
                <th style={thStyle}>Agent</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={12} style={{ ...tdStyle, textAlign: 'center', padding: '3rem 1rem', color: '#9ca3af' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>No reservations found</div>
                    <div style={{ fontSize: '0.8rem' }}>Try adjusting the filters above or changing your search query.</div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((r, idx) => (
                  <tr
                    key={r.id}
                    style={{
                      backgroundColor: idx % 2 === 0 ? 'white' : '#fafafa',
                      transition: 'background-color 0.1s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0fdfa'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? 'white' : '#fafafa'}
                  >
                    <td style={{ ...tdStyle, fontWeight: 700, color: '#0d9488' }}>{r.id}</td>
                    <td style={{ ...tdStyle, fontFamily: 'monospace', fontWeight: 600, letterSpacing: '0.5px' }}>{r.pnr}</td>
                    <td style={{ ...tdStyle, fontWeight: 500 }}>{r.passenger}</td>
                    <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '0.75rem' }}>{r.route}</td>
                    <td style={tdStyle}>{r.airline}</td>
                    <td style={tdStyle}>{new Date(r.travelDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>${r.amount.toFixed(2)}</td>
                    <td style={tdStyle}><span style={getBadgeStyle(r.bookingStatus)}>{r.bookingStatus}</span></td>
                    <td style={tdStyle}><span style={getBadgeStyle(r.paymentStatus)}>{r.paymentStatus}</span></td>
                    <td style={tdStyle}><span style={getBadgeStyle(r.workStatus)}>{r.workStatus}</span></td>
                    <td style={tdStyle}>{r.agent}</td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button
                          title="View"
                          onClick={() => { setSelectedReservation(r); setActiveModal('view'); }}
                          style={{
                            padding: '0.3rem',
                            borderRadius: '4px',
                            border: '1px solid #e5e7eb',
                            background: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <Eye size={13} color="#6b7280" />
                        </button>
                        <button
                          title="Edit"
                          onClick={() => openEditModal(r)}
                          style={{
                            padding: '0.3rem',
                            borderRadius: '4px',
                            border: '1px solid #e5e7eb',
                            background: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <Edit3 size={13} color="#6b7280" />
                        </button>
                        <button
                          title="Charge Card"
                          onClick={() => { setSelectedReservation(r); setActiveModal('charge'); }}
                          style={{
                            padding: '0.3rem',
                            borderRadius: '4px',
                            border: '1px solid #e5e7eb',
                            background: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <CreditCard size={13} color="#6b7280" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredReservations.length > 0 && (
          <div style={{
            padding: '0.75rem 1.5rem',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
              Showing {((currentPage - 1) * ROWS_PER_PAGE) + 1}–{Math.min(currentPage * ROWS_PER_PAGE, filteredReservations.length)} of {filteredReservations.length}
            </div>
            <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '0.3rem 0.5rem',
                  borderRadius: '4px',
                  border: '1px solid #d1d5db',
                  background: 'white',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 1 ? 0.4 : 1,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  style={{
                    padding: '0.3rem 0.6rem',
                    borderRadius: '4px',
                    border: `1px solid ${page === currentPage ? '#38b2ac' : '#d1d5db'}`,
                    background: page === currentPage ? '#38b2ac' : 'white',
                    color: page === currentPage ? 'white' : '#374151',
                    fontSize: '0.8rem',
                    fontWeight: page === currentPage ? 700 : 400,
                    cursor: 'pointer',
                  }}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '0.3rem 0.5rem',
                  borderRadius: '4px',
                  border: '1px solid #d1d5db',
                  background: 'white',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage === totalPages ? 0.4 : 1,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, 
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: 'white', padding: '2rem', borderRadius: '8px', 
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            maxWidth: '400px', width: '90%', textAlign: 'center', position: 'relative',
            animation: 'fadeIn 0.2s ease-out forwards'
          }}>
            <button 
              onClick={() => setShowSuccessModal(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
            >
              <X size={20} />
            </button>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <CheckCircle size={48} color="#10b981" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1f2937', marginBottom: '0.5rem' }}>Success!</h3>
            <p style={{ color: '#4b5563', marginBottom: '1.5rem' }}>Lifecycle changes saved successfully!</p>
            <button 
              onClick={() => setShowSuccessModal(false)}
              style={{ padding: '0.5rem 2rem', background: '#38b2ac', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}
            >
              Continue
            </button>
          </div>
        </div>
      )}
      {/* View/Edit Modals */}
      {activeModal && selectedReservation && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, 
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: 'white', padding: '2rem', borderRadius: '8px', 
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            maxWidth: '500px', width: '90%', position: 'relative',
            animation: 'fadeIn 0.2s ease-out forwards'
          }}>
            <button 
              onClick={() => setActiveModal(null)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
            >
              <X size={20} />
            </button>
            
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1f2937', margin: '0 0 1.5rem 0', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.75rem' }}>
              {activeModal === 'edit' ? 'Edit Reservation' : activeModal === 'charge' ? 'Charge Card' : 'View Reservation'}: {selectedReservation.id}
            </h3>
            
            {activeModal === 'charge' ? (
              <div style={{ marginBottom: '2rem' }}>
                <p style={{ color: '#4b5563', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                  You are about to charge the card on file for <strong>{selectedReservation.passenger}</strong> (PNR: {selectedReservation.pnr}).
                </p>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={labelStyle}>Charge Amount ($)</label>
                  <input type="number" step="0.01" style={selectStyle} defaultValue={selectedReservation.amount} />
                </div>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={labelStyle}>Reason</label>
                  <input type="text" style={selectStyle} placeholder="e.g. Balance due, Upgrade fee, Change fee..." />
                </div>
                
                <div style={{ padding: '1rem', backgroundColor: '#f0fdfa', borderRadius: '6px', border: '1px dashed #14b8a6' }}>
                  <div style={{ fontSize: '0.85rem', color: '#0f766e', display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Card on File:</span>
                    <strong>Visa ending in 4242</strong>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#0f766e', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Expiration:</span>
                    <strong>12/28</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem', maxHeight: '60vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
                <div>
                  <label style={labelStyle}>PNR</label>
                  {activeModal === 'edit' ? (
                    <input type="text" style={selectStyle} value={editForm.pnr || ''} onChange={e => handleEditChange('pnr', e.target.value)} />
                  ) : (
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, fontFamily: 'monospace' }}>{selectedReservation.pnr}</div>
                  )}
                </div>
                <div>
                  <label style={labelStyle}>Passenger Name</label>
                  {activeModal === 'edit' ? (
                    <input type="text" style={selectStyle} value={editForm.passenger || ''} onChange={e => handleEditChange('passenger', e.target.value)} />
                  ) : (
                    <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{selectedReservation.passenger}</div>
                  )}
                </div>
                <div>
                  <label style={labelStyle}>Route</label>
                  {activeModal === 'edit' ? (
                    <input type="text" style={selectStyle} value={editForm.route || ''} onChange={e => handleEditChange('route', e.target.value)} />
                  ) : (
                    <div style={{ fontSize: '0.875rem' }}>{selectedReservation.route}</div>
                  )}
                </div>
                <div>
                  <label style={labelStyle}>Airline</label>
                  {activeModal === 'edit' ? (
                    <input type="text" style={selectStyle} value={editForm.airline || ''} onChange={e => handleEditChange('airline', e.target.value)} />
                  ) : (
                    <div style={{ fontSize: '0.875rem' }}>{selectedReservation.airline}</div>
                  )}
                </div>
                <div>
                  <label style={labelStyle}>Travel Date</label>
                  {activeModal === 'edit' ? (
                    <input type="date" style={selectStyle} value={editForm.travelDate || ''} onChange={e => handleEditChange('travelDate', e.target.value)} />
                  ) : (
                    <div style={{ fontSize: '0.875rem' }}>{new Date(selectedReservation.travelDate).toLocaleDateString()}</div>
                  )}
                </div>
                <div>
                  <label style={labelStyle}>Booking Date</label>
                  {activeModal === 'edit' ? (
                    <input type="date" style={selectStyle} value={editForm.bookingDate || ''} onChange={e => handleEditChange('bookingDate', e.target.value)} />
                  ) : (
                    <div style={{ fontSize: '0.875rem' }}>{new Date(selectedReservation.bookingDate).toLocaleDateString()}</div>
                  )}
                </div>
                <div>
                  <label style={labelStyle}>Amount ($)</label>
                  {activeModal === 'edit' ? (
                    <input type="number" step="0.01" style={selectStyle} value={editForm.amount || ''} onChange={e => handleEditChange('amount', e.target.value)} />
                  ) : (
                    <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>${selectedReservation.amount.toFixed(2)}</div>
                  )}
                </div>
                <div>
                  <label style={labelStyle}>Agent</label>
                  {activeModal === 'edit' ? (
                    <input type="text" style={selectStyle} value={editForm.agent || ''} onChange={e => handleEditChange('agent', e.target.value)} />
                  ) : (
                    <div style={{ fontSize: '0.875rem' }}>{selectedReservation.agent}</div>
                  )}
                </div>
                
                <div style={{ gridColumn: '1 / -1', marginTop: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#4b5563', fontWeight: 600, textTransform: 'uppercase' }}>Lifecycle Statuses</h4>
                </div>

                <div>
                  <label style={labelStyle}>Booking Status</label>
                  {activeModal === 'edit' ? (
                    <select style={selectStyle} value={editForm.bookingStatus || ''} onChange={e => handleEditChange('bookingStatus', e.target.value)}>
                      {bookingStatusOptions.filter(o => o !== 'All').map(o => <option key={o}>{o}</option>)}
                    </select>
                  ) : (
                    <div><span style={getBadgeStyle(selectedReservation.bookingStatus)}>{selectedReservation.bookingStatus}</span></div>
                  )}
                </div>
                <div>
                  <label style={labelStyle}>Payment Status</label>
                  {activeModal === 'edit' ? (
                    <select style={selectStyle} value={editForm.paymentStatus || ''} onChange={e => handleEditChange('paymentStatus', e.target.value)}>
                      {paymentStatusOptions.filter(o => o !== 'All').map(o => <option key={o}>{o}</option>)}
                    </select>
                  ) : (
                    <div><span style={getBadgeStyle(selectedReservation.paymentStatus)}>{selectedReservation.paymentStatus}</span></div>
                  )}
                </div>
                <div>
                  <label style={labelStyle}>Work Status</label>
                  {activeModal === 'edit' ? (
                    <select style={selectStyle} value={editForm.workStatus || ''} onChange={e => handleEditChange('workStatus', e.target.value)}>
                      {workStatusOptions.filter(o => o !== 'All').map(o => <option key={o}>{o}</option>)}
                    </select>
                  ) : (
                    <div><span style={getBadgeStyle(selectedReservation.workStatus)}>{selectedReservation.workStatus}</span></div>
                  )}
                </div>
                <div>
                  <label style={labelStyle}>SMS Status</label>
                  {activeModal === 'edit' ? (
                    <select style={selectStyle} value={editForm.smsStatus || ''} onChange={e => handleEditChange('smsStatus', e.target.value)}>
                      {smsStatusOptions.filter(o => o !== 'All').map(o => <option key={o}>{o}</option>)}
                    </select>
                  ) : (
                    <div><span style={getBadgeStyle(selectedReservation.smsStatus)}>{selectedReservation.smsStatus}</span></div>
                  )}
                </div>
                <div>
                  <label style={labelStyle}>Call Status</label>
                  {activeModal === 'edit' ? (
                    <select style={selectStyle} value={editForm.callStatus || ''} onChange={e => handleEditChange('callStatus', e.target.value)}>
                      {callStatusOptions.filter(o => o !== 'All').map(o => <option key={o}>{o}</option>)}
                    </select>
                  ) : (
                    <div><span style={getBadgeStyle(selectedReservation.callStatus)}>{selectedReservation.callStatus}</span></div>
                  )}
                </div>
                <div>
                  <label style={labelStyle}>CRM Audit Status</label>
                  {activeModal === 'edit' ? (
                    <select style={selectStyle} value={editForm.crmAuditStatus || ''} onChange={e => handleEditChange('crmAuditStatus', e.target.value)}>
                      {crmAuditOptions.filter(o => o !== 'All').map(o => <option key={o}>{o}</option>)}
                    </select>
                  ) : (
                    <div><span style={getBadgeStyle(selectedReservation.crmAuditStatus)}>{selectedReservation.crmAuditStatus}</span></div>
                  )}
                </div>
                <div>
                  <label style={labelStyle}>Quality Audit Status</label>
                  {activeModal === 'edit' ? (
                    <select style={selectStyle} value={editForm.qualityAuditStatus || ''} onChange={e => handleEditChange('qualityAuditStatus', e.target.value)}>
                      {qualityAuditOptions.filter(o => o !== 'All').map(o => <option key={o}>{o}</option>)}
                    </select>
                  ) : (
                    <div><span style={getBadgeStyle(selectedReservation.qualityAuditStatus)}>{selectedReservation.qualityAuditStatus}</span></div>
                  )}
                </div>
                <div>
                  <label style={labelStyle}>CB Status</label>
                  {activeModal === 'edit' ? (
                    <select style={selectStyle} value={editForm.cbStatus || ''} onChange={e => handleEditChange('cbStatus', e.target.value)}>
                      {cbStatusOptions.filter(o => o !== 'All').map(o => <option key={o}>{o}</option>)}
                    </select>
                  ) : (
                    <div><span style={getBadgeStyle(selectedReservation.cbStatus)}>{selectedReservation.cbStatus}</span></div>
                  )}
                </div>
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button 
                onClick={() => setActiveModal(null)}
                style={{ padding: '0.5rem 1.5rem', background: 'white', color: '#4b5563', border: '1px solid #d1d5db', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}
              >
                Close
              </button>
              {activeModal === 'edit' && (
                <button 
                  onClick={saveEditedReservation}
                  style={{ padding: '0.5rem 1.5rem', background: '#38b2ac', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Save Changes
                </button>
              )}
              {activeModal === 'charge' && (
                <button 
                  onClick={() => {
                    setActiveModal(null);
                    setShowSuccessModal(true);
                  }}
                  style={{ padding: '0.5rem 1.5rem', background: '#38b2ac', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Process Charge
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RetentionReports;
