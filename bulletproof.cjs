const fs = require('fs');

const filePath = 'c:\\zsm-travel\\src\\pages\\NewBooking.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Replace steps
content = content.replace(
`const steps = [
  { id: 1, title: 'Flight Selection', icon: <Search size={18} /> },
  { id: 2, title: 'Passenger Details', icon: <User size={18} /> },
  { id: 3, title: 'Payment', icon: <CreditCard size={18} /> },
  { id: 4, title: 'Cost Breakdown', icon: <DollarSign size={18} /> },
  { id: 5, title: 'Confirmation', icon: <Check size={18} /> }
];`,
`const steps = [
  { id: 1, title: 'Passenger & Payment', icon: <User size={18} /> },
  { id: 2, title: 'Flight & Breakdown', icon: <Plane size={18} /> }
];`
);

// 2. Add paymentType to formData
content = content.replace(
  `paymentAgreed: false`,
  `paymentAgreed: false,\n      paymentType: 'Customer Card'`
);

// 3. Extract the components from renderStep
// We know exactly what to extract from the pristine file.
const flightSelectionStart = content.indexOf(`{/* OUTBOUND COLUMN */}`);
const flightSelectionEnd = content.indexOf(`</button>\n                </div>\n              </div>\n\n            </div>\n          </div>\n        );`);
const flightSelection = content.substring(flightSelectionStart, flightSelectionEnd + `</button>\n                </div>\n              </div>\n\n            </div>`.length);

const passengerDetailsStart = content.indexOf(`{/* PRIMARY PASSENGER */}`);
const passengerDetailsEnd = content.indexOf(`            </div>\n          </div>\n        );`);
const passengerDetails = content.substring(passengerDetailsStart, passengerDetailsEnd + `            </div>`.length);

const case5Start = content.indexOf(`<div style={{ \n              width: '80px', height: '80px', borderRadius: '50%',`);
const case5End = content.indexOf(`</button>\n              </div>\n            </div>\n          </div>\n        );`);
const case5Content = content.substring(case5Start, case5End + `</button>\n              </div>\n            </div>\n          </div>`.length);

