import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DollarSign, CreditCard, ShieldCheck, History, Edit3, Save, X, Activity, AlertCircle } from 'lucide-react';

const BoardingPassCharges = ({ flight }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin' || user?.role === 'Super Admin';
  
  // Mock Initial Data based on flight
  const [charges, setCharges] = useState({
    baseAirfare: 950.00,
    taxes: 125.50,
    airlineFees: 45.00,
    seatSelection: 25.00,
    checkedBaggage: 60.00,
    cabinBaggage: 0.00,
    extraBaggage: 0.00,
    travelInsurance: 35.00,
    petBookingCharges: 0.00,
    umnrCharges: 0.00,
    mealCharges: 15.00,
    changeItineraryCharges: 0.00,
    cancellationProtection: 0.00,
    vendorServiceFee: 10.00,
    bookingServiceFee: 25.00,
    paymentGatewayFee: 5.30,
    otherCharges: 0.00,
    discounts: 50.00
  });

  const [auditLogs, setAuditLogs] = useState([
    { id: 1, user: 'System', date: new Date(Date.now() - 86400000).toISOString(), field: 'discounts', prev: 0, updated: 50, reason: 'Initial Promotional Discount applied' }
  ]);

  const [editMode, setEditMode] = useState(false);
  const [tempCharges, setTempCharges] = useState({ ...charges });
  const [editReason, setEditReason] = useState('');
  const [agentVerified, setAgentVerified] = useState(false);

  // Payment Info Mock
  const paymentInfo = {
    method: 'Credit Card',
    cardType: 'Visa',
    last4: '4587',
    authCode: 'AUTH125632',
    transactionId: 'TXN-987456',
    merchant: 'ZSM Travel',
    vendorCode: 'VND-0048',
    paymentDate: '-',
    status: 'Pending'
  };

  const currencyInfo = {
    bookingCurrency: 'USD',
    exchangeRate: 89.24,
    localCurrency: 'INR'
  };

  // Re-sync when flight changes (simulate fetching new data)
  useEffect(() => {
    const newCharges = {
      ...charges,
      baseAirfare: 800 + Math.random() * 300,
      taxes: 100 + Math.random() * 50
    };
    setCharges(newCharges);
    setTempCharges(newCharges);
    setEditMode(true); // Automatically open in edit mode when a reservation is selected
    setAgentVerified(false);
  }, [flight?.id]);

  const calculateTotal = (chargeObj) => {
    let total = 0;
    Object.keys(chargeObj).forEach(key => {
      if (key !== 'discounts') {
        total += parseFloat(chargeObj[key]) || 0;
      }
    });
    total -= parseFloat(chargeObj.discounts) || 0;
    return total;
  };

  const currentTotal = calculateTotal(charges);
  const localEquivalent = currentTotal * currencyInfo.exchangeRate;

  const handleTempChange = (e, field) => {
    setTempCharges(prev => ({ ...prev, [field]: parseFloat(e.target.value) || 0 }));
  };

  const saveChanges = () => {
    if (!editReason.trim()) {
      alert("Please provide a reason for these changes for the audit log.");
      return;
    }

    const newLogs = [];
    Object.keys(tempCharges).forEach(key => {
      if (tempCharges[key] !== charges[key]) {
        newLogs.push({
          id: Date.now() + Math.random(),
          user: 'Admin User', // Mock current user
          date: new Date().toISOString(),
          field: key,
          prev: charges[key],
          updated: tempCharges[key],
          reason: editReason
        });
      }
    });

    if (newLogs.length > 0) {
      setAuditLogs(prev => [...newLogs, ...prev]);
    }
    
    setCharges(tempCharges);
    setEditMode(false);
    setEditReason('');
  };

  const handleChargeCard = () => {
    navigate('/payment', {
      state: {
        amount: currentTotal,
        passengerName: flight.passengerName,
        context: 'Boarding Pass Charges'
      }
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return { bg: '#dcfce3', color: '#166534' };
      case 'Pending': return { bg: '#fef3c7', color: '#b45309' };
      case 'Authorized': return { bg: '#e0e7ff', color: '#3730a3' };
      case 'Partially Paid': return { bg: '#fef08a', color: '#854d0e' };
      case 'Failed': return { bg: '#fee2e2', color: '#b91c1c' };
      case 'Refunded': return { bg: '#f3f4f6', color: '#374151' };
      case 'Voided': return { bg: '#f1f5f9', color: '#475569' };
      default: return { bg: '#f1f5f9', color: '#475569' };
    }
  };

  const statusStyle = getStatusColor(paymentInfo.status);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const chargeLabels = {
    baseAirfare: 'Base Airfare',
    taxes: 'Taxes',
    airlineFees: 'Airline Fees',
    seatSelection: 'Seat Selection',
    checkedBaggage: 'Checked Baggage',
    cabinBaggage: 'Cabin Baggage',
    extraBaggage: 'Extra Baggage',
    travelInsurance: 'Travel Insurance',
    petBookingCharges: 'Pet Booking Charges',
    umnrCharges: 'UMNR Charges',
    mealCharges: 'Meal Charges',
    changeItineraryCharges: 'Change Itinerary Charges',
    cancellationProtection: 'Cancellation Protection',
    vendorServiceFee: 'Vendor Service Fee',
    bookingServiceFee: 'Booking Service Fee',
    paymentGatewayFee: 'Payment Gateway Fee',
    otherCharges: 'Other Charges',
    discounts: 'Discounts'
  };

  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '32px', overflow: 'hidden' }} className="print-container">
      
      {/* Header */}
      <div style={{ backgroundColor: '#0f172a', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, color: 'white', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <DollarSign size={20} /> Boarding Pass Charges Summary
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} className="no-print">
          <span style={{ color: '#cbd5e1', fontSize: '13px' }}>Flight: <strong>{flight?.flightNumber || 'N/A'}</strong></span>
          <span style={{ color: '#cbd5e1', fontSize: '13px' }}>Passenger: <strong>{flight?.fullName || 'N/A'}</strong></span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
        
        {/* Left Column: Charges Table */}
        <div style={{ flex: '1 1 50%', padding: '24px', borderRight: '1px solid #e2e8f0', minWidth: '400px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#1e293b' }}>Detailed Charges Breakdown</h3>
            <button 
              className="no-print"
              onClick={() => {
                if (editMode) { setEditMode(false); setTempCharges({ ...charges }); } 
                else { setEditMode(true); setTempCharges({ ...charges }); }
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', color: '#3b82f6', cursor: 'pointer' }}
            >
              {editMode ? <><X size={14} /> Cancel Edit</> : <><Edit3 size={14} /> Edit Admin Controls</>}
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {Object.keys(charges).map(key => {
                const val = charges[key];
                // Only display if > 0, or if it's baseAirfare/taxes, or if it's discounts (which can be > 0 but is subtracted)
                if (!editMode && val === 0 && key !== 'baseAirfare' && key !== 'taxes') return null;
                
                return (
                  <tr key={key} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 0', fontSize: '14px', color: '#475569', fontWeight: key === 'discounts' ? '600' : '400' }}>
                      {chargeLabels[key]}
                    </td>
                    <td style={{ padding: '10px 0', textAlign: 'right', fontSize: '14px', color: key === 'discounts' ? '#16a34a' : '#0f172a', fontWeight: '500' }}>
                      {editMode ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                          $ <input 
                              type="number" 
                              value={tempCharges[key]} 
                              onChange={(e) => handleTempChange(e, key)}
                              style={{ width: '80px', padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'right', fontSize: '14px' }}
                            />
                        </div>
                      ) : (
                        key === 'discounts' && val > 0 ? `-${formatCurrency(val)}` : formatCurrency(val)
                      )}
                    </td>
                  </tr>
                );
              })}
              
              {editMode && (
                <tr style={{ backgroundColor: '#f8fafc' }}>
                  <td colSpan="2" style={{ padding: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Reason for Change (Required)</label>
                    <input 
                      type="text" 
                      value={editReason}
                      onChange={(e) => setEditReason(e.target.value)}
                      placeholder="e.g., Added extra baggage fee per customer request"
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box', marginBottom: '12px' }}
                    />
                    <button 
                      onClick={saveChanges}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', float: 'right' }}
                    >
                      <Save size={14} /> Save Changes
                    </button>
                    <div style={{ clear: 'both' }}></div>
                  </td>
                </tr>
              )}

              {/* Total Row */}
              <tr style={{ backgroundColor: '#eff6ff', borderTop: '2px solid #bfdbfe' }}>
                <td style={{ padding: '16px 8px', fontSize: '16px', fontWeight: '700', color: '#1e3a8a' }}>
                  Total Charges to Customer
                </td>
                <td style={{ padding: '16px 8px', textAlign: 'right', fontSize: '18px', fontWeight: '700', color: '#1e3a8a' }}>
                  {formatCurrency(editMode ? calculateTotal(tempCharges) : currentTotal)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Right Column: Payment & Multi-Currency */}
        <div style={{ flex: '1 1 40%', padding: '24px', backgroundColor: '#f8fafc', minWidth: '350px' }}>
          
          {/* Credit Card Notice */}
          <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fef3c7', borderLeft: '4px solid #f59e0b', padding: '16px', borderRadius: '6px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <ShieldCheck color="#f59e0b" size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', color: '#92400e', fontWeight: '700' }}>Payment Information</h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#92400e', lineHeight: '1.5' }}>
                The total amount shown above will be charged to the customer's credit card upon ticket issuance or as per the booking confirmation.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#1e293b' }}>Payment Details</h3>
            <span style={{ backgroundColor: statusStyle.bg, color: statusStyle.color, padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', border: `1px solid ${statusStyle.color}40` }}>
              {paymentInfo.status}
            </span>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Payment Method</div>
                <div style={{ fontSize: '13px', color: '#0f172a', fontWeight: '600' }}>{paymentInfo.method}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Card Type</div>
                <div style={{ fontSize: '13px', color: '#0f172a', fontWeight: '600' }}>{paymentInfo.cardType}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Card Number</div>
                <div style={{ fontSize: '13px', color: '#0f172a', fontWeight: '600' }}>**** **** **** {paymentInfo.last4}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Authorization</div>
                <div style={{ fontSize: '13px', color: '#0f172a', fontWeight: '600' }}>{paymentInfo.authCode}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Transaction ID</div>
                <div style={{ fontSize: '13px', color: '#0f172a', fontWeight: '600' }}>{paymentInfo.transactionId}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Merchant</div>
                <div style={{ fontSize: '13px', color: '#0f172a', fontWeight: '600' }}>{paymentInfo.merchant}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Vendor Code</div>
                <div style={{ fontSize: '13px', color: '#0f172a', fontWeight: '600' }}>{paymentInfo.vendorCode}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Payment Date</div>
                <div style={{ fontSize: '13px', color: '#0f172a', fontWeight: '600' }}>{paymentInfo.paymentDate}</div>
              </div>
            </div>
          </div>

          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#1e293b' }}>Currency Details</h3>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Booking Currency</div>
                <div style={{ fontSize: '13px', color: '#0f172a', fontWeight: '600' }}>{currencyInfo.bookingCurrency}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Charged Amount</div>
                <div style={{ fontSize: '14px', color: '#0ea5e9', fontWeight: '700' }}>{currencyInfo.bookingCurrency} {formatCurrency(editMode ? calculateTotal(tempCharges) : currentTotal).replace('$', '')}</div>
              </div>
            </div>
          </div>

          {/* Action Button: Charge Credit Card */}
          {paymentInfo.status !== 'Paid' && (
            <div className="no-print">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '13px', color: '#475569', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={agentVerified} 
                  onChange={(e) => setAgentVerified(e.target.checked)} 
                  style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                />
                I have verified all charges with the customer (Agent Check)
              </label>

              <button 
                onClick={handleChargeCard}
                disabled={editMode || !agentVerified || !isAdmin}
                style={{ 
                  width: '100%', 
                  padding: '14px', 
                  backgroundColor: (editMode || !agentVerified || !isAdmin) ? '#94a3b8' : '#2563eb', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  fontSize: '15px', 
                  fontWeight: '600', 
                  cursor: (editMode || !agentVerified || !isAdmin) ? 'not-allowed' : 'pointer', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  gap: '8px',
                  transition: 'background-color 0.2s',
                  boxShadow: (editMode || !agentVerified || !isAdmin) ? 'none' : '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
                }}
              >
                <CreditCard size={18} /> 
                Charge Boarding Pass
              </button>
              
              {!isAdmin && (
                <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: '#b91c1c', fontSize: '13px', justifyContent: 'center' }}>
                  <AlertCircle size={14} /> Only Admin Users have authority to charge.
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Audit Trail Section */}
      <div style={{ borderTop: '1px solid #e2e8f0', padding: '20px 24px' }} className="no-print">
        <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <History size={16} color="#64748b" /> Audit Trail Log
        </h3>
        {auditLogs.length === 0 ? (
          <div style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>No manual adjustments recorded.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {auditLogs.map(log => (
              <div key={log.id} style={{ display: 'flex', gap: '16px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                <div style={{ marginTop: '2px' }}>
                  <Activity size={16} color="#94a3b8" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>{log.user} modified <span style={{ color: '#0ea5e9' }}>{chargeLabels[log.field]}</span></div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>{new Date(log.date).toLocaleString()}</div>
                  </div>
                  <div style={{ fontSize: '13px', color: '#475569', marginBottom: '6px' }}>
                    Changed from <strong>{formatCurrency(log.prev)}</strong> to <strong>{formatCurrency(log.updated)}</strong>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>
                    "{log.reason}"
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default BoardingPassCharges;
