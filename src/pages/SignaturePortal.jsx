import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlaneTakeoff, PenTool, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';
import { getMetadata, setMetadata } from '../services/supabase';

const SignaturePortal = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [isSigned, setIsSigned] = useState(false);
  const [signatureName, setSignatureName] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch from a backend.
    // Here we'll mock it by checking localStorage for the drafted booking if the ID matches B-23490
    // For demo purposes, we just create a mock booking object.
    const fetchData = async () => {
      setBooking({
        bookingId: bookingId || 'B-23490',
        customerId: 'C-8932',
        pnr: 'X7Y8Z9',
        customerName: 'John Doe',
        totalAmount: 1450.50,
        status: 'PENDING_SIGNATURE',
        flight: {
          airline: 'American Airlines',
          id: 'AA204',
          route: 'JFK to LAX',
          date: 'Oct 15, 2026'
        }
      });
      
      // Check if already signed
      const signatureStatus = await getMetadata(`signature_${bookingId}`);
      if (signatureStatus === 'SIGNED') {
        setIsSigned(true);
      }
      
      setLoading(false);
    };
    setTimeout(fetchData, 800);
  }, [bookingId]);

  const handleSign = async () => {
    if (!agreedToTerms || !signatureName.trim()) {
      alert("Please enter your name and agree to the terms.");
      return;
    }
    
    // Save signature status
    await setMetadata(`signature_${bookingId}`, 'SIGNED');
    await setMetadata(`signature_data_${bookingId}`, {
      signedBy: signatureName,
      signedAt: new Date().toISOString(),
      ipAddress: '192.168.1.1' // Mock IP
    });
    
    setIsSigned(true);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
        <PlaneTakeoff size={48} color="var(--primary-accent)" className="animate-spin" style={{ animation: 'spin 2s linear infinite' }} />
        <h2 style={{ color: 'var(--text-secondary)' }}>Loading Secure Portal...</h2>
      </div>
    );
  }

  if (isSigned) {
    return (
      <div style={{ maxWidth: '800px', margin: '4rem auto', padding: '2rem', background: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', textAlign: 'center' }}>
        <CheckCircle size={64} color="var(--success)" style={{ margin: '0 auto 1.5rem' }} />
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Document Signed Successfully</h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Thank you. Your booking authorization has been digitally signed and securely recorded.
        </p>
        <button 
          onClick={() => navigate(`/booking/${bookingId}`)}
          style={{ padding: '0.75rem 2rem', background: 'var(--primary-accent)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer' }}
        >
          Return to Booking Details
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <ShieldCheck size={32} color="var(--primary-accent)" />
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Secure Document Signature</h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Booking Reference</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'monospace' }}>{booking.bookingId}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexDirection: 'column' }}>
        {/* Document Viewer (Mock) */}
        <div style={{ background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '2.5rem', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
           
           <div style={{ background: 'white', padding: '3rem', borderRadius: '2px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', minHeight: '600px', fontFamily: 'serif' }}>
              <div style={{ textAlign: 'center', marginBottom: '3rem', borderBottom: '2px solid #1e293b', paddingBottom: '1rem' }}>
                 <h2 style={{ fontSize: '2rem', margin: '0 0 0.5rem', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '2px' }}>ZSM eServices Pvt Ltd.</h2>
                 <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>123 Corporate Blvd, Suite 400 | support@zsmeservices.com | www.zsmeservices.com</p>
              </div>

              <h3 style={{ textAlign: 'center', textDecoration: 'underline', marginBottom: '2rem', color: '#1e293b' }}>CUSTOMER CREDIT CARD CHARGE AUTHORIZATION AGREEMENT</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem', fontSize: '0.9rem' }}>
                <div><strong>Customer Name:</strong> {booking.customerName}</div>
                <div><strong>Customer ID:</strong> {booking.customerId}</div>
                <div><strong>Booking ID:</strong> {booking.bookingId}</div>
                <div><strong>PNR / Record Locator:</strong> {booking.pnr}</div>
                <div><strong>Flight Details:</strong> {booking.flight.airline} - {booking.flight.route} ({booking.flight.date})</div>
                <div><strong>Total Amount:</strong> ${booking.totalAmount.toFixed(2)} USD</div>
              </div>

              <p style={{ lineHeight: '1.6', fontSize: '0.95rem', marginBottom: '1.5rem', textAlign: 'justify' }}>
                I, <strong>{booking.customerName}</strong>, confirm that I have reviewed the booking details provided above and authorize ZSM eServices Pvt Ltd. to process the agreed payment of <strong>${booking.totalAmount.toFixed(2)} USD</strong> for the services described in this booking.
              </p>
              
              <p style={{ lineHeight: '1.6', fontSize: '0.95rem', marginBottom: '1.5rem', textAlign: 'justify' }}>
                I acknowledge and agree to the applicable booking, cancellation, change, and refund terms presented to me. I understand that all flight tickets are non-refundable unless explicitly stated otherwise in the fare rules, and any changes to the itinerary may incur additional fees.
              </p>

              <div style={{ marginTop: '4rem', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ width: '45%' }}>
                   <div style={{ borderBottom: '1px solid #1e293b', height: '40px' }}></div>
                   <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Customer Signature</div>
                </div>
                <div style={{ width: '45%' }}>
                   <div style={{ borderBottom: '1px solid #1e293b', height: '40px', display: 'flex', alignItems: 'flex-end', paddingBottom: '0.25rem' }}>{new Date().toLocaleDateString()}</div>
                   <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Date</div>
                </div>
              </div>
           </div>
        </div>

        {/* Signing Area */}
        <div style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PenTool size={20} color="var(--primary-accent)" /> E-Signature Required
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Full Name (as signature)</label>
              <input 
                type="text" 
                value={signatureName}
                onChange={(e) => setSignatureName(e.target.value)}
                placeholder="Type your full legal name"
                style={{ width: '100%', maxWidth: '400px', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none', fontSize: '1rem', fontFamily: 'cursive' }}
              />
            </div>
            
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer', background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
              <input 
                type="checkbox" 
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                style={{ width: '1.25rem', height: '1.25rem', accentColor: 'var(--primary-accent)', marginTop: '0.25rem' }} 
              />
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                I agree to electronically sign this document. I understand that this digital signature holds the same legal weight as a physical signature.
              </span>
            </label>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
               <button 
                onClick={handleSign}
                disabled={!agreedToTerms || !signatureName.trim()}
                style={{ 
                  padding: '0.75rem 2rem', 
                  background: (!agreedToTerms || !signatureName.trim()) ? 'var(--text-muted)' : 'var(--primary-accent)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: 'var(--radius-md)', 
                  fontWeight: 600, 
                  cursor: (!agreedToTerms || !signatureName.trim()) ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                Sign & Authorize Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignaturePortal;
