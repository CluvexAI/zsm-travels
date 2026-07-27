import React, { useState } from 'react';
import { 
  AlertCircle, AlertOctagon, CheckCircle2, Clock, 
  Search, Filter, Download, Plus, MoreVertical, 
  X, Calendar, ChevronDown, CheckSquare, MessageCircle, XCircle, Users, Activity, ExternalLink, Paperclip, ChevronRight, Check
} from 'lucide-react';

const mockEscalations = [
  { id: 'ESC-00125', priority: 'Critical', status: 'In Progress', bookingRef: 'BK-10294', pnr: 'XKRT4P', passenger: 'John Smith', customerPhone: '+1 212-555-0141', customerEmail: 'john.smith@email.com', flight: 'AA 100', route: 'JFK → LAX', flightDate: '2026-08-15', type: 'Flight Cancellation', issue: 'Customer requesting urgent rebooking due to cancelled flight. Customer is requesting an urgent alternative flight and confirmation before departure.', vendor: 'American Airlines', assignedTo: 'Sarah Agent', createdOn: '2026-07-24T08:30:00', slaDue: '2026-07-24T09:30:00', slaStatus: 'Breached' },
  { id: 'ESC-00126', priority: 'High', status: 'Open', bookingRef: 'BK-10295', pnr: 'BMNW2L', passenger: 'Emily Johnson', customerPhone: '+1 312-555-0198', customerEmail: 'emily.johnson@email.com', flight: 'DL 455', route: 'ORD → MIA', flightDate: '2026-08-20', type: 'Payment Issue', issue: 'Card declined but booking shows confirmed', vendor: 'Delta Air Lines', assignedTo: 'Unassigned', createdOn: '2026-07-24T18:00:00', slaDue: '2026-07-24T22:00:00', slaStatus: 'Within SLA' },
  { id: 'ESC-00127', priority: 'Medium', status: 'Resolved', bookingRef: 'BK-10296', pnr: 'FDGT7Q', passenger: 'Robert Williams', customerPhone: '+1 415-555-0176', customerEmail: 'robert.williams@email.com', flight: 'UA 12', route: 'SFO → SEA', flightDate: '2026-08-10', type: 'Seat Assignment', issue: 'Paid seats not reflecting on vendor side', vendor: 'United Airlines', assignedTo: 'Mike Manager', createdOn: '2026-07-23T14:00:00', slaDue: '2026-07-24T14:00:00', slaStatus: 'Within SLA' },
  { id: 'ESC-00128', priority: 'Low', status: 'Acknowledged', bookingRef: 'BK-10297', pnr: 'PLRV9S', passenger: 'Maria Garcia', customerPhone: '+1 310-555-0134', customerEmail: 'maria.garcia@email.com', flight: 'B6 323', route: 'LAX → JFK', flightDate: '2026-09-01', type: 'Baggage', issue: 'Customer wants to add extra baggage post-ticketing', vendor: 'JetBlue Airways', assignedTo: 'Booking Team', createdOn: '2026-07-24T12:15:00', slaDue: '2026-07-25T12:15:00', slaStatus: 'Within SLA' },
  { id: 'ESC-00129', priority: 'Critical', status: 'Waiting for Vendor', bookingRef: 'BK-10298', pnr: 'HCNK3W', passenger: 'James Brown', customerPhone: '+1 214-555-0167', customerEmail: 'james.brown@email.com', flight: 'AA 98', route: 'DFW → ATL', flightDate: '2026-08-05', type: 'Ticketing Failure', issue: 'Ticket not issued 24hrs before flight', vendor: 'American Airlines', assignedTo: 'Ops Team', createdOn: '2026-07-24T14:30:00', slaDue: '2026-07-24T15:30:00', slaStatus: 'Near Breach' },
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

const EscalationReport = () => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'view', 'create', null
  const [selectedEscalation, setSelectedEscalation] = useState(null);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  
  // Create Escalation States
  const [createStep, setCreateStep] = useState(1);
  const [createData, setCreateData] = useState({
    bookingSearch: '',
    selectedBooking: null,
    escalationType: '',
    priority: 'Medium',
    issue: '',
    description: '',
    assignedTo: ''
  });
  const [attachedFile, setAttachedFile] = useState(null);
  const [successToast, setSuccessToast] = useState(null);

  // Table Data State
  const [escalations, setEscalations] = useState(mockEscalations);

  const filteredEscalations = escalations.filter(esc => {
    const matchesSearch = searchQuery === '' || 
      esc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (esc.bookingRef && esc.bookingRef.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (esc.pnr && esc.pnr.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (esc.passenger && esc.passenger.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (esc.customerPhone && esc.customerPhone.includes(searchQuery));
    
    const matchesStatus = statusFilter === 'All Statuses' || 
      esc.status === statusFilter || 
      esc.type === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'Critical': return { bg: '#fee2e2', color: '#b91c1c' };
      case 'High': return { bg: '#ffedd5', color: '#c2410c' };
      case 'Medium': return { bg: '#fef3c7', color: '#b45309' };
      case 'Low': return { bg: '#e0f2fe', color: '#0369a1' };
      default: return { bg: '#f3f4f6', color: '#374151' };
    }
  };

  const getSlaStyle = (status) => {
    switch (status) {
      case 'Breached': return { bg: '#fee2e2', color: '#b91c1c' };
      case 'Near Breach': return { bg: '#fef3c7', color: '#b45309' };
      case 'Within SLA': return { bg: '#d1fae5', color: '#047857' };
      default: return { bg: '#f3f4f6', color: '#374151' };
    }
  };

  const handleCreateSubmit = () => {
    // Generate new ID and append to mock list
    const newId = `ESC-00${130 + escalations.length}`;
    const newEsc = {
      id: newId,
      priority: createData.priority,
      status: 'Open',
      bookingRef: createData.selectedBooking ? 'BK-88888' : 'N/A',
      pnr: createData.selectedBooking ? 'NWPNR1' : 'N/A',
      passenger: createData.selectedBooking ? 'Test Passenger' : 'N/A',
      customerPhone: '+1 000-000-0000',
      customerEmail: 'test@email.com',
      flight: 'TEST 100',
      route: 'TEST → TEST',
      flightDate: '2026-10-10',
      type: createData.escalationType,
      issue: createData.issue,
      vendor: 'Test Airline',
      assignedTo: createData.assignedTo,
      createdOn: new Date().toISOString(),
      slaDue: new Date(new Date().getTime() + 4*3600*1000).toISOString(),
      slaStatus: 'Within SLA'
    };
    
    setEscalations([newEsc, ...escalations]);
    setActiveModal(null);
    setCreateStep(1);
    setCreateData({ bookingSearch: '', selectedBooking: null, escalationType: '', priority: 'Medium', issue: '', description: '', assignedTo: '' });
    
    // Show success toast
    setSuccessToast(`Escalation ${newId} created successfully and assigned to ${createData.assignedTo}.`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const exportToExcel = () => {
    if (escalations.length === 0) {
      alert("No data to export.");
      return;
    }
    const headers = ['Escalation ID', 'Priority', 'Status', 'Booking Ref', 'PNR', 'Passenger', 'Customer Phone', 'Customer Email', 'Flight', 'Route', 'Flight Date', 'Escalation Type', 'Issue', 'Vendor', 'Assigned To', 'Created On', 'SLA Due', 'SLA Status'];
    
    const escapeCsv = (str) => {
      if (str == null) return '';
      const stringified = String(str);
      if (stringified.includes(',') || stringified.includes('"') || stringified.includes('\n')) {
        return `"${stringified.replace(/"/g, '""')}"`;
      }
      return stringified;
    };

    const csvRows = [headers.join(',')];
    
    escalations.forEach(esc => {
      const rowData = [
        esc.id, esc.priority, esc.status, esc.bookingRef, esc.pnr, esc.passenger, esc.customerPhone, esc.customerEmail, esc.flight, esc.route, esc.flightDate, esc.type, esc.issue, esc.vendor, esc.assignedTo, esc.createdOn, esc.slaDue, esc.slaStatus
      ];
      csvRows.push(rowData.map(escapeCsv).join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Flight_Escalation_Report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-container" style={{ position: 'relative', overflowX: 'hidden' }}>
      <style dangerouslySetInnerHTML={{__html: `
        .dashboard-card { background: white; border-radius: 8px; border: 1px solid #e5e7eb; padding: 1.25rem; display: flex; flex-direction: column; cursor: pointer; transition: all 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
        .dashboard-card:hover { transform: translateY(-2px); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); }
        .dashboard-card-title { font-size: 0.875rem; font-weight: 600; color: #6b7280; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
        .dashboard-card-value { font-size: 2rem; font-weight: 800; color: #111827; }
        
        .filter-input { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 4px; font-size: 0.875rem; outline: none; background: white; }
        .filter-label { display: block; font-size: 0.75rem; font-weight: 700; color: #4b5563; text-transform: uppercase; margin-bottom: 0.35rem; }
        
        .esc-table th { padding: 0.75rem 1rem; text-align: left; font-size: 0.75rem; font-weight: 700; color: #6b7280; text-transform: uppercase; background: #f9fafb; border-bottom: 2px solid #e5e7eb; white-space: nowrap; }
        .esc-table td { padding: 0.75rem 1rem; font-size: 0.875rem; color: #374151; border-bottom: 1px solid #f3f4f6; white-space: nowrap; }
        .esc-table tr:hover { background-color: #f8fafc; }
        
        .badge { display: inline-block; padding: 0.25rem 0.6rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
        
        .drawer-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1000; transition: opacity 0.3s; }
        .drawer-content { position: fixed; top: 0; right: 0; bottom: 0; width: 800px; max-width: 100vw; background: white; z-index: 1001; box-shadow: -4px 0 15px rgba(0,0,0,0.1); transform: translateX(100%); animation: slideIn 0.3s forwards ease-out; display: flex; flex-direction: column; }
        @keyframes slideIn { to { transform: translateX(0); } }
        
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-content { background: white; padding: 2rem; border-radius: 8px; width: 100%; max-width: 600px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); animation: slideUpModal 0.3s ease-out; }
        @keyframes slideUpModal { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        
        .section-box { border: 1px solid #e5e7eb; border-radius: 6px; padding: 1.25rem; margin-bottom: 1.5rem; background: #fff; }
        .section-title { font-size: 1rem; font-weight: 700; color: #1f2937; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid #f3f4f6; }
      `}} />

      {/* Success Toast */}
      {successToast && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: '#065f46', color: 'white', padding: '1rem 1.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', zIndex: 9999, animation: 'slideUpModal 0.3s' }}>
          <CheckCircle2 size={20} />
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{successToast}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1f2937', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertCircle size={28} color="#ef4444" />
            Flight Escalation Report
          </h1>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '1rem' }}>Monitor, assign, track, and resolve escalated flight booking cases.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            onClick={() => setFilterOpen(!filterOpen)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', background: filterOpen ? '#f3f4f6' : 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}
          >
            <Filter size={16} /> Filter
          </button>
          <button onClick={exportToExcel} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', background: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
            <Download size={16} /> Export Report
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', background: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
            Refresh
          </button>
          <button 
            onClick={() => { setCreateStep(1); setActiveModal('create'); }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', boxShadow: '0 1px 2px rgba(239, 68, 68, 0.2)' }}
          >
            <Plus size={16} /> Create Escalation
          </button>
        </div>
      </div>

      {/* Summary Dashboard Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="dashboard-card" style={{ borderTop: '3px solid #ef4444' }}>
          <div className="dashboard-card-title"><AlertOctagon size={16} color="#ef4444" /> Critical</div>
          <div className="dashboard-card-value">2</div>
        </div>
        <div className="dashboard-card" style={{ borderTop: '3px solid #f97316' }}>
          <div className="dashboard-card-title"><AlertCircle size={16} color="#f97316" /> High Priority</div>
          <div className="dashboard-card-value">5</div>
        </div>
        <div className="dashboard-card" style={{ borderTop: '3px solid #eab308' }}>
          <div className="dashboard-card-title"><Clock size={16} color="#eab308" /> Pending</div>
          <div className="dashboard-card-value">12</div>
        </div>
        <div className="dashboard-card" style={{ borderTop: '3px solid #3b82f6' }}>
          <div className="dashboard-card-title"><Activity size={16} color="#3b82f6" /> In Progress</div>
          <div className="dashboard-card-value">8</div>
        </div>
        <div className="dashboard-card" style={{ borderTop: '3px solid #10b981' }}>
          <div className="dashboard-card-title"><CheckCircle2 size={16} color="#10b981" /> Resolved Today</div>
          <div className="dashboard-card-value">15</div>
        </div>
        <div className="dashboard-card" style={{ borderTop: '3px solid #b91c1c' }}>
          <div className="dashboard-card-title"><XCircle size={16} color="#b91c1c" /> SLA Breached</div>
          <div className="dashboard-card-value">3</div>
        </div>
      </div>

      {/* Advanced Filter Section */}
      {filterOpen && (
        <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem 0', color: '#1f2937' }}>Advanced Search & Filter</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label className="filter-label">Search</label>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input 
                  type="text" 
                  className="filter-input" 
                  placeholder="Booking, PNR, Name, Phone..." 
                  style={{ paddingLeft: '2rem' }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="filter-label">Date Range</label>
              <select className="filter-input">
                <option>Today</option>
                <option>Yesterday</option>
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>Custom Date</option>
              </select>
            </div>
            <div>
              <label className="filter-label">Escalation Status</label>
              <select 
                className="filter-input"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option>All Statuses</option>
                <option>Open</option>
                <option>Acknowledged</option>
                <option>In Progress</option>
                <option>Waiting for Customer</option>
                <option>Waiting for Vendor</option>
                <option>Resolved</option>
                <option>Closed</option>
                <option>Flight Cancellation</option>
                <option>Payment Issue</option>
                <option>Seat Assignment</option>
                <option>Baggage</option>
                <option>Ticketing Failure</option>
                <option>cancellation for refund</option>
                <option>cancellation for credit</option>
                <option>seat assign</option>
                <option>add insurance</option>
                <option>seat upgrade</option>
              </select>
            </div>
            <div>
              <label className="filter-label">Priority</label>
              <select className="filter-input">
                <option>All Priorities</option>
                <option>Critical</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
            <div>
              <label className="filter-label">Escalation Type</label>
              <select className="filter-input">
                <option>All Types</option>
                <option>Flight Cancellation</option>
                <option>Payment Issue</option>
                <option>Ticketing Failure</option>
                <option>Schedule Change</option>
                <option>Other</option>
              </select>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label className="filter-label">Assigned To</label>
              <select className="filter-input">
                <option>All Agents</option>
                <option>Sales Agent</option>
                <option>Booking Team</option>
                <option>Operations Team</option>
                <option>Manager</option>
              </select>
            </div>
            <div>
              <label className="filter-label">Vendor</label>
              <select className="filter-input">
                <option>All Vendors</option>
                <option>American Airlines</option>
                <option>Delta Air Lines</option>
                <option>United Airlines</option>
                <option>JetBlue Airways</option>
              </select>
            </div>
            <div>
              <label className="filter-label">Flight Date</label>
              <select className="filter-input">
                <option>All Dates</option>
                <option>Upcoming</option>
                <option>Today</option>
                <option>Past</option>
              </select>
            </div>
            <div>
              <label className="filter-label">SLA</label>
              <select className="filter-input">
                <option>All</option>
                <option>Within SLA</option>
                <option>Near SLA Breach</option>
                <option>SLA Breached</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
             <button 
               onClick={() => {
                 setSearchQuery('');
                 setStatusFilter('All Statuses');
               }}
               style={{ padding: '0.5rem 1rem', background: 'white', border: '1px solid #d1d5db', borderRadius: '4px', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', color: '#374151' }}
             >
               Reset
             </button>
             <button 
               onClick={() => setFilterOpen(false)}
               style={{ padding: '0.5rem 1.5rem', background: '#2563eb', border: 'none', borderRadius: '4px', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', color: 'white' }}
             >
               Apply Filters
             </button>
          </div>
        </div>
      )}

      {/* Top-level Search and Status Filter */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input 
            type="text" 
            placeholder="Search by name, email, phone, or ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.875rem', outline: 'none', background: 'white', color: '#374151' }}
          />
        </div>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '0.75rem 2.5rem 0.75rem 1rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.875rem', outline: 'none', background: 'white', color: '#374151', minWidth: '180px', cursor: 'pointer', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%234B5563%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}
        >
          <option>All Statuses</option>
          <option>Open</option>
          <option>Acknowledged</option>
          <option>In Progress</option>
          <option>Waiting for Customer</option>
          <option>Waiting for Vendor</option>
          <option>Resolved</option>
          <option>Closed</option>
          <option>Flight Cancellation</option>
          <option>Payment Issue</option>
          <option>Seat Assignment</option>
          <option>Baggage</option>
          <option>Ticketing Failure</option>
          <option>cancellation for refund</option>
          <option>cancellation for credit</option>
          <option>seat assign</option>
          <option>add insurance</option>
          <option>seat upgrade</option>
        </select>
      </div>

      {/* Escalation Table */}
      <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', overflowX: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <table className="esc-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Escalation ID</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Booking Ref</th>
              <th>PNR</th>
              <th>Passenger</th>
              <th>Flight</th>
              <th>Route</th>
              <th>Flight Date</th>
              <th>Escalation Type</th>
              <th>Issue</th>
              <th>Vendor</th>
              <th>Assigned To</th>
              <th>Created On</th>
              <th>SLA Due</th>
              <th>SLA Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredEscalations.map((esc) => (
              <tr key={esc.id}>
                <td style={{ fontWeight: 700, color: '#2563eb' }}>{esc.id}</td>
                <td><span className="badge" style={getPriorityStyle(esc.priority)}>{esc.priority}</span></td>
                <td>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #e5e7eb', background: '#f9fafb' }}>
                    {esc.status}
                  </span>
                </td>
                <td style={{ fontWeight: 600 }}>{esc.bookingRef}</td>
                <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{esc.pnr}</td>
                <td style={{ fontWeight: 600 }}>{esc.passenger}</td>
                <td style={{ fontFamily: 'monospace' }}>{esc.flight}</td>
                <td>{esc.route}</td>
                <td>{esc.flightDate}</td>
                <td style={{ fontWeight: 500 }}>{esc.type}</td>
                <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={esc.issue}>{esc.issue}</td>
                <td>{esc.vendor}</td>
                <td style={{ fontWeight: 500, color: '#4b5563' }}>{esc.assignedTo}</td>
                <td>{new Date(esc.createdOn).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                <td>{new Date(esc.slaDue).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                <td><span className="badge" style={getSlaStyle(esc.slaStatus)}>{esc.slaStatus}</span></td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button 
                      onClick={() => { setSelectedEscalation(esc); setActiveModal('view'); }}
                      style={{ padding: '0.35rem 0.75rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      View
                    </button>
                    <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '0.25rem' }}>
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Drawer */}
      {activeModal === 'view' && selectedEscalation && (
        <>
          <div className="drawer-overlay" onClick={() => setActiveModal(null)} />
          <div className="drawer-content">
            {/* Header */}
            <div style={{ background: '#f8fafc', padding: '1.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                  <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#111827' }}>{selectedEscalation.id}</h2>
                  <span className="badge" style={getPriorityStyle(selectedEscalation.priority)}>{selectedEscalation.priority} Priority</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, padding: '0.25rem 0.75rem', background: 'white', border: '1px solid #d1d5db', borderRadius: '9999px' }}>{selectedEscalation.status}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', color: '#4b5563', fontSize: '0.875rem', fontWeight: 500 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Clock size={14} /> SLA: <span className="badge" style={getSlaStyle(selectedEscalation.slaStatus)}>{selectedEscalation.slaStatus}</span>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Users size={14} /> Assigned To: <strong style={{ color: '#111827' }}>{selectedEscalation.assignedTo}</strong>
                  </span>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} style={{ background: 'white', border: '1px solid #d1d5db', borderRadius: '4px', padding: '0.5rem', cursor: 'pointer', display: 'flex' }}>
                <X size={18} color="#4b5563" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', background: '#f9fafb' }}>
              
              {/* Section A - Booking Info */}
              <div className="section-box">
                <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  Booking Information
                  <button style={{ fontSize: '0.75rem', fontWeight: 600, background: '#ede9fe', color: '#6d28d9', border: 'none', padding: '0.25rem 0.75rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    View Full Booking <ExternalLink size={12} />
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', fontSize: '0.875rem' }}>
                  <div><strong style={{ display: 'block', color: '#6b7280', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Booking Ref</strong> {selectedEscalation.bookingRef}</div>
                  <div><strong style={{ display: 'block', color: '#6b7280', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>PNR</strong> <span style={{ fontFamily: 'monospace' }}>{selectedEscalation.pnr}</span></div>
                  <div><strong style={{ display: 'block', color: '#6b7280', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Passenger Name</strong> {selectedEscalation.passenger}</div>
                  <div><strong style={{ display: 'block', color: '#6b7280', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Customer Phone</strong> {selectedEscalation.customerPhone}</div>
                  <div><strong style={{ display: 'block', color: '#6b7280', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Customer Email</strong> {selectedEscalation.customerEmail}</div>
                </div>
              </div>

              {/* Section B - Flight Info */}
              <div className="section-box">
                <div className="section-title">Flight Information</div>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '6px' }}>
                  <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ padding: '0.15rem 0.5rem', background: '#3b82f6', color: 'white', borderRadius: '4px', fontSize: '0.75rem' }}>Outbound</span>
                    {selectedEscalation.flight} ({selectedEscalation.vendor})
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '0.25rem', fontWeight: 600 }}>{selectedEscalation.route.replace('→', ' → ')}</div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Departure: {new Date(selectedEscalation.flightDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</div>
                </div>
              </div>

              {/* Section C - Escalation Info */}
              <div className="section-box">
                <div className="section-title">Escalation Information</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', fontSize: '0.875rem' }}>
                  <div><strong style={{ display: 'block', color: '#6b7280', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Escalation Type</strong> {selectedEscalation.type}</div>
                  <div><strong style={{ display: 'block', color: '#6b7280', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Created Date</strong> {new Date(selectedEscalation.createdOn).toLocaleString()}</div>
                  <div><strong style={{ display: 'block', color: '#6b7280', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>SLA Due Date</strong> {new Date(selectedEscalation.slaDue).toLocaleString()}</div>
                  <div style={{ gridColumn: 'span 3' }}>
                    <strong style={{ display: 'block', color: '#6b7280', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Issue Description</strong>
                    <div style={{ background: '#fef2f2', color: '#991b1b', padding: '1rem', borderRadius: '6px', border: '1px solid #fecaca', fontSize: '0.9rem', lineHeight: 1.5 }}>
                      {selectedEscalation.issue}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section E - Resolution Timeline */}
              <div className="section-box">
                <div className="section-title">Resolution Timeline</div>
                <div style={{ position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid #e5e7eb', marginLeft: '0.5rem' }}>
                  <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                    <div style={{ position: 'absolute', left: '-1.85rem', top: '0.25rem', width: '0.75rem', height: '0.75rem', borderRadius: '50%', background: '#3b82f6', border: '2px solid white' }}></div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', marginBottom: '0.25rem' }}>10:15 AM — Escalation Created</div>
                    <div style={{ fontSize: '0.875rem', color: '#374151' }}>Created by Sales Agent.</div>
                  </div>
                  <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                    <div style={{ position: 'absolute', left: '-1.85rem', top: '0.25rem', width: '0.75rem', height: '0.75rem', borderRadius: '50%', background: '#f59e0b', border: '2px solid white' }}></div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', marginBottom: '0.25rem' }}>10:30 AM — Assigned</div>
                    <div style={{ fontSize: '0.875rem', color: '#374151' }}>Assigned to Flight Operations Team.</div>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '-1.85rem', top: '0.25rem', width: '0.75rem', height: '0.75rem', borderRadius: '50%', background: '#e5e7eb', border: '2px solid white' }}></div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', marginBottom: '0.25rem' }}>Current Status</div>
                    <div style={{ fontSize: '0.875rem', color: '#374151' }}>Waiting for resolution.</div>
                  </div>
                </div>
              </div>

              {/* Section F - Internal Notes */}
              <div className="section-box">
                <div className="section-title">Internal Notes</div>
                <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Date & Time:</span>
                  <input 
                    type="text" 
                    value={getStrictPST()} 
                    readOnly 
                    style={{ flex: 1, padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#f1f5f9', color: '#64748b', fontSize: '0.875rem', outline: 'none', cursor: 'not-allowed' }}
                  />
                </div>
                <textarea 
                  rows={3} 
                  placeholder="Write an internal note..."
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem', outline: 'none', marginBottom: '0.75rem', resize: 'vertical' }}
                />
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <input 
                    type="file" 
                    id="internal-file-upload" 
                    style={{ display: 'none' }} 
                    onChange={(e) => setAttachedFile(e.target.files[0])} 
                  />
                  {attachedFile && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f1f5f9', padding: '0.35rem 0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.75rem', color: '#475569', fontWeight: 600 }}>
                      <Paperclip size={12} /> {attachedFile.name}
                      <button onClick={() => setAttachedFile(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', color: '#ef4444', marginLeft: '0.25rem', padding: 0 }}><X size={14} /></button>
                    </div>
                  )}
                  <button onClick={() => document.getElementById('internal-file-upload').click()} style={{ padding: '0.5rem 1rem', background: 'white', border: '1px solid #d1d5db', borderRadius: '4px', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Paperclip size={14} /> {attachedFile ? 'Change File' : 'Attach File'}
                  </button>
                  <button onClick={() => {
                    // Logic to handle saving note and file
                    setAttachedFile(null);
                    setSuccessToast('Internal note and file saved successfully.');
                    setTimeout(() => setSuccessToast(null), 3000);
                  }} style={{ padding: '0.5rem 1.5rem', background: '#111827', border: 'none', borderRadius: '4px', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', color: 'white' }}>
                    Add Note
                  </button>
                </div>
              </div>

            </div>
          </div>
        </>
      )}

      {/* Create Modal Wizard */}
      {activeModal === 'create' && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1f2937' }}>Create Escalation</h3>
              <button onClick={() => setActiveModal(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="#6b7280" />
              </button>
            </div>

            {/* Stepper */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', alignItems: 'center' }}>
               <div style={{ flex: 1, padding: '0.5rem', background: createStep >= 1 ? '#ef4444' : '#f3f4f6', color: createStep >= 1 ? 'white' : '#9ca3af', borderRadius: '4px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700 }}>1. Select Booking</div>
               <ChevronRight size={16} color="#9ca3af" />
               <div style={{ flex: 1, padding: '0.5rem', background: createStep >= 2 ? '#ef4444' : '#f3f4f6', color: createStep >= 2 ? 'white' : '#9ca3af', borderRadius: '4px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700 }}>2. Details</div>
               <ChevronRight size={16} color="#9ca3af" />
               <div style={{ flex: 1, padding: '0.5rem', background: createStep >= 3 ? '#ef4444' : '#f3f4f6', color: createStep >= 3 ? 'white' : '#9ca3af', borderRadius: '4px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700 }}>3. Confirm</div>
            </div>

            {createStep === 1 && (
              <div>
                <label className="filter-label">Search Booking Ref / PNR / Passenger / Phone</label>
                <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                  <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                  <input 
                    type="text" 
                    className="filter-input" 
                    placeholder="Enter details..." 
                    style={{ paddingLeft: '2.25rem', padding: '0.75rem 0.75rem 0.75rem 2.25rem' }} 
                    value={createData.bookingSearch}
                    onChange={(e) => setCreateData({...createData, bookingSearch: e.target.value})}
                  />
                </div>
                
                {createData.bookingSearch.length > 2 && !createData.selectedBooking && (
                  <div style={{ border: '1px solid #e5e7eb', borderRadius: '6px', marginBottom: '1.5rem' }}>
                    <div 
                      onClick={() => setCreateData({...createData, selectedBooking: 'BK-88888'})}
                      style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, color: '#1f2937' }}>BK-88888 / NWPNR1</div>
                        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Test Passenger • TEST 100 • Oct 10, 2026</div>
                      </div>
                      <button style={{ padding: '0.25rem 0.75rem', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Select</button>
                    </div>
                  </div>
                )}
                
                {createData.selectedBooking && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <CheckCircle2 color="#16a34a" size={20} style={{ marginTop: '0.1rem' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: '#166534', marginBottom: '0.25rem' }}>Booking Selected</div>
                      <div style={{ fontSize: '0.875rem', color: '#15803d' }}><strong>Ref:</strong> {createData.selectedBooking} | <strong>Passenger:</strong> Test Passenger</div>
                    </div>
                    <button onClick={() => setCreateData({...createData, selectedBooking: null})} style={{ background: 'transparent', border: 'none', color: '#16a34a', cursor: 'pointer' }}><X size={16} /></button>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button 
                    disabled={!createData.selectedBooking}
                    onClick={() => setCreateStep(2)} 
                    style={{ padding: '0.6rem 1.5rem', background: createData.selectedBooking ? '#ef4444' : '#fca5a5', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: createData.selectedBooking ? 'pointer' : 'not-allowed' }}
                  >
                    Next Step
                  </button>
                </div>
              </div>
            )}

            {createStep === 2 && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label className="filter-label">Escalation Type *</label>
                    <select className="filter-input" value={createData.escalationType} onChange={(e) => setCreateData({...createData, escalationType: e.target.value})}>
                      <option value="">Select Type...</option>
                      <option>Flight Cancellation</option>
                      <option>Ticketing Failure</option>
                      <option>Payment Issue</option>
                      <option>Customer Complaint</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="filter-label">Priority *</label>
                    <select className="filter-input" value={createData.priority} onChange={(e) => setCreateData({...createData, priority: e.target.value})}>
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                      <option>Critical</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label className="filter-label">Issue / Reason *</label>
                  <input type="text" className="filter-input" placeholder="Short summary of issue..." value={createData.issue} onChange={(e) => setCreateData({...createData, issue: e.target.value})} />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label className="filter-label">Description *</label>
                  <textarea className="filter-input" rows={4} placeholder="Detailed description..." value={createData.description} onChange={(e) => setCreateData({...createData, description: e.target.value})}></textarea>
                </div>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="filter-label">Assign To *</label>
                  <select className="filter-input" value={createData.assignedTo} onChange={(e) => setCreateData({...createData, assignedTo: e.target.value})}>
                    <option value="">Select Team/Agent...</option>
                    <option>Booking Team</option>
                    <option>Operations Team</option>
                    <option>Manager</option>
                    <option>Sarah Agent</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button onClick={() => setCreateStep(1)} style={{ padding: '0.6rem 1.5rem', background: 'white', color: '#4b5563', border: '1px solid #d1d5db', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}>Back</button>
                  <button 
                    disabled={!createData.escalationType || !createData.issue || !createData.assignedTo}
                    onClick={() => setCreateStep(3)} 
                    style={{ padding: '0.6rem 1.5rem', background: (!createData.escalationType || !createData.issue || !createData.assignedTo) ? '#fca5a5' : '#ef4444', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: (!createData.escalationType || !createData.issue || !createData.assignedTo) ? 'not-allowed' : 'pointer' }}
                  >
                    Next Step
                  </button>
                </div>
              </div>
            )}

            {createStep === 3 && (
              <div style={{ textAlign: 'center', padding: '1rem 0 2rem' }}>
                <AlertOctagon size={48} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
                <h4 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#1f2937' }}>Confirm Escalation Creation</h4>
                <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Are you sure you want to create this escalation and assign it to <strong>{createData.assignedTo}</strong>? An SLA deadline will be automatically generated.</p>
                
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button onClick={() => setCreateStep(2)} style={{ padding: '0.75rem 2rem', background: 'white', color: '#4b5563', border: '1px solid #d1d5db', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>Back</button>
                  <button onClick={handleCreateSubmit} style={{ padding: '0.75rem 2rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.3)' }}>
                    <Check size={18} /> Create Escalation
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default EscalationReport;