// 4. Construct new renderStep
const newRenderStep = `const renderStep = () => {
    switch(currentStep) {
      case 1:
        return (
          <div className="animate-fade-in" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Passenger Details */}
            ${passengerDetails}

            {/* Merchant and Vendor */}
            <div style={{ background: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
               <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                 <Briefcase size={20} style={{ color: 'var(--primary-accent)' }} /> Agency Details
               </h2>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                 <div>
                   <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Merchant Name</label>
                   <select value={formData.merchantName || ''} onChange={(e) => setFormData({...formData, merchantName: e.target.value})} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'white' }}>
                     <option value="">Select Merchant</option>
                     <option value="ZSM Travel">ZSM Travel</option>
                     <option value="Global Travels">Global Travels</option>
                     <option value="Aero Tickets">Aero Tickets</option>
                   </select>
                 </div>
                 <div>
                   <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Vendor Code</label>
                   <select value={formData.vendorCode || ''} onChange={(e) => setFormData({...formData, vendorCode: e.target.value})} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'white' }}>
                     <option value="">Select Vendor Code</option>
                     <option value="VND-001">VND-001</option>
                     <option value="VND-002">VND-002</option>
                     <option value="VND-003">VND-003</option>
                   </select>
                 </div>
               </div>
            </div>

            {/* Payment Details */}
            <div style={{ background: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <CreditCard size={20} style={{ color: 'var(--primary-accent)' }} /> Payment Details
                </h2>
                
                <div style={{ display: 'flex', background: 'var(--bg-base)', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
                  <button 
                    onClick={() => setFormData({...formData, paymentType: 'Company Card'})}
                    style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', border: 'none', background: formData.paymentType === 'Company Card' ? 'white' : 'transparent', color: formData.paymentType === 'Company Card' ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', boxShadow: formData.paymentType === 'Company Card' ? 'var(--shadow-sm)' : 'none' }}
                  >
                    Company Card
                  </button>
                  <button 
                    onClick={() => setFormData({...formData, paymentType: 'Customer Card'})}
                    style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', border: 'none', background: formData.paymentType === 'Customer Card' ? 'white' : 'transparent', color: formData.paymentType === 'Customer Card' ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', boxShadow: formData.paymentType === 'Customer Card' ? 'var(--shadow-sm)' : 'none' }}
                  >
                    Customer Card
                  </button>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Card Number</label>
                  <div style={{ position: 'relative' }}>
                    <input type="text" value={formData.cardNumber} onChange={handleCardNumberChange} onBlur={() => handleCardBlur('cardNumber')} placeholder="0000 0000 0000 0000" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: \`1px solid \${cardErrors.cardNumber ? 'var(--danger)' : 'var(--border-color)'}\`, outline: 'none' }} />
                  </div>
                  {cardErrors.cardNumber && <div style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{cardErrors.cardNumber}</div>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Expiry Date</label>
                  <input type="text" value={formData.expiryDate} onChange={handleExpiryChange} onBlur={() => handleCardBlur('expiryDate')} placeholder="MM/YY" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: \`1px solid \${cardErrors.expiryDate ? 'var(--danger)' : 'var(--border-color)'}\`, outline: 'none' }} />
                  {cardErrors.expiryDate && <div style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{cardErrors.expiryDate}</div>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>CVV</label>
                  <input type="password" value={formData.cvv} onChange={handleCvvChange} onBlur={() => handleCardBlur('cvv')} placeholder="123" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: \`1px solid \${cardErrors.cvv ? 'var(--danger)' : 'var(--border-color)'}\`, outline: 'none' }} />
                  {cardErrors.cvv && <div style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{cardErrors.cvv}</div>}
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginTop: '1.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={formData.paymentAgreed} onChange={(e) => setFormData({...formData, paymentAgreed: e.target.checked})} style={{ marginTop: '0.25rem' }} />
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  I confirm that I am authorized to use this {formData.paymentType} and agree to the booking terms and conditions.
                </span>
              </label>
            </div>
            
          </div>
        );
      case 2:
        return (
          <div className="animate-fade-in" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ background: 'white', padding: '0.5rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)', display: 'inline-flex', marginBottom: '2rem' }}>
               <button 
                  onClick={() => setTripType('Round Trip')}
                  style={{ padding: '0.5rem 1.5rem', borderRadius: 'var(--radius-full)', background: tripType === 'Round Trip' ? 'var(--primary-accent)' : 'transparent', color: tripType === 'Round Trip' ? 'white' : 'var(--text-secondary)', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
               >Round Trip</button>
               <button 
                  onClick={() => setTripType('One Way')}
                  style={{ padding: '0.5rem 1.5rem', borderRadius: 'var(--radius-full)', background: tripType === 'One Way' ? 'var(--primary-accent)' : 'transparent', color: tripType === 'One Way' ? 'white' : 'var(--text-secondary)', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
               >One Way</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
              ${flightSelection}
            </div>
            
            {/* Cost Breakdown */}
            <div style={{ background: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
               <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                 <DollarSign size={20} style={{ color: 'var(--primary-accent)' }} /> Cost Breakdown
               </h2>
               
               <div style={{ borderTop: '1px dashed var(--border-color)', borderBottom: '1px dashed var(--border-color)', padding: '1.5rem 0', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', alignItems: 'center' }}>
                   <span style={{ color: 'var(--text-secondary)' }}>Flight Fare ({formData.passengersCount}x)</span>
                   <span style={{ fontWeight: 600 }}>\${baseFare.toFixed(2)}</span>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', alignItems: 'center' }}>
                   <span style={{ color: 'var(--text-secondary)' }}>Taxes & Carrier Imposed Fees</span>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                     <span style={{ fontWeight: 600 }}>$</span>
                     <input type="number" step="0.01" value={formData.customTaxes !== null ? formData.customTaxes : taxes.toFixed(2)} onChange={(e) => setFormData({...formData, customTaxes: e.target.value === '' ? null : parseFloat(e.target.value) || 0})} style={{ width: '80px', padding: '0.25rem 0.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', textAlign: 'right', fontWeight: 600, outline: 'none' }} />
                   </div>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', alignItems: 'center' }}>
                   <span style={{ color: 'var(--text-secondary)' }}>ZSM Service Fee</span>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                     <span style={{ fontWeight: 600 }}>$</span>
                     <input type="number" step="0.01" value={formData.customServiceFee !== null ? formData.customServiceFee : serviceFee.toFixed(2)} onChange={(e) => setFormData({...formData, customServiceFee: e.target.value === '' ? null : parseFloat(e.target.value) || 0})} style={{ width: '80px', padding: '0.25rem 0.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', textAlign: 'right', fontWeight: 600, outline: 'none' }} />
                   </div>
                 </div>
               </div>
               
               <div style={{ textAlign: 'center' }}>
                 <div style={{ display: 'inline-block', background: 'var(--bg-base)', padding: '0.75rem 2rem', borderRadius: 'var(--radius-full)', fontWeight: 700, letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                   TOTAL AMOUNT TO CHARGE
                 </div>
                 <h3 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--success)' }}>\${totalCost.toFixed(2)}</h3>
               </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="animate-fade-in" style={{ width: '100%', textAlign: 'center', padding: '3rem 1rem' }}>
            ${case5Content}
          </div>
        );
      default:
        return null;
    }
  };`;

