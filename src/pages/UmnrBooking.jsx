import React, { useState, useEffect } from 'react';
import { ExternalLink, CheckCircle2, RefreshCw, Info, Calendar, User, Plane, RotateCw, Check, Loader2, Download, CreditCard, Shield, FileText, FileCheck } from 'lucide-react';
import html2pdf from 'html2pdf.js';

const steps = [
  { id: 1, title: 'Child & Eligibility' },
  { id: 2, title: 'Contacts' },
  { id: 3, title: 'Flight Segments' },
  { id: 4, title: 'Documents' },
  { id: 5, title: 'Request & Approval' },
  { id: 6, title: 'Payment' },
  { id: 7, title: 'Summary' },
  { id: 8, title: 'Handover Tracking' },
  { id: 9, title: 'Completion' }
];

const mockSegments = [
  { id: 'seg1', route: 'JFK → ATL', flight: 'DL 101', date: '10 Aug 2024', time: '08:45' },
  { id: 'seg2', route: 'ATL → MIA', flight: 'DL 202', date: '10 Aug 2024', time: '13:00' }
];

const UmnrBooking = () => {
  const [currentStep, setCurrentStep] = useState(() => {
    try { const saved = localStorage.getItem('umnrDraft'); if (saved) return JSON.parse(saved).step || 1; } catch(e) {}
    return 1;
  });

  const [formData, setFormData] = useState(() => {
    try { const saved = localStorage.getItem('umnrDraft'); if (saved && JSON.parse(saved).data) return JSON.parse(saved).data; } catch(e) {}
    return {
      minorName: 'Emma Smith', minorDob: '2012-03-15', minorAge: 12, minorGender: 'Female', minorNat: 'American', minorPass: 'US1234567', minorPassExp: '2027-03-15', minorNatId: '123456789', minorSpc: 'None', minorMeal: 'Regular Meal', minorEmail: 'emma@gmail.com', minorPhone: '+1 212 555 0000',
      serviceUmnr: true, serviceEscort: false, serviceAirport: false, serviceConn: true, isEligible: true,
      contacts: {
        parentName: 'John Smith', parentRel: 'Father', parentPhone: '+1 212 555 9000', parentEmail: 'john.smith@email.com',
        dropName: '', dropRel: '', dropPhone: '', dropId: '',
        pickName: '', pickRel: '', pickPhone: '', pickId: ''
      },
      segments: ['seg1', 'seg2'],
      docs: { passport: false, consent: false, form: false, terms: false },
      approvalStatus: 'Pending',
      payment: { method: 'Customer Card', number: '', exp: '', cvv: '' },
      handover: { dropTime: '', pickTime: '' }
    };
  });

  useEffect(() => {
    localStorage.setItem('umnrDraft', JSON.stringify({ step: currentStep, data: formData }));
  }, [currentStep, formData]);

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 9));
  const handlePrev = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  
  const generatePDF = () => {
    const element = document.getElementById('umnr-receipt');
    html2pdf().set({ margin: 0.5, filename: 'UMNR_Receipt.pdf', html2canvas: { scale: 2 }, jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' } }).from(element).save();
  };

  const checkApproval = () => {
    setFormData({...formData, approvalStatus: 'Processing'});
    setTimeout(() => {
      setFormData({...formData, approvalStatus: 'Approved'});
    }, 1500);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem' }}>
            {/* Left Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>Child Passenger</div>
                <div style={{ padding: '1.25rem', display: 'flex', gap: '1rem' }}>
                  <div style={{ width: '60px', height: '60px', background: '#f1f5f9', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', borderRadius: '4px' }}>
                     <User size={32} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.95rem' }}>{formData.minorName}</span>
                      <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', border: '1px solid #bfdbfe', background: '#eff6ff', color: '#2563eb', borderRadius: '4px', fontWeight: 600 }}>CHD ({formData.minorAge} Yrs)</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>DOB: 15 Mar 2012 <span style={{ margin: '0 0.25rem' }}>|</span> Age: {formData.minorAge} yrs</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Passport: {formData.minorPass} <span style={{ margin: '0 0.25rem' }}>|</span> Nat: {formData.minorNat}</div>
                  </div>
                </div>
              </div>

              <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>Eligibility Check</div>
                <div style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>Airline</div>
                      <select style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.875rem', color: '#1e293b', outline: 'none', background: '#f8fafc' }}>
                        <option>Delta Air Lines (DL)</option>
                      </select>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>Route</div>
                      <div style={{ fontSize: '0.875rem', color: '#1e293b', padding: '0.5rem 0' }}>JFK - ATL - MIA</div>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>Travel Date</div>
                    <div style={{ fontSize: '0.875rem', color: '#1e293b' }}>10 Aug 2024</div>
                  </div>

                  <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '4px', padding: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <CheckCircle2 size={18} color="#16a34a" style={{ marginTop: '0.125rem' }} />
                    <div>
                      <div style={{ fontWeight: 600, color: '#166534', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Eligible</div>
                      <div style={{ fontSize: '0.8rem', color: '#166534', lineHeight: 1.4 }}>Passenger is eligible for UMNR service subject to airline approval.</div>
                    </div>
                  </div>
                  <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'white', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.875rem', fontWeight: 500, color: '#475569', cursor: 'pointer' }}>
                    <RefreshCw size={16} /> Refresh Eligibility
                  </button>
                </div>
              </div>

              <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', fontWeight: 600, color: '#1e293b', fontSize: '0.9rem', display: 'flex', gap: '0.25rem' }}>
                  UMNR Service Type <span style={{ color: '#64748b', fontWeight: 400 }}>(Optional)</span>
                </div>
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[{k: 'serviceUmnr', l: 'UMNR Service'}, {k: 'serviceEscort', l: 'Escort Service'}, {k: 'serviceAirport', l: 'Airport Assistance'}, {k: 'serviceConn', l: 'Connection Assistance'}].map(svc => (
                    <label key={svc.k} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', color: '#1e293b', cursor: 'pointer' }}>
                      <input type="checkbox" checked={formData[svc.k]} onChange={e => setFormData({...formData, [svc.k]: e.target.checked})} style={{ width: '16px', height: '16px', accentColor: '#2563eb' }} /> {svc.l}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>Child Details</div>
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>Full Name</label>
                      <input type="text" value={formData.minorName} onChange={e => setFormData({...formData, minorName: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.875rem', color: '#1e293b', outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>Date of Birth</label>
                      <div style={{ position: 'relative' }}>
                        <input type="date" value={formData.minorDob} onChange={e => setFormData({...formData, minorDob: e.target.value})} style={{ width: '100%', padding: '0.4rem 0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.875rem', color: '#1e293b', outline: 'none' }} />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>Age</label>
                      <div style={{ padding: '0.5rem 0', fontSize: '0.875rem', color: '#1e293b' }}>{formData.minorAge} Yrs</div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>Gender</label>
                      <select value={formData.minorGender} onChange={e => setFormData({...formData, minorGender: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.875rem', color: '#1e293b', outline: 'none' }}>
                        <option>Female</option>
                        <option>Male</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>Nationality</label>
                      <input type="text" value={formData.minorNat} onChange={e => setFormData({...formData, minorNat: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.875rem', color: '#1e293b', outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>Passport Number</label>
                      <input type="text" value={formData.minorPass} onChange={e => setFormData({...formData, minorPass: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.875rem', color: '#1e293b', outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>Passport Expiry</label>
                      <div style={{ position: 'relative' }}>
                        <input type="date" value={formData.minorPassExp} onChange={e => setFormData({...formData, minorPassExp: e.target.value})} style={{ width: '100%', padding: '0.4rem 0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.875rem', color: '#1e293b', outline: 'none' }} />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>National ID (Optional)</label>
                      <input type="text" value={formData.minorNatId} onChange={e => setFormData({...formData, minorNatId: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.875rem', color: '#1e293b', outline: 'none' }} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.25fr 1.25fr', gap: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>Special Assistance</label>
                      <select value={formData.minorSpc} onChange={e => setFormData({...formData, minorSpc: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.875rem', color: '#1e293b', outline: 'none' }}>
                        <option>None</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>Meal Preference</label>
                      <select value={formData.minorMeal} onChange={e => setFormData({...formData, minorMeal: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.875rem', color: '#1e293b', outline: 'none' }}>
                        <option>Regular Meal</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>Child Email (Optional)</label>
                      <input type="email" value={formData.minorEmail} onChange={e => setFormData({...formData, minorEmail: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.875rem', color: '#1e293b', outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>Child Phone (Optional)</label>
                      <input type="text" value={formData.minorPhone} onChange={e => setFormData({...formData, minorPhone: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.875rem', color: '#1e293b', outline: 'none' }} />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>UMNR Service Summary</div>
                <div style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}><Plane size={20} color="#64748b" style={{ marginTop: '0.1rem' }} /><div><div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Route</div><div style={{ fontSize: '0.875rem', color: '#1e293b', fontWeight: 500 }}>JFK → ATL → MIA</div></div></div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}><Calendar size={20} color="#64748b" style={{ marginTop: '0.1rem' }} /><div><div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Travel Date</div><div style={{ fontSize: '0.875rem', color: '#1e293b', fontWeight: 500 }}>10 Aug 2024</div></div></div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}><Plane size={20} color="#64748b" style={{ marginTop: '0.1rem', transform: 'rotate(45deg)' }} /><div><div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Airline</div><div style={{ fontSize: '0.875rem', color: '#1e293b', fontWeight: 500 }}>Delta Air Lines (DL)</div></div></div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}><RotateCw size={20} color="#64748b" style={{ marginTop: '0.1rem' }} /><div><div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Total Segments</div><div style={{ fontSize: '0.875rem', color: '#1e293b', fontWeight: 500 }}>2</div></div></div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}><RotateCw size={20} color="#64748b" style={{ marginTop: '0.1rem' }} /><div><div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>UMNR Segments</div><div style={{ fontSize: '0.875rem', color: '#1e293b', fontWeight: 500 }}>{formData.segments.length}</div></div></div>
                </div>
              </div>

              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '4px', padding: '1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <Info size={20} color="#2563eb" style={{ marginTop: '0.125rem' }} />
                <div>
                  <div style={{ fontWeight: 600, color: '#1e40af', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Important Note</div>
                  <div style={{ fontSize: '0.875rem', color: '#1e3a8a', lineHeight: 1.4 }}>UMNR service must be confirmed by the airline. Please complete all required sections and submit request.</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
             {['parent', 'drop', 'pick'].map(type => {
               const map = { parent: 'Parent / Legal Guardian', drop: 'Drop-off Person', pick: 'Pick-up Person' };
               return (
                 <div key={type} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>{map[type]}</div>
                    <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>Full Name</label>
                        <input type="text" value={formData.contacts[`${type}Name`]} onChange={e => setFormData({...formData, contacts: {...formData.contacts, [`${type}Name`]: e.target.value}})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.875rem', color: '#1e293b', outline: 'none' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>Relationship to Child</label>
                        <input type="text" value={formData.contacts[`${type}Rel`]} onChange={e => setFormData({...formData, contacts: {...formData.contacts, [`${type}Rel`]: e.target.value}})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.875rem', color: '#1e293b', outline: 'none' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>Phone Number</label>
                        <input type="text" value={formData.contacts[`${type}Phone`]} onChange={e => setFormData({...formData, contacts: {...formData.contacts, [`${type}Phone`]: e.target.value}})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.875rem', color: '#1e293b', outline: 'none' }} />
                      </div>
                      {type === 'parent' ? (
                        <div style={{ gridColumn: 'span 2' }}>
                          <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>Email Address</label>
                          <input type="email" value={formData.contacts.parentEmail} onChange={e => setFormData({...formData, contacts: {...formData.contacts, parentEmail: e.target.value}})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.875rem', color: '#1e293b', outline: 'none' }} />
                        </div>
                      ) : (
                        <div style={{ gridColumn: 'span 2' }}>
                          <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>National ID / Passport No.</label>
                          <input type="text" value={formData.contacts[`${type}Id`]} onChange={e => setFormData({...formData, contacts: {...formData.contacts, [`${type}Id`]: e.target.value}})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.875rem', color: '#1e293b', outline: 'none' }} />
                        </div>
                      )}
                    </div>
                 </div>
               )
             })}
          </div>
        );

      case 3:
        return (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>Select Flight Segments</div>
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>Select the specific segments that require the UMNR service.</p>
                {mockSegments.map(seg => (
                  <label key={seg.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: `1px solid ${formData.segments.includes(seg.id) ? '#2563eb' : '#cbd5e1'}`, borderRadius: '6px', background: formData.segments.includes(seg.id) ? '#eff6ff' : 'white', cursor: 'pointer' }}>
                    <input type="checkbox" checked={formData.segments.includes(seg.id)} onChange={e => {
                      const newSegs = e.target.checked ? [...formData.segments, seg.id] : formData.segments.filter(id => id !== seg.id);
                      setFormData({...formData, segments: newSegs});
                    }} style={{ width: '20px', height: '20px', accentColor: '#2563eb' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{seg.route}</div>
                      <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Flight: {seg.flight} • {seg.date} at {seg.time}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>Documentation Verification</div>
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>The airline requires physical verification of these documents before approval.</p>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.docs.passport} onChange={e => setFormData({...formData, docs: {...formData.docs, passport: e.target.checked}})} style={{ width: '18px', height: '18px', accentColor: '#2563eb' }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1e293b' }}>Minor's Original Passport / ID Verified</span>
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.docs.consent} onChange={e => setFormData({...formData, docs: {...formData.docs, consent: e.target.checked}})} style={{ width: '18px', height: '18px', accentColor: '#2563eb' }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1e293b' }}>Parent/Guardian Consent Letter Signed</span>
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.docs.form} onChange={e => setFormData({...formData, docs: {...formData.docs, form: e.target.checked}})} style={{ width: '18px', height: '18px', accentColor: '#2563eb' }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1e293b' }}>Delta Air Lines Official UMNR Form Completed</span>
                </label>
                
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1rem', background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '4px', marginTop: '1rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.docs.terms} onChange={e => setFormData({...formData, docs: {...formData.docs, terms: e.target.checked}})} style={{ width: '18px', height: '18px', marginTop: '0.2rem', accentColor: '#d97706' }} />
                  <div>
                     <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#b45309' }}>Agent Affirmation</span>
                     <p style={{ fontSize: '0.75rem', color: '#92400e', margin: '0.25rem 0 0 0' }}>I affirm that I have visually inspected all mandatory documentation according to airline policy.</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '3rem', textAlign: 'center', maxWidth: '500px', width: '100%', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
               {formData.approvalStatus === 'Pending' && (
                 <>
                   <Shield size={48} color="#94a3b8" style={{ marginBottom: '1rem' }} />
                   <h2 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '0.5rem' }}>Ready to Request Airline Approval</h2>
                   <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '2rem' }}>Send the UMNR service request to Delta Air Lines via the GDS channel.</p>
                   <button onClick={checkApproval} style={{ padding: '0.75rem 2rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}>Send Request</button>
                 </>
               )}
               {formData.approvalStatus === 'Processing' && (
                 <>
                   <Loader2 size={48} color="#2563eb" className="spin" style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
                   <h2 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '0.5rem' }}>Communicating with Airline...</h2>
                   <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Awaiting PNR confirmation response.</p>
                 </>
               )}
               {formData.approvalStatus === 'Approved' && (
                 <>
                   <CheckCircle2 size={48} color="#10b981" style={{ marginBottom: '1rem' }} />
                   <h2 style={{ fontSize: '1.25rem', color: '#166534', marginBottom: '0.5rem' }}>Airline Approval Granted</h2>
                   <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '2rem' }}>Delta Air Lines has successfully added the UMNR SSR to the PNR.</p>
                   <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '0.875rem', fontFamily: 'monospace', color: '#1e293b' }}>
                      SSR UMNR DL NN1 HK1 /P1/S2
                   </div>
                 </>
               )}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>Payment Summary</div>
              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.875rem', color: '#1e293b' }}>
                  <span>UMNR Service Fee (Delta Air Lines)</span>
                  <span style={{ fontWeight: 600 }}>$150.00</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.875rem', color: '#1e293b' }}>
                  <span>Agency Processing Fee</span>
                  <span style={{ fontWeight: 600 }}>$25.00</span>
                </div>
                <div style={{ borderTop: '1px solid #e2e8f0', margin: '1rem 0' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.125rem', color: '#1e293b', fontWeight: 700 }}>
                  <span>Total Amount Due</span>
                  <span style={{ color: '#2563eb' }}>$175.00</span>
                </div>
              </div>
            </div>

            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>Payment Method</div>
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>Cardholder Name</label>
                  <input type="text" defaultValue="John Smith" style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.875rem', color: '#1e293b', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>Card Number</label>
                  <div style={{ position: 'relative' }}>
                     <CreditCard size={18} color="#94a3b8" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)' }} />
                     <input type="text" placeholder="0000 0000 0000 0000" value={formData.payment.number} onChange={e => setFormData({...formData, payment: {...formData.payment, number: e.target.value}})} style={{ width: '100%', padding: '0.5rem 0.5rem 0.5rem 2rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.875rem', color: '#1e293b', outline: 'none' }} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>Expiry Date</label>
                    <input type="text" placeholder="MM/YY" value={formData.payment.exp} onChange={e => setFormData({...formData, payment: {...formData.payment, exp: e.target.value}})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.875rem', color: '#1e293b', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>CVV</label>
                    <input type="password" placeholder="123" value={formData.payment.cvv} onChange={e => setFormData({...formData, payment: {...formData.payment, cvv: e.target.value}})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.875rem', color: '#1e293b', outline: 'none' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
             <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
               <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>Pre-Flight Summary Checklist</div>
               <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                     <CheckCircle2 size={24} color="#10b981" />
                     <div>
                       <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.875rem' }}>Passenger Identified</div>
                       <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{formData.minorName} (Age {formData.minorAge}) verified.</div>
                     </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                     <CheckCircle2 size={24} color="#10b981" />
                     <div>
                       <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.875rem' }}>Contacts Confirmed</div>
                       <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Drop-off & Pick-up handlers established.</div>
                     </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                     <CheckCircle2 size={24} color="#10b981" />
                     <div>
                       <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.875rem' }}>Airline Approved</div>
                       <div style={{ fontSize: '0.75rem', color: '#64748b' }}>UMNR SSR added to PNR ABC123.</div>
                     </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                     <CheckCircle2 size={24} color="#10b981" />
                     <div>
                       <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.875rem' }}>Payment Collected</div>
                       <div style={{ fontSize: '0.75rem', color: '#64748b' }}>$175.00 charged to Customer Card.</div>
                     </div>
                  </div>
               </div>
             </div>
          </div>
        );

      case 8:
        return (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>Airport Handover Tracking</div>
              <div style={{ padding: '2rem 1.5rem' }}>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '11px', top: '10px', bottom: '10px', width: '2px', background: '#e2e8f0', zIndex: 0 }}></div>
                    
                    <div style={{ display: 'flex', gap: '1rem', position: 'relative', zIndex: 1 }}>
                       <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#3b82f6', border: '4px solid white', flexShrink: 0, boxShadow: '0 0 0 1px #e2e8f0' }}></div>
                       <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.25rem' }}>Origin Airport Drop-off (JFK)</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.75rem' }}>To be handled by: {formData.contacts.dropName || 'Not Set'}</div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input type="time" value={formData.handover.dropTime} onChange={e => setFormData({...formData, handover: {...formData.handover, dropTime: e.target.value}})} style={{ padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.75rem', outline: 'none' }} />
                            <button style={{ padding: '0.4rem 1rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Log Event</button>
                          </div>
                       </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', position: 'relative', zIndex: 1 }}>
                       <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#e2e8f0', border: '4px solid white', flexShrink: 0, boxShadow: '0 0 0 1px #e2e8f0' }}></div>
                       <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.25rem' }}>Destination Airport Pick-up (MIA)</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.75rem' }}>To be handled by: {formData.contacts.pickName || 'Not Set'}</div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input type="time" value={formData.handover.pickTime} onChange={e => setFormData({...formData, handover: {...formData.handover, pickTime: e.target.value}})} style={{ padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.75rem', outline: 'none' }} />
                            <button style={{ padding: '0.4rem 1rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Log Event</button>
                          </div>
                       </div>
                    </div>

                 </div>
              </div>
            </div>
          </div>
        );

      case 9:
        return (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div id="umnr-receipt" style={{ background: 'white', padding: '3rem', borderRadius: '6px', border: '1px solid #e2e8f0', maxWidth: '600px', width: '100%', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
               <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                  <div style={{ width: '64px', height: '64px', background: '#10b981', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 4px 10px rgba(16,185,129,0.3)' }}>
                    <Check size={32} />
                  </div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>UMNR Booking Complete</h2>
                  <p style={{ fontSize: '0.875rem', color: '#64748b' }}>The Unaccompanied Minor service for {formData.minorName} has been fully confirmed and documented under PNR ABC123.</p>
               </div>
               
               <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', '@media print': { display: 'none' } }}>
                 <button onClick={generatePDF} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'white', color: '#1e293b', border: '1px solid #cbd5e1', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}>
                    <Download size={16} /> Download Receipt
                 </button>
               </div>
            </div>
          </div>
        );

      default: return null;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', background: '#fcfcfc', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ background: 'white', padding: '1.5rem 2rem 1rem 2rem', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>UMNR Service</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.5rem', border: '1px solid #10b981', borderRadius: '4px', color: '#10b981', background: '#f0fdf4', fontSize: '0.75rem', fontWeight: 600 }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', border: '1px solid currentColor' }}></div> Draft
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={handlePrev} disabled={currentStep === 1} style={{ padding: '0.5rem 1.5rem', background: 'white', border: '1px solid #cbd5e1', borderRadius: '4px', fontWeight: 600, color: currentStep === 1 ? '#94a3b8' : '#475569', cursor: currentStep === 1 ? 'not-allowed' : 'pointer' }}>Back</button>
            <button onClick={handleNext} disabled={currentStep === 9 || (currentStep === 5 && formData.approvalStatus !== 'Approved')} style={{ padding: '0.5rem 1.5rem', background: '#2563eb', border: 'none', borderRadius: '4px', fontWeight: 600, color: 'white', cursor: (currentStep === 9 || (currentStep === 5 && formData.approvalStatus !== 'Approved')) ? 'not-allowed' : 'pointer', opacity: (currentStep === 9 || (currentStep === 5 && formData.approvalStatus !== 'Approved')) ? 0.5 : 1 }}>Save & Next</button>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', paddingBottom: '0.5rem' }}>
          <div style={{ position: 'absolute', top: '15px', left: '20px', right: '20px', height: '2px', background: '#e2e8f0', zIndex: 1 }}></div>
          {steps.map((step) => {
            const isCurrent = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            return (
              <div key={step.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, background: 'white', padding: '0 0.5rem' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: (isCurrent || isCompleted) ? '#2563eb' : 'white', border: `1px solid ${(isCurrent || isCompleted) ? '#2563eb' : '#cbd5e1'}`, color: (isCurrent || isCompleted) ? 'white' : '#64748b', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  {isCompleted ? <Check size={16} /> : step.id}
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: isCurrent ? 600 : 500, color: isCurrent ? '#2563eb' : (isCompleted ? '#1e293b' : '#64748b'), whiteSpace: 'nowrap' }}>
                  {step.title}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ flex: 1, padding: '1.5rem 2rem', overflowY: 'auto' }}>
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', gap: '3rem' }}>
            <div><div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem', fontWeight: 500 }}>Booking ID</div><div style={{ fontSize: '0.875rem', color: '#1e293b', fontWeight: 500 }}>BKG-240724-00125</div></div>
            <div><div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem', fontWeight: 500 }}>PNR</div><div style={{ fontSize: '0.875rem', color: '#1e293b', fontWeight: 500 }}>ABC123</div></div>
            <div><div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem', fontWeight: 500 }}>Customer</div><div style={{ fontSize: '0.875rem', color: '#1e293b', fontWeight: 500 }}>John Smith</div></div>
            <div><div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem', fontWeight: 500 }}>Booking Date</div><div style={{ fontSize: '0.875rem', color: '#1e293b', fontWeight: 500 }}>24 Jul 2024</div></div>
            <div><div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem', fontWeight: 500 }}>Travel Date</div><div style={{ fontSize: '0.875rem', color: '#1e293b', fontWeight: 500 }}>10 Aug 2024</div></div>
            <div><div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem', fontWeight: 500 }}>Status</div><div style={{ fontSize: '0.875rem', color: '#1e293b', fontWeight: 500 }}>Draft</div></div>
          </div>
          <div><button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'white', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.875rem', fontWeight: 500, color: '#475569', cursor: 'pointer' }}>View Booking <ExternalLink size={16} /></button></div>
        </div>
        
        {renderStepContent()}

        {currentStep === 1 && (
           <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
             <button onClick={handlePrev} disabled style={{ padding: '0.5rem 1.5rem', background: 'white', border: '1px solid #cbd5e1', borderRadius: '4px', fontWeight: 600, color: '#94a3b8', cursor: 'not-allowed' }}>Cancel</button>
             <button onClick={handleNext} style={{ padding: '0.5rem 1.5rem', background: '#2563eb', border: 'none', borderRadius: '4px', fontWeight: 600, color: 'white', cursor: 'pointer' }}>Save & Next →</button>
           </div>
        )}
      </div>
    </div>
  );
};

export default UmnrBooking;
