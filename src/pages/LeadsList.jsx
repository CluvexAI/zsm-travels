import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Plus, Search, Filter, MoreHorizontal, LayoutDashboard, BarChart3, Settings, HelpCircle, LogOut, Plane, Bell, History
} from 'lucide-react';
import { fetchLeads } from '../services/supabase';

const LeadsList = () => {
  const [leads, setLeads] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadLeads = async () => {
      const savedLeads = await fetchLeads();
      // Sort by newest first
      savedLeads.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setLeads(savedLeads);
    };
    loadLeads();
  }, []);

  const [searchQuery, setSearchQuery] = useState('');

  const filteredLeads = leads.filter(lead => {
    if (!searchQuery) return true;
    const term = searchQuery.toLowerCase();
    const searchable = [lead.fullName, lead.email, lead.phone, lead.leadType, lead.leadStatus].join(' ').toLowerCase();
    return searchable.includes(term);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f8fafc', overflow: 'hidden' }}>
      
      {/* Top Header */}
      <header style={{ height: '64px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0, position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#005ed3', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', backgroundColor: '#005ed3', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plane size={20} color="white" />
            </div>
            ZSM Travel
          </div>

        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Bell size={20} color="#64748b" style={{ cursor: 'pointer', strokeWidth: 1.5 }} />
          <History size={20} color="#64748b" style={{ cursor: 'pointer', strokeWidth: 1.5 }} />
          <div style={{ height: '32px', width: '1px', backgroundColor: '#e2e8f0' }}></div>
          <button 
            onClick={() => navigate('/bookings/create-lead')}
            style={{ padding: '8px 24px', backgroundColor: '#005ed3', color: 'white', fontWeight: '500', fontSize: '13px', borderRadius: '4px', border: 'none', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={16} /> New Lead
          </button>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#e2e8f0', overflow: 'hidden', border: '2px solid white', boxShadow: '0 0 0 1px #cbd5e1' }}>
            <img src="https://i.pravatar.cc/100?img=47" alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div style={{ padding: '32px', overflowY: 'auto', flex: 1 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: '0 0 8px 0' }}>Lead Queue</h1>
              <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>Manage and track all your travel inquiries.</p>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ position: 'relative' }}>
                <Search size={18} color="#94a3b8" style={{ position: 'absolute', top: '11px', left: '12px' }} />
                <input 
                  type="text" 
                  placeholder="Search leads..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ padding: '10px 12px 10px 40px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '14px', width: '250px', outline: 'none' }}
                />
              </div>
              <button style={{ padding: '10px 16px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#334155', fontWeight: '500', fontSize: '14px' }}>
                <Filter size={16} /> Filter
              </button>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Date Created</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Client Name</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Type</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Urgency</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Status</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748b', width: '50px' }}></th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '48px 24px', textAlign: 'center', color: '#64748b' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <Users size={48} color="#cbd5e1" />
                        <p style={{ margin: 0, fontSize: '16px', fontWeight: '500', color: '#334155' }}>No leads found</p>
                        <p style={{ margin: 0, fontSize: '14px' }}>{searchQuery ? 'Try a different search term.' : 'Get started by creating a new lead.'}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map(lead => (
                    <tr key={lead.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background-color 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#334155' }}>
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ fontWeight: '500', color: '#0f172a', fontSize: '14px' }}>{lead.fullName || 'Unknown'}</div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{lead.email || lead.phone || 'No contact provided'}</div>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#334155' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '16px' }}>
                            {lead.leadType === 'Flight Booking' ? '✈️' : 
                             lead.leadType === 'Hotel Booking' ? '🏨' : 
                             lead.leadType === 'Holiday Package' ? '🌴' : 
                             lead.leadType === 'Visa Assistance' ? '🛂' : '📌'}
                          </span>
                          {lead.leadType}
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        {lead.urgency && (
                          <span style={{ 
                            padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '500',
                            backgroundColor: lead.urgency === 'Urgent' ? '#fef2f2' : lead.urgency === 'High' ? '#fff7ed' : lead.urgency === 'Medium' ? '#fefce8' : '#f7fee7',
                            color: lead.urgency === 'Urgent' ? '#ef4444' : lead.urgency === 'High' ? '#f97316' : lead.urgency === 'Medium' ? '#eab308' : '#84cc16'
                          }}>
                            {lead.urgency}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ 
                          padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '500',
                          backgroundColor: '#eff6ff', color: '#1d4ed8'
                        }}>
                          {lead.leadStatus || 'New'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                          <MoreHorizontal size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LeadsList;
