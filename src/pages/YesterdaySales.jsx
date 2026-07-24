import React, { useState, useMemo } from 'react';
import { Search, DollarSign, Calendar, FileText, User, CreditCard, ArrowUpRight, Filter } from 'lucide-react';

const getStrictPST = () => {
  const d = new Date();
  const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
  return new Date(utc - (3600000 * 8)); // UTC-8 explicitly for PST
};

const getYesterdayPST = () => {
  const pst = getStrictPST();
  pst.setDate(pst.getDate() - 1);
  return pst;
};

// Generate mock data explicitly bound to yesterday's PST date
const generateYesterdayData = () => {
  const yesterday = getYesterdayPST();
  
  return [
    { id: 'TRX-1001', pnr: 'ABC123', customer: 'John Smith', service: 'Flight Booking', amount: 850.00, method: 'Visa ending 4242', time: '09:15', status: 'Completed', agent: 'Sarah Jenkins' },
    { id: 'TRX-1002', pnr: 'XYZ987', customer: 'Emily Chen', service: 'UMNR Service', amount: 150.00, method: 'Mastercard ending 8812', time: '10:30', status: 'Completed', agent: 'Mike Ross' },
    { id: 'TRX-1003', pnr: 'DEF456', customer: 'Robert Taylor', service: 'Seat Upgrade', amount: 75.00, method: 'Amex ending 1005', time: '11:45', status: 'Completed', agent: 'Sarah Jenkins' },
    { id: 'TRX-1004', pnr: 'GHI789', customer: 'Amanda Lee', service: 'Pet Service', amount: 125.00, method: 'Visa ending 5555', time: '14:20', status: 'Completed', agent: 'David Kim' },
    { id: 'TRX-1005', pnr: 'JKL012', customer: 'Michael Brown', service: 'Flight Booking', amount: 1200.00, method: 'Discover ending 3344', time: '15:10', status: 'Completed', agent: 'Mike Ross' },
    { id: 'TRX-1006', pnr: 'MNO345', customer: 'Sarah Connor', service: 'Add Baggage', amount: 50.00, method: 'Visa ending 9991', time: '16:05', status: 'Completed', agent: 'Sarah Jenkins' },
    { id: 'TRX-1007', pnr: 'PQR678', customer: 'James Wilson', service: 'Flight Booking', amount: 940.00, method: 'Mastercard ending 2211', time: '17:30', status: 'Completed', agent: 'David Kim' },
  ].map(trx => {
    // Attach yesterday's explicitly calculated PST date to each transaction
    const dateStr = yesterday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return { ...trx, date: dateStr };
  });
};

const YesterdaySales = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceFilter, setServiceFilter] = useState('All');
  
  const salesData = useMemo(() => generateYesterdayData(), []);
  
  const filteredData = salesData.filter(trx => {
    const matchesSearch = trx.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          trx.pnr.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          trx.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesService = serviceFilter === 'All' || trx.service === serviceFilter;
    return matchesSearch && matchesService;
  });

  const totalSales = filteredData.reduce((sum, trx) => sum + trx.amount, 0);

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Yesterday Sales
          </h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={14} /> Showing confirmed payments for {getYesterdayPST().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} (PST)
          </p>
        </div>
        <button style={{ padding: '8px 16px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', fontWeight: '600', color: '#0f172a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <FileText size={16} /> Export CSV
        </button>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ color: '#64748b', margin: '0 0 4px 0', fontSize: '13px', fontWeight: '500' }}>Total Volume</p>
              <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>
                ${totalSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div style={{ backgroundColor: '#f0fdf4', padding: '8px', borderRadius: '8px', color: '#16a34a' }}>
              <DollarSign size={20} />
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ color: '#64748b', margin: '0 0 4px 0', fontSize: '13px', fontWeight: '500' }}>Transactions</p>
              <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>
                {filteredData.length}
              </h3>
            </div>
            <div style={{ backgroundColor: '#eff6ff', padding: '8px', borderRadius: '8px', color: '#2563eb' }}>
              <CreditCard size={20} />
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ color: '#64748b', margin: '0 0 4px 0', fontSize: '13px', fontWeight: '500' }}>Avg. Transaction</p>
              <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>
                ${filteredData.length ? (totalSales / filteredData.length).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
              </h3>
            </div>
            <div style={{ backgroundColor: '#fdf4ff', padding: '8px', borderRadius: '8px', color: '#c026d3' }}>
              <ArrowUpRight size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Area */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '14px' }} />
          <input 
            type="text" 
            placeholder="Search by Transaction ID, PNR, or Customer Name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box', outline: 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
          />
        </div>
        <div style={{ position: 'relative' }}>
          <Filter size={16} color="#64748b" style={{ position: 'absolute', left: '16px', top: '15px' }} />
          <select 
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            style={{ width: '220px', padding: '12px 16px 12px 40px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', backgroundColor: '#ffffff', appearance: 'none' }}
          >
            <option value="All">All Services</option>
            <option value="Flight Booking">Flight Booking</option>
            <option value="UMNR Service">UMNR Service</option>
            <option value="Pet Service">Pet Service</option>
            <option value="Seat Upgrade">Seat Upgrade</option>
            <option value="Add Baggage">Add Baggage</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '16px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Transaction Info</th>
                <th style={{ padding: '16px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Customer & Agent</th>
                <th style={{ padding: '16px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Service Details</th>
                <th style={{ padding: '16px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>Amount</th>
                <th style={{ padding: '16px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Date & Time (PST)</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '40px 0', textAlign: 'center', color: '#64748b' }}>No transactions found for yesterday.</td>
                </tr>
              ) : filteredData.map(trx => (
                <tr key={trx.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background-color 0.15s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
                      {trx.id}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      PNR: <span style={{ fontWeight: '600', color: '#334155' }}>{trx.pnr}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#16a34a', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16a34a' }}></div> {trx.status}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <User size={14} color="#64748b" /> {trx.customer}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      Agent: {trx.agent}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', color: '#0ea5e9', backgroundColor: '#e0f2fe', padding: '4px 10px', borderRadius: '20px', marginBottom: '6px' }}>
                      {trx.service}
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CreditCard size={12} /> {trx.method}
                    </div>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                      ${trx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} color="#64748b" />
                      {trx.date}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', marginLeft: '20px' }}>
                      {trx.time}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default YesterdaySales;
