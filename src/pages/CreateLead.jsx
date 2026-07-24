import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, BarChart3, Settings, HelpCircle, LogOut, 
  Plus, Bell, History, Plane, ChevronDown
} from 'lucide-react';

const CreateLead = () => {
  const navigate = useNavigate();
  const basicInfoRef = useRef(null);
  const customerInfoRef = useRef(null);
  const bookingDetailsRef = useRef(null);
  const followUpRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0);
  const [followUpCount, setFollowUpCount] = useState(0);
  const [activeView, setActiveView] = useState('create-lead');
  const [allLeads, setAllLeads] = useState([]);

  useEffect(() => {
    const savedLeads = JSON.parse(localStorage.getItem('zsm_leads') || '[]');
    setAllLeads(savedLeads);
    const count = savedLeads.filter(lead => lead.leadStatus === 'Follow-up').length;
    setFollowUpCount(count);
  }, []);

  const [formData, setFormData] = useState({
    vendorId: '',
    salesAgent: 'Alice Smith',
    leadType: 'Flight Booking',
    leadSource: 'Website Inquiry',
    leadStatus: 'New',
    urgency: '',
    urgencyDetails: '',
    tripType: 'One Way',
    departureDate: '',
    departureTime: '',
    flightNumber: '',
    origin: '',
    destination: '',
    paymentStatus: 'Pending',
    
    fullName: '',
    company: '',
    email: '',
    phone: '',
    whatsapp: '',
    contactTime: 'Morning (9AM - 12PM)',
    address: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const saveLead = () => {
    const newLead = { ...formData, id: Date.now(), createdAt: new Date().toISOString() };
    const existing = JSON.parse(localStorage.getItem('zsm_leads') || '[]');
    localStorage.setItem('zsm_leads', JSON.stringify([...existing, newLead]));
    alert('Lead Created Successfully!');
    navigate('/reports/leads');
  };

  const UrgencyButton = ({ level, color, label }) => {
    const isSelected = formData.urgency === level;
    return (
      <button 
        type="button"
        style={{ 
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          padding: '10px',
          border: isSelected ? '2px solid #cbd5e1' : '1px solid #e2e8f0',
          borderRadius: '4px',
          color: '#1e293b',
          fontWeight: '500',
          backgroundColor: '#ffffff',
          fontSize: '14px',
          transition: 'all 0.15s ease-in-out',
          cursor: 'pointer',
          outline: 'none',
          boxShadow: 'none'
        }}
        onClick={() => handleInputChange({ target: { name: 'urgency', value: level }})}
      >
        <span style={{ 
          width: '16px', height: '16px', borderRadius: '50%', backgroundColor: color, 
          display: 'inline-block' 
        }}></span>
        {label}
      </button>
    );
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}>
      
      {/* 1. Primary Sidebar (TravelCRM) */}
      <div style={{ width: '250px', backgroundColor: '#f8fafc', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '24px 24px 16px 24px' }}>
          <h5 style={{ fontWeight: '700', marginBottom: '4px', marginTop: 0, color: '#0f172a', letterSpacing: '-0.5px', fontSize: '18px' }}>TravelCRM</h5>
          <div style={{ color: '#475569', fontSize: '13px' }}>Lead Management v2</div>
        </div>

        <nav style={{ flex: 1, padding: '0 16px', marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {[
            { icon: LayoutDashboard, label: 'Dashboard', path: '/reports/leads', action: 'navigate' },
            { icon: Users, label: 'Lead Queue', path: '/reports/leads', action: 'navigate' },
            { icon: Users, label: 'Customer Directory', path: '/customer-directory', action: 'navigate' },
            { icon: Settings, label: "Sales Agent's Profile Setting", path: '#', action: 'agent-settings' }
          ].map((item, idx) => (
            <a 
              key={idx} 
              href={item.path}
              onClick={(e) => { 
                e.preventDefault(); 
                if (item.action === 'navigate') {
                  navigate(item.path);
                } else if (item.action === 'agent-settings') {
                  setActiveView('agent-settings');
                }
              }}
              className="sidebar-link" 
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderRadius: '6px', textDecoration: 'none', color: '#334155', fontWeight: '500', fontSize: '13px', backgroundColor: (activeView === 'agent-settings' && item.action === 'agent-settings') ? '#e2e8f0' : 'transparent' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <item.icon size={18} strokeWidth={1.5} />
                {item.label}
              </div>
              {item.label === 'Lead Queue' && followUpCount > 0 && (
                <span style={{ backgroundColor: '#ef4444', color: 'white', padding: '2px 6px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}>
                  {followUpCount}
                </span>
              )}
            </a>
          ))}
        </nav>

        <div style={{ padding: '24px' }}>
          <button style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '24px', backgroundColor: '#005ed3', color: 'white', fontWeight: '500', borderRadius: '4px', fontSize: '13px', padding: '10px', border: 'none', cursor: 'pointer' }}>
            <Plus size={16} strokeWidth={3} /> New Lead
          </button>
          
          <a href="#" className="sidebar-link" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', borderRadius: '6px', textDecoration: 'none', color: '#334155', fontSize: '13px', fontWeight: '500', marginBottom: '8px' }}>
            <HelpCircle size={18} strokeWidth={1.5} /> Help
          </a>
          <a href="#" className="sidebar-link-danger" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', borderRadius: '6px', textDecoration: 'none', color: '#b91c1c', fontSize: '13px', fontWeight: '500' }}>
            <LogOut size={18} strokeWidth={1.5} /> Sign Out
          </a>
        </div>
      </div>

      {/* Main Container */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        
        {/* 2. Top Header */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: '72px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#ffffff', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
            <h4 style={{ fontWeight: '700', margin: 0, color: '#0f172a', fontSize: '20px', letterSpacing: '-0.5px' }}>Horizon Lead Systems</h4>
            <nav style={{ display: 'flex', gap: '24px' }}>
              <a href="#" onClick={(e) => { e.preventDefault(); setActiveView('hot-leads'); }} style={{ textDecoration: 'none', color: activeView === 'hot-leads' ? '#005ed3' : '#64748b', fontSize: '13px', fontWeight: activeView === 'hot-leads' ? '600' : '500' }}>Hot Leads</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setActiveView('follow-ups'); }} style={{ textDecoration: 'none', color: activeView === 'follow-ups' ? '#005ed3' : '#64748b', fontSize: '13px', fontWeight: activeView === 'follow-ups' ? '600' : '500' }}>Follow-ups</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setActiveView('archive'); }} style={{ textDecoration: 'none', color: activeView === 'archive' ? '#005ed3' : '#64748b', fontSize: '13px', fontWeight: activeView === 'archive' ? '600' : '500' }}>Archive</a>
            </nav>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <Bell size={20} color="#64748b" style={{ cursor: 'pointer', strokeWidth: 1.5 }} />
            <History size={20} color="#64748b" style={{ cursor: 'pointer', strokeWidth: 1.5 }} />
            <div style={{ height: '32px', width: '1px', backgroundColor: '#e2e8f0' }}></div>
            {activeView === 'create-lead' && (
              <button 
                onClick={saveLead}
                style={{ padding: '8px 24px', backgroundColor: '#005ed3', color: 'white', fontWeight: '500', fontSize: '13px', borderRadius: '4px', border: 'none', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                Create Lead
              </button>
            )}
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#e2e8f0', overflow: 'hidden', border: '2px solid white', boxShadow: '0 0 0 1px #cbd5e1' }}>
              <img src="https://i.pravatar.cc/100?img=47" alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          
          {/* 3. Secondary Sidebar (LEAD PROGRESS) */}
          <div style={{ width: '260px', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc', flexShrink: 0 }}>
            <div style={{ padding: '32px 24px' }}>
              <div style={{ marginBottom: '24px', color: '#94a3b8', letterSpacing: '1px', fontSize: '11px', fontWeight: '700' }}>LEAD PROGRESS</div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {[
                  { num: '01', label: 'Basic Info', ref: basicInfoRef },
                  { num: '02', label: 'Customer Info', ref: customerInfoRef },
                  { num: '03', label: 'Booking Details', ref: bookingDetailsRef },
                  { num: '04', label: 'Follow-up', ref: followUpRef }
                ].map((step, idx) => {
                  const isActive = activeStep === idx;
                  return (
                    <div 
                      key={idx} 
                      onClick={() => {
                        setActiveStep(idx);
                        if (step.ref.current) {
                          step.ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                    >
                      <div style={{ 
                          display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%',
                          width: '28px', height: '28px', fontSize: '11px', fontWeight: '700',
                          backgroundColor: isActive ? '#ffffff' : 'transparent',
                          color: isActive ? '#005ed3' : '#64748b',
                          border: isActive ? '2px solid #005ed3' : '1px solid #cbd5e1',
                          boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                          transition: 'all 0.2s'
                        }}
                      >
                        {step.num}
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: isActive ? '700' : '600', color: isActive ? '#005ed3' : '#334155', transition: 'all 0.2s' }}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ marginTop: 'auto', padding: '24px' }}>
              <div style={{ padding: '16px', borderRadius: '6px', backgroundColor: '#dbeafe', border: '1px solid #bfdbfe' }}>
                <div style={{ marginBottom: '4px', color: '#475569', fontSize: '11px', fontWeight: '500' }}>System Status</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', color: '#0f172a', fontSize: '12px' }}>
                  <span style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%' }}></span>
                  Vendor API Connected
                </div>
              </div>
            </div>
          </div>

          {/* 4. Form Scroll Area */}
          <div style={{ flex: 1, padding: '40px', overflowY: 'auto', backgroundColor: '#ffffff' }}>
            {['hot-leads', 'follow-ups', 'archive'].includes(activeView) ? (
              (() => {
                let title = '';
                let statuses = [];
                if (activeView === 'hot-leads') {
                  title = 'Hot Leads';
                  statuses = ['New', 'Contacted', 'Negotiation', 'Quotation Sent'];
                } else if (activeView === 'follow-ups') {
                  title = 'Follow-ups';
                  statuses = ['Follow-up'];
                } else if (activeView === 'archive') {
                  title = 'Archive';
                  statuses = ['Lost', 'Cancelled', 'Archive'];
                }
                
                const filtered = allLeads.filter(lead => 
                  lead.salesAgent === formData.salesAgent && 
                  statuses.includes(lead.leadStatus)
                );

                return (
                  <div style={{ maxWidth: '800px', margin: '0' }}>
                    <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h5 style={{ margin: '0 0 4px 0', color: '#0f172a', fontWeight: '700', fontSize: '20px' }}>{title}</h5>
                        <div style={{ fontSize: '14px', color: '#64748b' }}>Showing leads assigned to {formData.salesAgent}</div>
                      </div>
                      <button 
                        onClick={() => setActiveView('create-lead')}
                        style={{ padding: '8px 16px', backgroundColor: '#f1f5f9', color: '#334155', fontWeight: '600', fontSize: '13px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>
                        Back to Form
                      </button>
                    </div>

                    <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '16px', fontSize: '13px', fontWeight: '600', color: '#475569' }}>Customer Name</th>
                            <th style={{ padding: '16px', fontSize: '13px', fontWeight: '600', color: '#475569' }}>Lead Type</th>
                            <th style={{ padding: '16px', fontSize: '13px', fontWeight: '600', color: '#475569' }}>Status</th>
                            <th style={{ padding: '16px', fontSize: '13px', fontWeight: '600', color: '#475569' }}>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.map(lead => (
                            <tr key={lead.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '16px', fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>{lead.fullName || 'Unknown'}</td>
                              <td style={{ padding: '16px', fontSize: '14px', color: '#475569' }}>{lead.leadType}</td>
                              <td style={{ padding: '16px' }}>
                                <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
                                  {lead.leadStatus}
                                </span>
                              </td>
                              <td style={{ padding: '16px', fontSize: '14px', color: '#475569' }}>{new Date(lead.createdAt).toLocaleDateString()}</td>
                            </tr>
                          ))}
                          {filtered.length === 0 && (
                            <tr>
                              <td colSpan="4" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>No leads found in this category.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()
            ) : activeView === 'agent-settings' ? (
              <div style={{ maxWidth: '600px', margin: '0' }}>
                <div style={{ marginBottom: '32px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
                  <div style={{ padding: '40px' }}>
                    <div style={{ marginBottom: '32px' }}>
                      <h5 style={{ margin: '0 0 4px 0', color: '#0f172a', fontWeight: '600', fontSize: '18px' }}>Sales Agent's Profile Setting</h5>
                      <div style={{ fontSize: '13px', color: '#64748b' }}>Update your personal details and credentials.</div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
                      <div>
                        <label className="custom-label">Name</label>
                        <input type="text" className="custom-input" placeholder="Your Full Name" defaultValue="Alice Smith" />
                      </div>
                      <div>
                        <label className="custom-label">Email ID</label>
                        <input type="email" className="custom-input" placeholder="your.email@example.com" defaultValue="alice@zsmtravel.com" />
                      </div>
                      <div>
                        <label className="custom-label">Password Setting Option</label>
                        <input type="password" className="custom-input" placeholder="Enter new password" />
                      </div>
                    </div>

                    <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                      <button 
                        type="button"
                        onClick={() => setActiveView('create-lead')}
                        style={{ padding: '10px 20px', backgroundColor: '#f1f5f9', color: '#334155', fontWeight: '600', fontSize: '14px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>
                        Cancel
                      </button>
                      <button 
                        type="button"
                        onClick={() => { alert('Profile Updated Successfully!'); setActiveView('create-lead'); }}
                        style={{ padding: '10px 20px', backgroundColor: '#005ed3', color: 'white', fontWeight: '600', fontSize: '14px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
            <div style={{ maxWidth: '800px', margin: '0' }}>
              
              {/* Card 1: Basic Information */}
              <div ref={basicInfoRef} style={{ marginBottom: '32px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
                <div style={{ padding: '40px' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                    <div>
                      <h5 style={{ margin: '0 0 4px 0', color: '#0f172a', fontWeight: '600', fontSize: '18px' }}>Basic Information</h5>
                      <div style={{ fontSize: '13px', color: '#64748b' }}>Core lead identification and urgency prioritization.</div>
                    </div>
                    <div style={{ padding: '6px 12px', borderRadius: '4px', backgroundColor: '#e0e7ff', color: '#3730a3', fontWeight: '600', fontSize: '12px', letterSpacing: '0.5px' }}>
                      ID: LD-2023-9021
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div style={{ gridColumn: 'span 1' }}>
                      <label className="custom-label">Vendor ID <span style={{ color: '#ef4444' }}>*</span></label>
                      <input 
                        type="text" 
                        className="custom-input" 
                        name="vendorId"
                        value={formData.vendorId}
                        onChange={handleInputChange}
                        placeholder="e.g. VND-00125" 
                      />
                      <div style={{ marginTop: '6px', fontSize: '11px', fontStyle: 'italic', color: '#94a3b8' }}>Assigned vendor for primary ticketing.</div>
                    </div>

                    <div style={{ gridColumn: 'span 1' }}>
                      <label className="custom-label">Sales Agent <span style={{ color: '#ef4444' }}>*</span></label>
                      <select 
                        className="custom-select"
                        name="salesAgent"
                        value={formData.salesAgent}
                        onChange={handleInputChange}
                      >
                        <option value="Alice Smith">Alice Smith</option>
                        <option value="Bob Johnson">Bob Johnson</option>
                        <option value="Charlie Davis">Charlie Davis</option>
                        <option value="Diana Prince">Diana Prince</option>
                      </select>
                      <div style={{ marginTop: '6px', fontSize: '11px', fontStyle: 'italic', color: '#94a3b8' }}>Agent handling this lead.</div>
                    </div>
                    
                    <div style={{ gridColumn: 'span 2' }}>
                      <label className="custom-label" style={{ marginBottom: '12px' }}>Lead Type</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                        {[
                          { name: 'Flight Booking', icon: '✈️' },
                          { name: 'Hotel Booking', icon: '🏨' },
                          { name: 'Holiday Package', icon: '🌴' },
                          { name: 'Visa Assistance', icon: '🛂' },
                          { name: 'Travel Insurance', icon: '🛡️' },
                          { name: 'Car Rental', icon: '🚗' },
                          { name: 'Other', icon: '📌' },
                        ].map((type) => (
                          <div 
                            key={type.name}
                            onClick={() => handleInputChange({ target: { name: 'leadType', value: type.name } })}
                            style={{
                              border: formData.leadType === type.name ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                              backgroundColor: formData.leadType === type.name ? '#eff6ff' : '#ffffff',
                              borderRadius: '8px',
                              padding: '16px 8px',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              transition: 'all 0.2s ease',
                              textAlign: 'center',
                              boxShadow: formData.leadType === type.name ? '0 4px 6px -1px rgba(59, 130, 246, 0.1)' : 'none'
                            }}
                          >
                            <span style={{ fontSize: '24px' }}>{type.icon}</span>
                            <span style={{ fontSize: '13px', fontWeight: formData.leadType === type.name ? '600' : '500', color: formData.leadType === type.name ? '#1d4ed8' : '#475569' }}>
                              {type.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {formData.leadType === 'Other' && (
                      <div style={{ gridColumn: 'span 2' }}>
                        <label className="custom-label">Purpose <span style={{ color: '#ef4444' }}>*</span></label>
                        <textarea 
                          className="custom-input" 
                          name="purpose"
                          value={formData.purpose || ''}
                          onChange={handleInputChange}
                          rows="3" 
                          style={{ height: 'auto', paddingTop: '12px' }} 
                          placeholder="Please write the purpose or requirement..."
                        ></textarea>
                      </div>
                    )}

                    <div style={{ gridColumn: 'span 1' }}>
                      <label className="custom-label">Lead Source</label>
                      <div style={{ position: 'relative' }}>
                        <select 
                          className="custom-select" 
                          name="leadSource"
                          value={formData.leadSource}
                          onChange={handleInputChange}
                        >
                          <option>Website Inquiry</option>
                          <option>Phone Call</option>
                        </select>
                        <ChevronDown size={18} style={{ position: 'absolute', top: '12px', right: '12px', color: '#94a3b8', pointerEvents: 'none' }} />
                      </div>
                    </div>
                    
                    <div style={{ gridColumn: 'span 1' }}>
                      <label className="custom-label">Lead Status</label>
                      <div style={{ position: 'relative' }}>
                        <select 
                          className="custom-select" 
                          name="leadStatus"
                          value={formData.leadStatus}
                          onChange={handleInputChange}
                        >
                          <option>New</option>
                          <option>Contacted</option>
                          <option>Follow-up</option>
                          <option>Quotation Sent</option>
                          <option>Negotiation</option>
                          <option>Converted</option>
                          <option>Lost</option>
                          <option>Cancelled</option>
                        </select>
                        <ChevronDown size={18} style={{ position: 'absolute', top: '12px', right: '12px', color: '#94a3b8', pointerEvents: 'none' }} />
                      </div>
                    </div>

                    <div style={{ gridColumn: 'span 2', marginTop: '8px' }}>
                      <label className="custom-label" style={{ marginBottom: '12px' }}>Set Urgency Level <span style={{ color: '#ef4444' }}>*</span></label>
                      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                        <UrgencyButton level="Urgent" color="#ef4444" label="Urgent" />
                        <UrgencyButton level="High" color="#f97316" label="High" />
                        <UrgencyButton level="Medium" color="#eab308" label="Medium" />
                        <UrgencyButton level="Low" color="#84cc16" label="Low" />
                      </div>
                      <textarea 
                        className="custom-input" 
                        name="urgencyDetails"
                        value={formData.urgencyDetails || ''}
                        onChange={handleInputChange}
                        rows="2" 
                        style={{ height: 'auto', paddingTop: '12px' }} 
                        placeholder="Write details about the urgency..."
                      ></textarea>
                    </div>
                  </div>

                </div>
              </div>

              {/* Card 2: Customer Profile */}
              <div ref={customerInfoRef} style={{ marginBottom: '40px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
                <div style={{ padding: '40px' }}>
                  
                  <div style={{ marginBottom: '32px' }}>
                    <h5 style={{ margin: '0 0 4px 0', color: '#0f172a', fontWeight: '600', fontSize: '18px' }}>Customer Profile</h5>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>Detailed contact and identification records.</div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div style={{ gridColumn: 'span 1' }}>
                      <label className="custom-label">Full Name <span style={{ color: '#ef4444' }}>*</span></label>
                      <input 
                        type="text" 
                        className="custom-input" 
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="e.g. Johnathan Miller" 
                      />
                    </div>
                    
                    <div style={{ gridColumn: 'span 1' }}>
                      <label className="custom-label">Business/Organization</label>
                      <input 
                        type="text" 
                        className="custom-input" 
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        placeholder="Optional" 
                      />
                    </div>

                    <div style={{ gridColumn: 'span 1' }}>
                      <label className="custom-label">Email Address</label>
                      <input 
                        type="email" 
                        className="custom-input" 
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="john@example.com" 
                      />
                    </div>
                    
                    <div style={{ gridColumn: 'span 1' }}>
                      <label className="custom-label">Primary Phone <span style={{ color: '#ef4444' }}>*</span></label>
                      <input 
                        type="tel" 
                        className="custom-input" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+1 (555) 000-0000" 
                      />
                    </div>

                    <div style={{ gridColumn: 'span 1' }}>
                      <label className="custom-label">WhatsApp Number</label>
                      <input 
                        type="tel" 
                        className="custom-input" 
                        name="whatsapp"
                        value={formData.whatsapp}
                        onChange={handleInputChange}
                        placeholder="+1 (555) 000-0000" 
                      />
                    </div>
                    
                    <div style={{ gridColumn: 'span 1' }}>
                      <label className="custom-label">Preferred Contact Time</label>
                      <div style={{ position: 'relative' }}>
                        <select 
                          className="custom-select" 
                          name="contactTime"
                          value={formData.contactTime}
                          onChange={handleInputChange}
                        >
                          <option>Morning (9AM - 12PM)</option>
                          <option>Afternoon (12PM - 5PM)</option>
                          <option>Evening (5PM - 8PM)</option>
                        </select>
                        <ChevronDown size={18} style={{ position: 'absolute', top: '12px', right: '12px', color: '#94a3b8', pointerEvents: 'none' }} />
                      </div>
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                      <label className="custom-label">Full Address</label>
                      <textarea 
                        className="custom-input" 
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows="3"
                        style={{ resize: 'vertical', height: 'auto', paddingTop: '12px' }}
                      ></textarea>
                    </div>
                  </div>

                </div>
              </div>

              {/* Card 3: Booking Details (Dynamic) */}
              {formData.leadType !== 'Other' && (
                <div ref={bookingDetailsRef} style={{ marginBottom: '40px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
                  <div style={{ padding: '40px' }}>
                    
                    <div style={{ marginBottom: '32px' }}>
                      <h5 style={{ margin: '0 0 4px 0', color: '#0f172a', fontWeight: '600', fontSize: '18px' }}>Booking Details</h5>
                      <div style={{ fontSize: '13px', color: '#64748b' }}>Dynamic requirements based on {formData.leadType}.</div>
                    </div>

                  {formData.leadType === 'Flight Booking' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                      <div style={{ gridColumn: 'span 2' }}>
                        <label className="custom-label">Trip Type</label>
                        <div style={{ display: 'flex', gap: '16px' }}>
                          {['One Way', 'Round Trip'].map(type => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => handleInputChange({ target: { name: 'tripType', value: type } })}
                              style={{
                                flex: 1, padding: '10px', borderRadius: '4px', cursor: 'pointer',
                                border: formData.tripType === type ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                                backgroundColor: formData.tripType === type ? '#eff6ff' : '#ffffff',
                                color: formData.tripType === type ? '#1d4ed8' : '#334155',
                                fontWeight: formData.tripType === type ? '600' : '500',
                                transition: 'all 0.2s',
                                outline: 'none'
                              }}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div style={{ gridColumn: 'span 1' }}>
                        <label className="custom-label">Origin</label>
                        <input type="text" className="custom-input" placeholder="e.g. JFK" name="origin" value={formData.origin || ''} onChange={handleInputChange} />
                      </div>
                      <div style={{ gridColumn: 'span 1' }}>
                        <label className="custom-label">Destination</label>
                        <input type="text" className="custom-input" placeholder="e.g. LHR" name="destination" value={formData.destination || ''} onChange={handleInputChange} />
                      </div>
                      <div style={{ gridColumn: 'span 1' }}>
                        <label className="custom-label">Departure Date</label>
                        <input type="date" className="custom-input" name="departureDate" value={formData.departureDate || ''} onChange={handleInputChange} />
                      </div>
                      <div style={{ gridColumn: 'span 1' }}>
                        <label className="custom-label">Departure Time</label>
                        <input type="time" className="custom-input" name="departureTime" value={formData.departureTime || ''} onChange={handleInputChange} />
                      </div>
                      <div style={{ gridColumn: 'span 1' }}>
                        <label className="custom-label">Flight Number</label>
                        <input type="text" className="custom-input" placeholder="e.g. AA100" name="flightNumber" value={formData.flightNumber || ''} onChange={handleInputChange} />
                      </div>
                      <div style={{ gridColumn: 'span 1' }}>
                        <label className="custom-label">Payment Status</label>
                        <select className="custom-select" name="paymentStatus" value={formData.paymentStatus || 'Pending'} onChange={handleInputChange}>
                          <option value="Pending">Pending</option>
                          <option value="Partially Paid">Partially Paid</option>
                          <option value="Paid">Paid</option>
                        </select>
                      </div>
                      {formData.tripType === 'Round Trip' && (
                        <div style={{ gridColumn: 'span 1' }}>
                          <label className="custom-label">Return Date</label>
                          <input type="date" className="custom-input" />
                        </div>
                      )}
                      <div style={{ gridColumn: 'span 1' }}>
                        <label className="custom-label">Passengers</label>
                        <input type="number" className="custom-input" min="1" defaultValue="1" />
                      </div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <label className="custom-label">Preferred Airline (USA)</label>
                        <div style={{ position: 'relative' }}>
                          <select 
                            className="custom-select" 
                            name="preferredAirline" 
                            value={formData.preferredAirline || ''} 
                            onChange={handleInputChange}
                          >
                            <option value="">No Preference</option>
                            <option>American Airlines</option>
                            <option>Delta Air Lines</option>
                            <option>United Airlines</option>
                            <option>Southwest Airlines</option>
                            <option>JetBlue Airways</option>
                            <option>Alaska Airlines</option>
                            <option>Spirit Airlines</option>
                            <option>Frontier Airlines</option>
                            <option>Hawaiian Airlines</option>
                          </select>
                          <ChevronDown size={18} style={{ position: 'absolute', top: '12px', right: '12px', color: '#94a3b8', pointerEvents: 'none' }} />
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.leadType === 'Hotel Booking' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                      <div style={{ gridColumn: 'span 2' }}>
                        <label className="custom-label">City or Hotel Name</label>
                        <input type="text" className="custom-input" placeholder="e.g. Dubai" />
                      </div>
                      <div style={{ gridColumn: 'span 1' }}>
                        <label className="custom-label">Check-in</label>
                        <input type="date" className="custom-input" />
                      </div>
                      <div style={{ gridColumn: 'span 1' }}>
                        <label className="custom-label">Check-out</label>
                        <input type="date" className="custom-input" />
                      </div>
                    </div>
                  )}

                  {formData.leadType === 'Holiday Package' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                      <div style={{ gridColumn: 'span 2' }}>
                        <label className="custom-label">Destination / Package Name</label>
                        <input type="text" className="custom-input" placeholder="e.g. Maldives Honeymoon" />
                      </div>
                      <div style={{ gridColumn: 'span 1' }}>
                        <label className="custom-label">Preferred Travel Month</label>
                        <input type="month" className="custom-input" />
                      </div>
                      <div style={{ gridColumn: 'span 1' }}>
                        <label className="custom-label">Budget (USD)</label>
                        <input type="number" className="custom-input" placeholder="e.g. 5000" />
                      </div>
                    </div>
                  )}
                  
                  {formData.leadType === 'Visa Assistance' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                      <div style={{ gridColumn: 'span 1' }}>
                        <label className="custom-label">Destination Country</label>
                        <input type="text" className="custom-input" placeholder="e.g. USA" />
                      </div>
                      <div style={{ gridColumn: 'span 1' }}>
                        <label className="custom-label">Visa Type</label>
                        <select className="custom-select">
                          <option>Tourist</option>
                          <option>Business</option>
                          <option>Student</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {formData.leadType === 'Travel Insurance' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                      <div style={{ gridColumn: 'span 1' }}>
                        <label className="custom-label">Coverage Region</label>
                        <select className="custom-select">
                          <option>Worldwide</option>
                          <option>Europe</option>
                          <option>Asia</option>
                        </select>
                      </div>
                      <div style={{ gridColumn: 'span 1' }}>
                        <label className="custom-label">Duration (Days)</label>
                        <input type="number" className="custom-input" placeholder="e.g. 14" />
                      </div>
                    </div>
                  )}

                  {formData.leadType === 'Car Rental' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                      <div style={{ gridColumn: 'span 1' }}>
                        <label className="custom-label">Pick-up Location</label>
                        <input type="text" className="custom-input" placeholder="Airport or City" />
                      </div>
                      <div style={{ gridColumn: 'span 1' }}>
                        <label className="custom-label">Car Type</label>
                        <select className="custom-select">
                          <option>Economy</option>
                          <option>SUV</option>
                          <option>Luxury</option>
                        </select>
                      </div>
                    </div>
                  )}

                  </div>
                </div>
              )}

              <div ref={followUpRef} style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginBottom: '40px' }}>
                <button 
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  style={{ padding: '12px 24px', backgroundColor: '#f1f5f9', color: '#334155', fontWeight: '600', fontSize: '14px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={saveLead}
                  style={{ padding: '12px 32px', backgroundColor: '#005ed3', color: 'white', fontWeight: '600', fontSize: '14px', borderRadius: '6px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0, 94, 211, 0.2)' }}>
                  Create Lead
                </button>
              </div>

            </div>
            )}
          </div>
        </div>

      </div>
      
      <style>{`
        .custom-label {
          display: block;
          font-size: 12px;
          color: #0f172a;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .custom-input, .custom-select {
          width: 100%;
          height: 42px;
          font-size: 14px;
          color: #334155;
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          padding: 0 12px;
          outline: none;
          box-sizing: border-box;
          font-family: inherit;
        }
        .custom-select {
          appearance: none;
          cursor: pointer;
        }
        .custom-input:focus, .custom-select:focus {
          border-color: #93c5fd;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          background-color: #ffffff;
        }
        .custom-input::placeholder {
          color: #94a3b8;
        }
        .sidebar-link:hover {
          background-color: #f1f5f9;
        }
        .sidebar-link-danger:hover {
          background-color: #fef2f2;
        }
      `}</style>
    </div>
  );
};

export default CreateLead;
