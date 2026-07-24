import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck } from 'lucide-react';

const CustomerDirectory = () => {
  const navigate = useNavigate();
  const [agentStats, setAgentStats] = useState({});
  const [convertedCustomers, setConvertedCustomers] = useState([]);

  useEffect(() => {
    const savedLeads = JSON.parse(localStorage.getItem('zsm_leads') || '[]');
    
    // Filter to only Converted leads
    const converted = savedLeads.filter(lead => lead.leadStatus === 'Converted');
    setConvertedCustomers(converted);

    // Group by agent
    const stats = {};
    converted.forEach(lead => {
      const agent = lead.salesAgent || 'Unassigned';
      if (!stats[agent]) stats[agent] = 0;
      stats[agent]++;
    });
    setAgentStats(stats);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f8fafc', overflow: 'hidden' }}>
      
      {/* Top Header */}
      <header style={{ height: '64px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', flexShrink: 0 }}>
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', backgroundColor: '#005ed3', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={18} color="white" />
          </div>
          Customer Directory
        </div>
        <nav style={{ display: 'flex', gap: '24px' }}>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }} style={{ color: '#64748b', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Dashboard</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/reports/create-lead'); }} style={{ color: '#64748b', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Create Lead</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/customer-directory'); }} style={{ color: '#005ed3', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>Customer Directory</a>
        </nav>
      </header>

      {/* Main Content */}
      <div style={{ padding: '40px', overflowY: 'auto', flex: 1 }}>
        
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ margin: '0 0 8px 0', color: '#0f172a', fontWeight: '700', fontSize: '24px' }}>Agent Conversion Stats</h2>
          <div style={{ color: '#64748b', fontSize: '14px' }}>Track how many customers were successfully converted by each sales agent.</div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px', marginBottom: '48px' }}>
          {Object.entries(agentStats).map(([agent, count]) => (
            <div key={agent} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserCheck size={24} color="#4338ca" />
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>{agent}</div>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>Sales Agent</div>
                </div>
              </div>
              <div style={{ fontSize: '36px', fontWeight: '700', color: '#0f172a' }}>{count}</div>
              <div style={{ fontSize: '14px', color: '#10b981', fontWeight: '500', marginTop: '4px' }}>Converted Customers</div>
            </div>
          ))}
          {Object.keys(agentStats).length === 0 && (
            <div style={{ color: '#64748b', padding: '24px', border: '1px dashed #cbd5e1', borderRadius: '8px', textAlign: 'center' }}>
              No converted customers found yet. Update a lead's status to "Converted".
            </div>
          )}
        </div>

        <h2 style={{ marginBottom: '24px', color: '#0f172a', fontWeight: '700', fontSize: '20px' }}>All Converted Customers</h2>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Customer Name</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sales Agent</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Lead Type</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date Converted</th>
              </tr>
            </thead>
            <tbody>
              {convertedCustomers.map(lead => (
                <tr key={lead.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: '#0f172a', fontWeight: '600' }}>{lead.fullName || 'Unknown'}</td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569' }}>{lead.email || 'N/A'}</td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569' }}>
                    <span style={{ backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontWeight: '500' }}>
                      {lead.salesAgent || 'Unassigned'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569' }}>{lead.leadType}</td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569' }}>{new Date(lead.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {convertedCustomers.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                    No converted customers available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerDirectory;
