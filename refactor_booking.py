import re

file_path = r"c:\zsm-travel\src\pages\NewBooking.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Replace Steps
new_steps = """const steps = [
  { id: 1, title: 'Passenger & Payment', icon: <User size={18} /> },
  { id: 2, title: 'Flight & Breakdown', icon: <Plane size={18} /> }
];"""
content = re.sub(r'const steps = \[\s*\{ id: 1,.*?\];', new_steps, content, flags=re.DOTALL)

# 2. Update formData
formData_pattern = r'const \[formData, setFormData\] = useState\(\{(.*?)\}\);'
new_formData = r"""const [formData, setFormData] = useState({\1, paymentType: 'Customer Card'});"""
content = re.sub(formData_pattern, new_formData, content, flags=re.DOTALL)

# 3. Add paymentType toggle into Payment section
# We'll extract the Passenger Details block, Merchant/Vendor block, Payment block.
# Actually, it's easier to just do a string replacement on renderStep.
# Let's find the start and end of renderStep.
start_str = "const renderStep = () => {\n    switch(currentStep) {"
end_str = "      default:\n        return null;\n    }\n  };"

start_idx = content.find(start_str)
end_idx = content.find(end_str) + len(end_str)

render_step_content = content[start_idx:end_idx]

# Extract Case 1 (Flight Selection)
case1_start = render_step_content.find("case 1:")
case2_start = render_step_content.find("case 2:")
case3_start = render_step_content.find("case 3:")
case4_start = render_step_content.find("case 4:")
case5_start = render_step_content.find("case 5:")

flight_selection = render_step_content[case1_start+7:case2_start].strip()
passenger_details = render_step_content[case2_start+7:case3_start].strip()

# Extract the body inside the return statements
def extract_return_body(case_text):
    match = re.search(r'return\s*\(\s*(<div.*?</div>)\s*\);', case_text, re.DOTALL)
    if match:
        return match.group(1)
    
    # fallback, find first <div and last </div> before break or end
    s = case_text.find("return (")
    if s == -1: return ""
    s += 8
    
    # count braces
    depth = 1
    for i in range(s, len(case_text)):
        if case_text[i:i+8] == "return (": pass
        elif case_text[i] == "(": depth += 1
        elif case_text[i] == ")": 
            depth -= 1
            if depth == 0:
                return case_text[s:i].strip()
    return ""

flight_body = extract_return_body(render_step_content[case1_start:case2_start])
passenger_body = extract_return_body(render_step_content[case2_start:case3_start])

