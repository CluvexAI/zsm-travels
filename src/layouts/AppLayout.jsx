import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  Home, ChevronDown, BarChart2,
  Mail, MessageCircle, Bell, PlaneTakeoff, LogOut, Settings
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';


const AppLayout = () => {
  const [dateTime, setDateTime] = useState('');
  const { user, switchUser, logout, MOCK_USERS } = useAuth();
  const { getVisibleFeatures, hasPermission } = usePermissions();
  const location = useLocation();

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

  // ── Dynamic menu items — only what this user can access ────────────────────
  const bookingFeatures = getVisibleFeatures('booking');
  const reportFeatures  = getVisibleFeatures('reports');

  // Settings: requires actual admin-level access (All/Relevant scope), not just
  // 'Own' scoped audit log access that every agent has.
  const canViewSettings = (
    hasPermission('Users', 'View') ||
    hasPermission('Roles & Permissions', 'View') ||
    hasPermission('Audit Logs', 'View', 'Relevant') ||
    hasPermission('Audit Logs', 'View') // catches 'All' scope via the normal path
  );

  const dotIcon = (
    <div style={{ width: '6px', height: '6px', borderRadius: '50%', border: '1px solid currentColor', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <div style={{ width: '2px', height: '2px', backgroundColor: 'currentColor', borderRadius: '50%' }} />
    </div>
  );

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

            {/* ── Bookings Mega-Menu — only rendered if user can access ≥1 booking feature */}
            {bookingFeatures.length > 0 && (
              <div className="nav-item">
                <span className="flex items-center gap-2">
                  <PlaneTakeoff size={16} /> Bookings <ChevronDown size={14} />
                </span>

                <div className="mega-menu" style={{ minWidth: '200px', gridTemplateColumns: '1fr' }}>
                  <div className="mega-menu-submenu">
                    <div className="mega-menu-trigger">
                      Flight <ChevronDown size={12} style={{ transform: 'rotate(-90deg)' }} />
                    </div>

                    <div className="mega-menu-flyout">
                      {bookingFeatures.map((feat) => (
                        <Link
                          key={feat.key}
                          to={feat.path}
                          className="mega-menu-item"
                        >
                          {dotIcon}
                          {feat.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Reports Dropdown — only rendered if user can access ≥1 report */}
            {reportFeatures.length > 0 && (
              <div className="nav-item">
                <span className="flex items-center gap-2">
                  <BarChart2 size={16} /> Reports <ChevronDown size={14} />
                </span>
                
                <div className="mega-menu" style={{ minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {reportFeatures.map((feat) => (
                    <Link
                      key={feat.key}
                      to={feat.path}
                      className="mega-menu-item"
                    >
                      {dotIcon}
                      {feat.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* ── Settings — only rendered if user has genuine admin-level access */}
            {canViewSettings && (
              <Link to="/admin" className="nav-item" style={{ color: '#0ea5e9', fontWeight: 600 }}>
                <Settings size={16} /> Settings
              </Link>
            )}
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

          {hasPermission('System Settings', 'Manage') && (
            <Link to="/admin/smtp-settings" className="topbar-icon" title="SMTP Settings" style={{ display: 'flex', textDecoration: 'none' }}>
              <Mail size={18} />
            </Link>
          )}
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
      <footer className="footer" style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: '600', borderTop: '1px solid var(--border-color)', backgroundColor: '#ffffff' }}>
        <p style={{ margin: 0 }}>Copyright @2026 ZSM eServices Pvt. Ltd.</p>
      </footer>
    </div>
  );
};

export default AppLayout;
