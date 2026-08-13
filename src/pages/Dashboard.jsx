import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import { Bell } from 'lucide-react';
import { usePermissions } from '../hooks/usePermissions';
import { fetchLeads, fetchBookings } from '../services/supabase';

const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

const getKpiData = (canViewActualCost, metrics) => {
  const data = [
    { title: 'Total MCO', value: formatCurrency(metrics.totalMCO) },
    { title: 'Total Charged', value: formatCurrency(metrics.totalCharged) },
    { title: 'Total Chargeback', value: formatCurrency(metrics.totalChargeback) },
    { title: 'Total Cancelled', value: String(metrics.totalCancelled) },
    { title: 'Total Refund', value: formatCurrency(metrics.totalRefund) },
    { title: 'Total Partial Refund', value: formatCurrency(metrics.totalPartialRefund) },
  ];

  if (canViewActualCost) {
    data.push({ title: 'Actual Airline Cost', value: formatCurrency(metrics.actualCost) });
  }
  return data;
};

const chartData = [
  { month: 'Jan', value: 120000 },
  { month: 'Feb', value: 230000 },
  { month: 'Mar', value: 420000 },
  { month: 'Apr', value: 560000 },
  { month: 'May', value: 640000 },
  { month: 'Jun', value: 580000 },
  { month: 'Jul', value: 600000 },
  { month: 'Aug', value: 575000 },
  { month: 'Sep', value: 620000 },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const [filters, setFilters] = useState({
    cxId: '', bookingId: '', pnr: '', customerName: '', cxPhone: '', customerEmail: '',
    agent: '', altPhone: '', passengerName: '', fromDate: '', toDate: '', status: ''
  });
  const [recentLeads, setRecentLeads] = useState([]);
  const [metrics, setMetrics] = useState({
    totalMCO: 0,
    totalCharged: 0,
    totalChargeback: 0,
    totalCancelled: 0,
    totalRefund: 0,
    totalPartialRefund: 0,
    actualCost: 0
  });

  const canViewActualCost = hasPermission('Actual Cost', 'View');
  const canViewReports    = hasPermission('Reports', 'View');
  const canViewPayments   = hasPermission('Payments', 'View');
  const kpiData = getKpiData(canViewActualCost, metrics);

  useEffect(() => {
    const loadData = async () => {
      const [savedLeads, savedBookings] = await Promise.all([
        fetchLeads(),
        fetchBookings()
      ]);
      
      if (savedLeads) {
        savedLeads.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentLeads(savedLeads.slice(0, 5));
      }

      if (savedBookings) {
        let mco = 0;
        let charged = 0;
        let chargeback = 0;
        let cancelled = 0;
        let refund = 0;
        let partialRefund = 0;
        let cost = 0;

        savedBookings.forEach(b => {
          const amt = parseFloat(String(b.amount || '0').replace(/[^0-9.-]+/g,"")) || 0;
          
          if (b.status === 'Cancelled') {
            cancelled++;
          } else if (b.status === 'Refunded') {
            refund += amt;
          } else if (b.status === 'Partial Refund') {
            partialRefund += amt;
          } else {
            charged += amt;
          }

          if (b.cbStatus === 'Chargeback') {
            chargeback += amt;
          }

          mco += parseFloat(b.customActualMCO || b.actualMCO || b.mco || 0);
          cost += parseFloat(b.customActualCost || b.actualCost || b.airlineCost || 0);
        });

        setMetrics({
          totalMCO: mco,
          totalCharged: charged,
          totalChargeback: chargeback,
          totalCancelled: cancelled,
          totalRefund: refund,
          totalPartialRefund: partialRefund,
          actualCost: cost
        });
      }
    };
    loadData();
  }, []);

  const handleSearch = (e) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    navigate(`/search?${params.toString()}`);
  };

  const handleClear = () => {
    setFilters({
      cxId: '', bookingId: '', pnr: '', customerName: '', cxPhone: '', customerEmail: '',
      agent: '', altPhone: '', passengerName: '', fromDate: '', toDate: '', status: ''
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="page-container">
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
        {/* KPI Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '1.5rem', 
          marginBottom: '2rem' 
        }}>
          {kpiData.map((kpi, idx) => (
            <div key={idx} className="metric-card">
              <div>
                <div className="value">{kpi.value}</div>
                <div className="label">{kpi.title}</div>
              </div>
              <div className="icon">
                <Bell size={24} color="#f0f2f5" />
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section — only for roles with Payments or Reports access */}
        {(canViewPayments || canViewReports) && (
          <div className="card" style={{ height: '500px', backgroundColor: 'white' }}>
            <div className="card-header" style={{ marginBottom: '2rem' }}>
              <h2 className="card-title" style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Total MCO in 2026</h2>
            </div>
            
            <div style={{ height: '400px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="month" stroke="#a0aec0" tickLine={false} axisLine={false} />
                  <YAxis stroke="#a0aec0" tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                  <RechartsTooltip 
                    formatter={(value) => `$${value.toLocaleString()}`}
                    cursor={{fill: '#f4f5f7'}}
                    contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '0.25rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="value" fill="#4ade80" barSize={30} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Recent Leads Widget — only for roles with Reports:View */}
        {canViewReports && (
          <div className="card" style={{ marginTop: '2rem', backgroundColor: 'white' }}>
            <div className="card-header" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="card-title" style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Recent Leads</h2>
              <button 
                onClick={() => navigate('/reports/leads')} 
                style={{ padding: '6px 12px', fontSize: '0.875rem', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 500, color: '#334155' }}>
                View All
              </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Date</th>
                    <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Client</th>
                    <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Type</th>
                    <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLeads.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No recent leads found.</td>
                    </tr>
                  ) : (
                    recentLeads.map(lead => (
                      <tr key={lead.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '12px 16px', fontSize: '13px', color: '#334155' }}>{new Date(lead.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: '12px 16px', fontSize: '13px', color: '#0f172a', fontWeight: '500' }}>{lead.fullName || 'Unknown'}</td>
                        <td style={{ padding: '12px 16px', fontSize: '13px', color: '#334155' }}>{lead.leadType}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '500', backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
                            {lead.leadStatus || 'New'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
