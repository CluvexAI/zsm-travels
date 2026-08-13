import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, ShieldCheck, Lock, ChevronLeft, CheckCircle, RefreshCw } from 'lucide-react';

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get passed data or set defaults
  const state = location.state || {};
  const amount = state.amount || 0.00;
  const passengerName = state.passengerName || 'Unknown Passenger';
  const context = state.context || 'General Payment';

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  // Payment Methods State
  const [paymentMethods, setPaymentMethods] = useState(() => {
    const saved = localStorage.getItem('zsm_payment_methods');
    if (saved) return JSON.parse(saved);
    return [
      { id: '1', type: 'VISA', last4: '4587', expiry: '12/28', label: 'Customer Saved Card' }
    ];
  });
  const [selectedMethodId, setSelectedMethodId] = useState(paymentMethods[0]?.id || '1');
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCard, setNewCard] = useState({ number: '', expiry: '', cvv: '', name: '' });

  // Input Formatting Handlers
  const handleNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Numeric only
    const truncated = value.slice(0, 16); // Max 16 digits
    const formatted = truncated.replace(/(\d{4})(?=\d)/g, '$1 '); // Auto-insert space every 4
    setNewCard({ ...newCard, number: formatted });
  };

  const handleExpiryChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    const truncated = value.slice(0, 4); // Max 4 digits
    
    let formatted = truncated;
    if (truncated.length > 2) {
      formatted = `${truncated.slice(0, 2)}/${truncated.slice(2)}`;
    }
    
    // Validate month 01-12
    if (formatted.length >= 2) {
      let month = parseInt(formatted.slice(0, 2), 10);
      if (month > 12) formatted = `12${formatted.slice(2)}`;
      else if (month === 0 && formatted.length === 2 && !e.target.value.endsWith('0')) formatted = `01${formatted.slice(2)}`;
    }
    
    setNewCard({ ...newCard, expiry: formatted });
  };

  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    const truncated = value.slice(0, 4); // Max 4 digits
    setNewCard({ ...newCard, cvv: truncated });
  };

  const handleNameChange = (e) => {
    // Letters, spaces, hyphens only
    const value = e.target.value.replace(/[^a-zA-Z\s\-]/g, '');
    setNewCard({ ...newCard, name: value });
  };

  const handleSaveCard = (e) => {
    e.preventDefault();
    if (!newCard.number || !newCard.expiry) return;
    
    // Clean number and extract last 4 digits
    const cleanNumber = newCard.number.replace(/\D/g, '');
    const last4 = cleanNumber.slice(-4).padStart(4, '0');
    // Determine type (basic mock)
    const type = cleanNumber.startsWith('5') ? 'MC' : (cleanNumber.startsWith('3') ? 'AMEX' : 'VISA');
    
    const newMethod = {
      id: Date.now().toString(),
      type,
      last4,
      expiry: newCard.expiry,
      label: newCard.name || 'New Saved Card'
    };
    
    const updatedMethods = [...paymentMethods, newMethod];
    setPaymentMethods(updatedMethods);
    localStorage.setItem('zsm_payment_methods', JSON.stringify(updatedMethods));
    
    setSelectedMethodId(newMethod.id);
    setShowAddCard(false);
    setNewCard({ number: '', expiry: '', cvv: '', name: '' });
  };

  // Auto-scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handlePayment = () => {
    setIsProcessing(true);
    
    // Simulate payment gateway delay
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      setTransactionId(`TXN-${Math.floor(100000 + Math.random() * 900000)}`);
    }, 1500);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  if (paymentSuccess) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 64px)', padding: '24px', backgroundColor: '#f8fafc' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '48px 32px', textAlign: 'center', maxWidth: '500px', width: '100%', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)' }}>
          <div style={{ width: '80px', height: '80px', backgroundColor: '#dcfce3', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 24px auto' }}>
            <CheckCircle size={48} color="#16a34a" />
          </div>
          
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: '0 0 16px 0' }}>Payment Successful</h2>
          <p style={{ fontSize: '16px', color: '#475569', margin: '0 0 8px 0', lineHeight: '1.5' }}>
            We've successfully charged <strong>{formatCurrency(amount)}</strong> for {passengerName}'s {context}.
          </p>
          <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 32px 0' }}>
            Transaction ID: {transactionId}
          </p>

          <div style={{ backgroundColor: '#f1f5f9', borderRadius: '8px', padding: '16px', marginBottom: '32px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#64748b', fontSize: '14px' }}>Date</span>
              <span style={{ color: '#0f172a', fontSize: '14px', fontWeight: '500' }}>{new Date().toLocaleDateString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#64748b', fontSize: '14px' }}>Payment Method</span>
              <span style={{ color: '#0f172a', fontSize: '14px', fontWeight: '500' }}>
                {paymentMethods.find(m => m.id === selectedMethodId)?.type} ending in {paymentMethods.find(m => m.id === selectedMethodId)?.last4}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '8px', marginTop: '8px' }}>
              <span style={{ color: '#64748b', fontSize: '14px', fontWeight: '600' }}>Total Paid</span>
              <span style={{ color: '#16a34a', fontSize: '16px', fontWeight: '700' }}>{formatCurrency(amount)}</span>
            </div>
          </div>

          <button 
            onClick={() => navigate(-1)}
            style={{ width: '100%', padding: '14px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
          >
            Return to Booking
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto', fontFamily: '"Inter", sans-serif' }}>
      
      <button 
        onClick={() => navigate(-1)}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0', fontSize: '14px', fontWeight: '500', marginBottom: '24px' }}
      >
        <ChevronLeft size={16} /> Back
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <div style={{ width: '48px', height: '48px', backgroundColor: '#dbeafe', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Lock size={24} color="#2563eb" />
        </div>
        <div>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '28px', fontWeight: '700', color: '#0f172a' }}>Secure Checkout</h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '15px' }}>Process payments securely with ZSM Travel</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px' }}>
        
        {/* Left Column: Payment Details */}
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={18} color="#2563eb" /> Select Payment Method
          </h2>
          
          {paymentMethods.map(method => (
            <div 
              key={method.id}
              onClick={() => setSelectedMethodId(method.id)}
              style={{ 
                border: selectedMethodId === method.id ? '2px solid #2563eb' : '1px solid #e2e8f0', 
                borderRadius: '12px', 
                padding: '20px', 
                backgroundColor: selectedMethodId === method.id ? '#eff6ff' : 'white', 
                marginBottom: '16px', 
                cursor: 'pointer', 
                position: 'relative',
                transition: 'all 0.2s'
              }}
            >
              {selectedMethodId === method.id && (
                <div style={{ position: 'absolute', top: '20px', right: '20px', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#2563eb', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'white' }}></div>
                </div>
              )}
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '32px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #cbd5e1', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '12px', fontWeight: 'bold', color: '#1e293b' }}>
                  {method.type}
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>{method.type} ending in {method.last4}</div>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>{method.label} • Expires {method.expiry}</div>
                </div>
              </div>
            </div>
          ))}

          {!showAddCard ? (
            <div 
              onClick={() => setShowAddCard(true)}
              style={{ border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '20px', backgroundColor: 'white', cursor: 'pointer', transition: 'border-color 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#475569', fontWeight: '500' }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = '#94a3b8'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
            >
              <CreditCard size={18} /> Add new payment method
            </div>
          ) : (
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', backgroundColor: 'white' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#0f172a' }}>Enter Card Details</h3>
              <form onSubmit={handleSaveCard}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '6px' }}>Card Number</label>
                  <input type="text" placeholder="0000 0000 0000 0000" value={newCard.number} onChange={handleNumberChange} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '6px' }}>Expiry</label>
                    <input type="text" placeholder="MM/YY" value={newCard.expiry} onChange={handleExpiryChange} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '6px' }}>CVV</label>
                    <input type="password" placeholder="123" value={newCard.cvv} onChange={handleCvvChange} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} required />
                  </div>
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '6px' }}>Name on Card</label>
                  <input type="text" placeholder="John Doe" value={newCard.name} onChange={handleNameChange} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} required />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" onClick={() => setShowAddCard(false)} style={{ flex: 1, padding: '10px', backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#475569', cursor: 'pointer', fontWeight: '500' }}>Cancel</button>
                  <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: '#2563eb', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer', fontWeight: '500' }}>Save Card</button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Right Column: Order Summary */}
        <div>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', margin: '0 0 20px 0' }}>Order Summary</h2>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
              <span style={{ color: '#475569' }}>Passenger</span>
              <span style={{ color: '#0f172a', fontWeight: '500' }}>{passengerName}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '14px', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px' }}>
              <span style={{ color: '#475569' }}>Context</span>
              <span style={{ color: '#0f172a', fontWeight: '500' }}>{context}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
              <span style={{ color: '#0f172a', fontSize: '16px', fontWeight: '600' }}>Total to Pay</span>
              <span style={{ color: '#2563eb', fontSize: '24px', fontWeight: '700' }}>{formatCurrency(amount)}</span>
            </div>
            
            <button 
              onClick={handlePayment}
              disabled={isProcessing}
              style={{ 
                width: '100%', 
                padding: '14px', 
                backgroundColor: isProcessing ? '#94a3b8' : '#2563eb', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                fontSize: '16px', 
                fontWeight: '600', 
                cursor: isProcessing ? 'not-allowed' : 'pointer', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                gap: '8px',
                transition: 'background-color 0.2s',
                boxShadow: isProcessing ? 'none' : '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
              }}
            >
              {isProcessing ? (
                <>
                  <style>{`
                    @keyframes spin { 100% { transform: rotate(360deg); } }
                    .animate-spin { animation: spin 1s linear infinite; }
                  `}</style>
                  <RefreshCw size={18} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ShieldCheck size={18} /> Pay {formatCurrency(amount)}
                </>
              )}
            </button>
            
            <p style={{ margin: '16px 0 0 0', fontSize: '12px', color: '#64748b', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px' }}>
              <Lock size={12} /> Payments are secure and encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
