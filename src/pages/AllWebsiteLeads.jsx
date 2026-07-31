import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Search, Calendar, User, Phone, Mail, FileText } from 'lucide-react';
import { fetchLeads } from '../services/supabase';

const AllWebsiteLeads = () => {
  const navigate = useNavigate();
  const [websiteLeads, setWebsiteLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const loadLeads = async () => {
      // Fetch all leads and filter for 'Website Inquiry'
      const savedLeads = await fetchLeads();
      const filtered = savedLeads.filter(lead => lead.leadSource === 'Website Inquiry');
      
      // Sort by newest first
      filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      
      setWebsiteLeads(filtered);
    };
    loadLeads();
  }, []);

  const filteredData = websiteLeads.filter(lead => {
    // Text search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const searchableStr = [
        lead.fullName, lead.email, lead.phone, lead.vendorId, lead.leadType
      ].join(' ').toLowerCase();
      if (!searchableStr.includes(term)) return false;
    }
    
    // Status filter
    if (statusFilter !== 'All' && lead.leadStatus !== statusFilter) return false;

    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>
      
      {/* Header */}
      <header style={{ height: '72px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '40px', height: '40px', backgroundColor: '#8b5cf6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(139, 92, 246, 0.2)' }}>
            <Globe size={24} color="white" strokeWidth={2} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#0f172a' }}>All Website Leads</h1>
            <div style={{ fontSize: '13px', color: '#64748b' }}>Inquiries and bookings generated through the website</div>
          </div>
        </div>
        <button 
          onClick={() => navigate('/reports/create-lead')}
          style={{ padding: '10px 20px', backgroundColor: '#0f172a', color: '#ffffff', fontWeight: '600', fontSize: '14px', borderRadius: '6px', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>
          Back to Dashboard
        </button>
      </header>

      {/* Main Content */}
      <div style={{ padding: '32px', overflowY: 'auto', flex: 1, maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        
        {/* Filters Area */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '14px' }} />
            <input 
              type="text" 
              placeholder="Search by name, email, phone, or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box', outline: 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '200px', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', backgroundColor: '#ffffff' }}
          >
            <option value="All">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Quotation Sent">Quotation Sent</option>
            <option value="Follow-up">Follow-up</option>
            <option value="Converted">Converted (Booked)</option>
            <option value="Lost">Lost</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Archive">Archive</option>
          </select>
        </div>

        {/* Results Area */}
        {filteredData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <Globe size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
            <h3 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '18px' }}>No Website Leads Found</h3>
            <p style={{ margin: 0, color: '#64748b' }}>There are no leads matching your current filters.</p>
          </div>
        ) : (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '16px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Customer Details</th>
                    <th style={{ padding: '16px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Contact Info</th>
                    <th style={{ padding: '16px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Inquiry Details</th>
                    <th style={{ padding: '16px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Status & Urgency</th>
                    <th style={{ padding: '16px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Date Received</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map(lead => (
                    <tr key={lead.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background-color 0.15s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <User size={14} color="#64748b" /> {lead.fullName || 'Unknown'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          ID: {lead.vendorId || lead.id}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                          Agent: <span style={{ fontWeight: '500', color: '#334155' }}>{lead.salesAgent}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontSize: '13px', color: '#334155', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Mail size={12} color="#64748b" /> {lead.email || 'N/A'}
                        </div>
                        <div style={{ fontSize: '13px', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Phone size={12} color="#64748b" /> {lead.phone || 'N/A'}
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#0ea5e9', backgroundColor: '#e0f2fe', padding: '4px 10px', borderRadius: '20px', marginBottom: '6px' }}>
                          <FileText size={12} /> {lead.leadType}
                        </div>
                        {lead.tripType && (
                          <div style={{ fontSize: '12px', color: '#475569' }}>
                            {lead.tripType} {lead.origin && lead.destination ? `(${lead.origin} → ${lead.destination})` : ''}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', color: lead.leadStatus === 'Converted' ? '#166534' : '#1e40af', backgroundColor: lead.leadStatus === 'Converted' ? '#dcfce3' : '#dbeafe', padding: '4px 10px', borderRadius: '4px', alignSelf: 'flex-start' }}>
                            {lead.leadStatus}
                          </div>
                          {lead.urgency && (
                            <div style={{ fontSize: '12px', fontWeight: '500', color: lead.urgency === 'High' ? '#ef4444' : lead.urgency === 'Medium' ? '#f59e0b' : '#334155' }}>
                              Urgency: {lead.urgency}
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontSize: '13px', fontWeight: '500', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={14} color="#64748b" />
                          {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', marginLeft: '20px' }}>
                          {lead.createdAt ? new Date(lead.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : ''}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllWebsiteLeads;