// Replace renderStep entirely
const renderStepStart = content.indexOf(`const renderStep = () => {`);
const renderStepEnd = content.indexOf(`default:\n        return null;\n    }\n  };`);
content = content.substring(0, renderStepStart) + newRenderStep + content.substring(renderStepEnd + `default:\n        return null;\n    }\n  };`.length);

// 5. Replace Validation and Navigation
content = content.replace(
`const isStep1Valid = tripType === 'Round Trip' ? (formData.outboundFlight && formData.inboundFlight) : (formData.outboundFlight !== null);
  const isStep2Valid = formData.passengers.every(p => p.firstName.trim() && p.lastName.trim() && p.dob && p.phone.trim());
  
  const isNextDisabled = (currentStep === 1 && !isStep1Valid) || (currentStep === 2 && !isStep2Valid) || (currentStep === 3 && (!formData.paymentAgreed || !isCardValid));`,
`const isStep1Valid = formData.passengers.every(p => p.firstName.trim() && p.lastName.trim() && p.dob && p.phone.trim()) && formData.merchantName && formData.vendorCode && formData.paymentAgreed && isCardValid;
  const isStep2Valid = tripType === 'Round Trip' ? (formData.outboundFlight && formData.inboundFlight) : (formData.outboundFlight !== null);
  
  const isNextDisabled = (currentStep === 1 && !isStep1Valid) || (currentStep === 2 && !isStep2Valid);`
);

const navStart = content.indexOf(`{currentStep < 5 && (`);
const navEnd = content.indexOf(`{currentStep === 5 && (`);
const newNav = `{currentStep < 3 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                <button 
                  onClick={handlePrev}
                  disabled={currentStep === 1}
                  style={{ 
                    opacity: currentStep === 1 ? 0.5 : 1,
                    pointerEvents: currentStep === 1 ? 'none' : 'auto',
                    padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                    background: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-base)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                >
                  <ChevronLeft size={18} /> Back
                </button>
                
                <button 
                  onClick={handleNext}
                  disabled={isNextDisabled}
                  style={{ 
                    padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                    background: isNextDisabled ? 'var(--text-muted)' : 'var(--primary-accent)',
                    border: 'none', borderRadius: 'var(--radius-md)', color: 'white', fontWeight: 600, 
                    cursor: isNextDisabled ? 'not-allowed' : 'pointer',
                    transition: 'opacity 0.2s',
                  }}
                  onMouseOver={(e) => { if(!e.currentTarget.disabled) e.currentTarget.style.opacity = 0.9; }}
                  onMouseOut={(e) => { if(!e.currentTarget.disabled) e.currentTarget.style.opacity = 1; }}
                >
                  {currentStep === 2 ? 'Confirm & Ticket' : 'Continue'} <ChevronRight size={18} />
                </button>
              </div>
            )}
            
            {currentStep === 3 && (`;

content = content.substring(0, navStart) + newNav + content.substring(navEnd + `{currentStep === 5 && (`.length);

fs.writeFileSync(filePath, content, 'utf8');
console.log("SUCCESS!");
