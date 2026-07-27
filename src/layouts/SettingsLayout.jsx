import React from 'react';
import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { Users, Shield, Server, Settings } from 'lucide-react';
import { usePermissions } from '../hooks/usePermissions';

const SettingsLayout = () => {
  const { hasPermission } = usePermissions();
  
  // Basic gatekeeping: must have at least one admin permission to see the settings shell
  const canViewUsers = hasPermission('Users', 'View');
  const canViewRoles = hasPermission('Roles & Permissions', 'View');
  const canViewAudits = hasPermission('Audit Logs', 'View');

  if (!canViewUsers && !canViewRoles && !canViewAudits) {
    return <Navigate to="/dashboard" replace />;
  }

  const navLinkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    textDecoration: 'none',
    color: isActive ? '#0f172a' : '#64748b',
    backgroundColor: isActive ? '#f1f5f9' : 'transparent',
    fontWeight: isActive ? 700 : 500,
    fontSize: '0.9rem',
    transition: 'all 0.2s ease',
  });

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 56px)', backgroundColor: '#f8fafc' }}>
      {/* Left Sidebar Menu */}
      <aside style={{ width: '260px', backgroundColor: 'white', borderRight: '1px solid #e2e8f0', padding: '1.5rem 1rem' }}>
        <h2 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', margin: '0 0 1rem 1rem', fontWeight: 700 }}>
          Administration
        </h2>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {canViewUsers && (
            <NavLink to="/admin/user-management" style={navLinkStyle}>
              <Users size={18} /> User Management
            </NavLink>
          )}
          
          {canViewRoles && (
            <NavLink to="/admin/roles-permissions" style={navLinkStyle}>
              <Shield size={18} /> Roles & Permissions
            </NavLink>
          )}

          {canViewAudits && (
            <NavLink to="/admin/audit-logs" style={navLinkStyle}>
              <Server size={18} /> Audit Logs
            </NavLink>
          )}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default SettingsLayout;
