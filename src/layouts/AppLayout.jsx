import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  Home, ChevronDown, BarChart2, CheckSquare, 
  Mail, MessageCircle, Bell, PlaneTakeoff 
} from 'lucide-react';

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
          </nav>
        </div>
        
        <div className="topbar-right">
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
