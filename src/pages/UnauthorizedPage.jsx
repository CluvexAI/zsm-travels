import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldOff, ArrowLeft } from 'lucide-react';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 120px)',
      padding: '2rem',
      textAlign: 'center',
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.5rem',
        boxShadow: '0 4px 20px rgba(239, 68, 68, 0.15)',
      }}>
        <ShieldOff size={36} color="#ef4444" />
      </div>

      <h1 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
        Access Restricted
      </h1>
      <p style={{ margin: '0 0 2rem', fontSize: '0.95rem', color: '#64748b', maxWidth: '400px', lineHeight: 1.6 }}>
        You don't have permission to view this page. If you believe this is a mistake,
        please contact your system administrator.
      </p>

      <button
        onClick={() => navigate('/dashboard', { replace: true })}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.65rem 1.25rem',
          background: '#0ea5e9',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontWeight: 600,
          fontSize: '0.9rem',
          cursor: 'pointer',
          transition: 'background 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#0284c7'}
        onMouseLeave={e => e.currentTarget.style.background = '#0ea5e9'}
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </button>
    </div>
  );
};

export default UnauthorizedPage;