# Create new renderStep
new_render_step = f"""const renderStep = () => {{
    switch(currentStep) {{
      case 1:
        return (
          <div className="animate-fade-in" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Passenger Details */}
            {passenger_body}

            {/* Merchant and Vendor */}
            <div style={{ background: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
               <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                 <Briefcase size={20} style={{ color: 'var(--primary-accent)' }} /> Agency Details
               </h2>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                 <div>
                   <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Merchant Name</label>
                   <select value={{formData.merchantName || ''}} onChange={{(e) => setFormData({{{{'...'}}formData, merchantName: e.target.value}})}} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'white' }}>
                     <option value="">Select Merchant</option>
                     <option value="ZSM Travel">ZSM Travel</option>
                     <option value="Global Travels">Global Travels</option>
                     <option value="Aero Tickets">Aero Tickets</option>
                   </select>
                 </div>
                 <div>
                   <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Vendor Code</label>
                   <select value={{formData.vendorCode || ''}} onChange={{(e) => setFormData({{{{'...'}}formData, vendorCode: e.target.value}})}} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'white' }}>
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
                    onClick={{() => setFormData({{{{'...'}}formData, paymentType: 'Company Card'}})}}
                    style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', border: 'none', background: formData.paymentType === 'Company Card' ? 'white' : 'transparent', color: formData.paymentType === 'Company Card' ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', boxShadow: formData.paymentType === 'Company Card' ? 'var(--shadow-sm)' : 'none' }}
                  >
                    Company Card
                  </button>
                  <button 
                    onClick={{() => setFormData({{{{'...'}}formData, paymentType: 'Customer Card'}})}}
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
                    <input type="text" value={{formData.cardNumber}} onChange={{handleCardNumberChange}} onBlur={{() => handleCardBlur('cardNumber')}} placeholder="0000 0000 0000 0000" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: `1px solid ${{cardErrors.cardNumber ? 'var(--danger)' : 'var(--border-color)'}}`, outline: 'none' }} />
                  </div>
                  {{cardErrors.cardNumber && <div style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{{cardErrors.cardNumber}}</div>}}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Expiry Date</label>
                  <input type="text" value={{formData.expiryDate}} onChange={{handleExpiryChange}} onBlur={{() => handleCardBlur('expiryDate')}} placeholder="MM/YY" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: `1px solid ${{cardErrors.expiryDate ? 'var(--danger)' : 'var(--border-color)'}}`, outline: 'none' }} />
                  {{cardErrors.expiryDate && <div style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{{cardErrors.expiryDate}}</div>}}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>CVV</label>
                  <input type="password" value={{formData.cvv}} onChange={{handleCvvChange}} onBlur={{() => handleCardBlur('cvv')}} placeholder="123" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: `1px solid ${{cardErrors.cvv ? 'var(--danger)' : 'var(--border-color)'}}`, outline: 'none' }} />
                  {{cardErrors.cvv && <div style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{{cardErrors.cvv}}</div>}}
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginTop: '1.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={{formData.paymentAgreed}} onChange={{(e) => setFormData({{{{'...'}}formData, paymentAgreed: e.target.checked}})}} style={{ marginTop: '0.25rem' }} />
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  I confirm that I am authorized to use this {{formData.paymentType}} and agree to the booking terms and conditions.
                </span>
              </label>
            </div>
            
          </div>
        );
      case 2:
        return (
          <div className="animate-fade-in" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {flight_body}
            
            {/* Cost Breakdown */}
            <div style={{ background: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
               <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                 <DollarSign size={20} style={{ color: 'var(--primary-accent)' }} /> Cost Breakdown
               </h2>
               
               <div style={{ borderTop: '1px dashed var(--border-color)', borderBottom: '1px dashed var(--border-color)', padding: '1.5rem 0', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', alignItems: 'center' }}>
                   <span style={{ color: 'var(--text-secondary)' }}>Flight Fare ({{formData.passengersCount}}x)</span>
                   <span style={{ fontWeight: 600 }}>${{baseFare.toFixed(2)}}</span>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', alignItems: 'center' }}>
                   <span style={{ color: 'var(--text-secondary)' }}>Taxes & Carrier Imposed Fees</span>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                     <span style={{ fontWeight: 600 }}>$</span>
                     <input type="number" step="0.01" value={{formData.customTaxes !== null ? formData.customTaxes : taxes.toFixed(2)}} onChange={{(e) => setFormData({{{{'...'}}formData, customTaxes: e.target.value === '' ? null : parseFloat(e.target.value) || 0}})}} style={{ width: '80px', padding: '0.25rem 0.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', textAlign: 'right', fontWeight: 600, outline: 'none' }} />
                   </div>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', alignItems: 'center' }}>
                   <span style={{ color: 'var(--text-secondary)' }}>ZSM Service Fee</span>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                     <span style={{ fontWeight: 600 }}>$</span>
                     <input type="number" step="0.01" value={{formData.customServiceFee !== null ? formData.customServiceFee : serviceFee.toFixed(2)}} onChange={{(e) => setFormData({{{{'...'}}formData, customServiceFee: e.target.value === '' ? null : parseFloat(e.target.value) || 0}})}} style={{ width: '80px', padding: '0.25rem 0.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', textAlign: 'right', fontWeight: 600, outline: 'none' }} />
                   </div>
                 </div>
               </div>
               
               <div style={{ textAlign: 'center' }}>
                 <div style={{ display: 'inline-block', background: 'var(--bg-base)', padding: '0.75rem 2rem', borderRadius: 'var(--radius-full)', fontWeight: 700, letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                   TOTAL AMOUNT TO CHARGE
                 </div>
                 <h3 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--success)' }}>${{totalCost.toFixed(2)}}</h3>
               </div>
            </div>
          </div>
        );
      case 3:
"""
# Re-add case 5 (which is now case 3 for confirmation)
case5_content = render_step_content[case5_start+7:render_step_content.find("default:")].strip()
new_render_step += f"\n        {case5_content}\n      default:\n        return null;\n    }}\n  }};"

# Apply fix for '{...formData' which was problematic due to f-string formatting
new_render_step = new_render_step.replace("{'...'}", "...")

content = content.replace(render_step_content, new_render_step)

# 4. Update the "isStepValid" logic and Navigation buttons
validation_pattern = r"const isStep1Valid = .*?const isNextDisabled = .*?;"
new_validation = """const isStep1Valid = formData.passengers.every(p => p.firstName.trim() && p.lastName.trim() && p.dob && p.phone.trim()) && formData.merchantName && formData.vendorCode && formData.paymentAgreed && isCardValid;
  const isStep2Valid = tripType === 'Round Trip' ? (formData.outboundFlight && formData.inboundFlight) : (formData.outboundFlight !== null);
  
  const isNextDisabled = (currentStep === 1 && !isStep1Valid) || (currentStep === 2 && !isStep2Valid);"""
content = re.sub(validation_pattern, new_validation, content, flags=re.DOTALL)

# Update navigation buttons logic
nav_pattern = r"{currentStep < 5 && \((.*?)\)}.*{currentStep === 5 && \("
new_nav = """{currentStep < 3 && (
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
            
            {currentStep === 3 && ("""
content = re.sub(nav_pattern, new_nav, content, flags=re.DOTALL)


with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
