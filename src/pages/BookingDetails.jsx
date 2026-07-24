import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plane, User, CreditCard, Mail, ExternalLink, Download, FileText, CheckCircle, AlertCircle } from 'lucide-react';

const BookingDetails = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [signatureData, setSignatureData] = useState(null);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    // Mock fetching booking data
    setTimeout(() => {
      setBooking({
        bookingId: bookingId || 'B-23490',
        customerId: 'C-8932',
        pnr: 'X7Y8Z9',
        customerName: 'John Doe',
        email: 'johndoe@example.com',
        phone: '+1 555-0198',
        totalAmount: 1450.50,
        merchantName: 'ZSM Travel',
        vendorCode: 'VND-001',
        createdAt: 'Oct 15, 2026, 10:30 AM',
        flight: {
          airline: 'American Airlines',
          id: 'AA204',
          route: 'JFK to LAX',
          date: 'Oct 15, 2026',
          time: '10:15 AM'
        }
      });
      
      const emailStatus = localStorage.getItem(`email_sent_${bookingId}`);
      if (emailStatus) setEmailSent(true);

      const status = localStorage.getItem(`signature_${bookingId}`);
      const dataStr = localStorage.getItem(`signature_data_${bookingId}`);
      if (status === 'SIGNED' && dataStr) {
        setSignatureData(JSON.parse(dataStr));
      }
    }, 500);
  }, [bookingId]);

  const handleSendEmail = () => {
    localStorage.setItem(`email_sent_${bookingId}`, 'true');
    setEmailSent(true);
    alert(`Signature request email sent to ${booking?.email}`);
  };

  if (!booking) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Booking Details...</div>;
  }

  const signatureStatus = signatureData ? 'Signed' : (emailSent ? 'Sent' : 'Not Sent');

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Link to="/dashboard" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Dashboard</Link>
            <span style={{ color: 'var(--text-muted)' }}>/</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Booking {booking.bookingId}</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Booking Details
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <span style={{ padding: '0.5rem 1rem', background: '#ebf8ff', color: '#2b6cb0', borderRadius: 'var(--radius-full)', fontWeight: 600, fontSize: '0.875rem' }}>
            PNR: {booking.pnr}
          </span>
          <span style={{ padding: '0.5rem 1rem', background: signatureData ? '#f0fff4' : '#fffaf0', color: signatureData ? '#276749' : '#c05621', borderRadius: 'var(--radius-full)', fontWeight: 600, fontSize: '0.875rem' }}>
            Status: {signatureData ? 'Booking Confirmed' : 'Pending Signature'}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Digital Signature & Authorization Section */}
          <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ padding: '1.25rem 1.5rem', background: 'var(--bg-base)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <FileText size={18} color="var(--primary-accent)" /> Digital Signature & Authorization
               </h3>
               {signatureData ? (
                 <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--success)', fontWeight: 600, fontSize: '0.875rem' }}>
                   <CheckCircle size={16} /> Signed
                 </span>
               ) : (
                 <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--warning)', fontWeight: 600, fontSize: '0.875rem' }}>
                   <AlertCircle size={16} /> Action Required
                 </span>
               )}
            </div>
            <div style={{ padding: '1.5rem' }}>
               <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                 <tbody>
                   <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                     <td style={{ padding: '0.75rem 0', color: 'var(--text-secondary)', width: '40%' }}>Signature Status</td>
                     <td style={{ padding: '0.75rem 0', fontWeight: 600, color: signatureData ? 'var(--success)' : (emailSent ? 'var(--primary-accent)' : 'var(--text-muted)') }}>{signatureStatus}</td>
                   </tr>
                   <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                     <td style={{ padding: '0.75rem 0', color: 'var(--text-secondary)' }}>Request Sent</td>
                     <td style={{ padding: '0.75rem 0', fontWeight: 500 }}>{emailSent ? new Date().toLocaleString() : '-'}</td>
                   </tr>
                   {signatureData && (
                     <>
                       <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                         <td style={{ padding: '0.75rem 0', color: 'var(--text-secondary)' }}>Signed At</td>
                         <td style={{ padding: '0.75rem 0', fontWeight: 500 }}>{new Date(signatureData.signedAt).toLocaleString()}</td>
                       </tr>
                       <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                         <td style={{ padding: '0.75rem 0', color: 'var(--text-secondary)' }}>Signed By</td>
                         <td style={{ padding: '0.75rem 0', fontWeight: 500 }}>{signatureData.signedBy}</td>
                       </tr>
                       <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                         <td style={{ padding: '0.75rem 0', color: 'var(--text-secondary)' }}>Authorization Status</td>
                         <td style={{ padding: '0.75rem 0', fontWeight: 600, color: 'var(--success)' }}>Authorized</td>
                       </tr>
                       <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                         <td style={{ padding: '0.75rem 0', color: 'var(--text-secondary)' }}>Document Version</td>
                         <td style={{ padding: '0.75rem 0', fontWeight: 500 }}>v1.0</td>
                       </tr>
                     </>
                   )}
                 </tbody>
               </table>

               <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                 {!signatureData && (
                   <button 
                     onClick={handleSendEmail}
                     style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'white', border: '1px solid var(--primary-accent)', color: 'var(--primary-accent)', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer' }}
                   >
                     <Mail size={16} /> {emailSent ? 'Resend Email' : 'Send Signature Request'}
                   </button>
                 )}
                 {signatureData && (
                   <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'white', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer' }}>
                     <Download size={16} /> Download Signed Document
                   </button>
                 )}
                 <Link 
                    to={`/sign/${bookingId}`} 
                    target="_blank"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'white', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: 'var(--radius-md)', fontWeight: 600, textDecoration: 'none' }}
                  >
                   <ExternalLink size={16} /> View Portal
                 </Link>
               </div>
            </div>
          </div>

          {/* Customer Details */}
          <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>Customer Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Customer ID</div>
                <div style={{ fontWeight: 600 }}>{booking.customerId}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Name</div>
                <div style={{ fontWeight: 600 }}>{booking.customerName}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Email</div>
                <div>{booking.email}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Phone</div>
                <div>{booking.phone}</div>
              </div>
            </div>
          </div>

          {/* Flight Details */}
          <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>Flight Itinerary</h3>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', background: 'var(--bg-base)', borderRadius: 'var(--radius-md)' }}>
              <Plane size={24} color="var(--primary-accent)" />
              <div>
                <div style={{ fontWeight: 600, fontSize: '1.125rem' }}>{booking.flight.route}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{booking.flight.airline} • {booking.flight.id} • {booking.flight.date} at {booking.flight.time}</div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>Payment Summary</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Total Amount</span>
              <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>${booking.totalAmount.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Merchant</span>
              <span>{booking.merchantName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Vendor Code</span>
              <span>{booking.vendorCode}</span>
            </div>
            
            <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: signatureData ? 'var(--success)' : 'var(--warning)' }}>
                 {signatureData ? <CheckCircle size={16} /> : <AlertCircle size={16} />} 
                 {signatureData ? 'Payment Authorized' : 'Pending Customer Authorization'}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
