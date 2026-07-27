import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  Home, ChevronDown, BarChart2, CheckSquare, 
  Mail, MessageCircle, Bell, PlaneTakeoff, LogOut, Users, Server, Settings
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const megaMenuCols = [
  [
    'New Flight Booking',
    'Profile Info Change',
    'Change Itinerary',
    'Cancellation for Refund',
    'Cancellation for Credit',
    'Checking Services'
  ],
  [
    'Seat Assign',
    'Add Baggage',
    'Add Insurance',
    'Pet Booking',
    'Seat Upgrade'
  ],
  [
    'UMNR Booking'
  ]
];

const AppLayout = () => {
  const [dateTime, setDateTime] = useState('');
  const { user, switchUser, logout, MOCK_USERS } = useAuth();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const pstOptions = { timeZone: 'America/Los_Angeles' };
      const date = now.toLocaleDateString('en-US', pstOptions);
      const time = now.toLocaleTimeString('en-US', { ...pstOptions, hour: '2-digit', minute: '2-digit', hour12: true });
      setDateTime(`${date}\n${time} PST`);
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="app-container">
      {/* Top Navigation Bar */}
      <header className="topbar">
        <div className="topbar-left">
          <div className="topbar-logo">
            <PlaneTakeoff size={24} color="#f59e0b" />
            ZSM TRAVEL
          </div>
          
          <nav className="topbar-nav">
            <Link to="/dashboard" className="nav-item">
              <Home size={16} />
            </Link>
            
            <div className="nav-item">
              <span className="flex items-center gap-2">
                <PlaneTakeoff size={16} /> Booking <ChevronDown size={14} />
              </span>
              
              {/* Mega Menu */}
              <div className="mega-menu">
                {megaMenuCols.map((col, colIdx) => (
                  <div key={colIdx} className="flex-col gap-2">
                    {col.map((item, itemIdx) => (
                      <Link 
                        key={itemIdx} 
                        to={item === 'New Flight Booking' ? '/new-booking' : item === 'Profile Info Change' ? '/profile-info-change' : item === 'Change Itinerary' ? '/change-itinerary' : item === 'Cancellation for Refund' ? '/cancellation-refund' : item === 'Cancellation for Credit' ? '/cancellation-credit' : item === 'Seat Assign' ? '/seat-assign' : item === 'Add Baggage' ? '/add-baggage' : item === 'Add Insurance' ? '/add-insurance' : item === 'Pet Booking' ? '/pet-booking' : item === 'Seat Upgrade' ? '/seat-upgrade' : item === 'UMNR Booking' ? '/umnr-booking' : '/search'} 
                        className="mega-menu-item"
                      >
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', border: '1px solid currentColor', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                           <div style={{ width: '2px', height: '2px', backgroundColor: 'currentColor', borderRadius: '50%' }}></div>
                        </div>
                        {item}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="nav-item">
              <span className="flex items-center gap-2">
                <BarChart2 size={16} /> Reports <ChevronDown size={14} />
              </span>
              
              <div className="mega-menu" style={{ minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  'Retention Reports',
                  'Escalation Report',
                  'Leads',
                  'Create Lead',
                  'Upcoming Trips (48 hrs.)',
                  'Boarding Pass',
                  'All Website Leads',
                  'Yesterday Sales'
                ].map((item, itemIdx) => (
                  <Link 
                    key={itemIdx} 
                    to={`/reports/${item.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`} 
                    className="mega-menu-item"
                  >
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', border: '1px solid currentColor', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <div style={{ width: '2px', height: '2px', backgroundColor: 'currentColor', borderRadius: '50%' }}></div>
                    </div>
                    {item}
                  </Link>
                ))}
              </div>
            </div>
            
            <Link to="/polls" className="nav-item">
              <CheckSquare size={16} /> Polls
            </Link>
            <Link to="/admin" className="nav-item" style={{ color: '#0ea5e9', fontWeight: 600 }}>
              <Settings size={16} /> Settings
            </Link>
          </nav>
        </div>
        
        <div className="topbar-right">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '1rem', borderRight: '1px solid #e2e8f0', paddingRight: '1rem' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>
              {user?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div style={{ fontSize: '0.72rem', lineHeight: 1.3 }}>
              <div style={{ fontWeight: 700, color: '#1e293b' }}>{user?.fullName}</div>
              <div style={{ color: '#94a3b8' }}>{user?.role}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '1rem', borderRight: '1px solid #e2e8f0', paddingRight: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Switch:</span>
            <select 
              value={user?.userId || ''} 
              onChange={(e) => switchUser(e.target.value)}
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontWeight: 600, color: '#475569', cursor: 'pointer' }}
            >
              {MOCK_USERS.map(u => (
                <option key={u.userId} value={u.userId}>{u.role}</option>
              ))}
            </select>
          </div>
          <div className="topbar-icon">
            <Mail size={18} />
          </div>
          <div className="topbar-icon">
            <MessageCircle size={18} />
          </div>
          <div className="topbar-icon" style={{ backgroundColor: '#4a5568', borderRadius: '50%', padding: '0.25rem' }}>
            <Bell size={16} />
            <div className="badge-dot"></div>
          </div>
          <div style={{ fontSize: '0.75rem', textAlign: 'right', lineHeight: '1.2', color: 'var(--text-muted)' }}>
            {dateTime.split('\n').map((line, i) => <div key={i}>{line}</div>)}
          </div>
          <button 
            onClick={logout}
            title="Sign Out"
            style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.65rem', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '6px', color: '#dc2626', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
          >
            <LogOut size={13} /> Logout
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="footer" style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
        <p>
          All Copyright {new Date().getFullYear()} Reserved by{' '}
          <a href="https://zsmeservices.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>
            ZSM eServices Pvt Ltd.
          </a>
        </p>
      </footer>
    </div>
  );
};

export default AppLayout;
