import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';

const ProtectedRoute = ({ children, module, action = 'View', requiredScope = 'All' }) => {
  const { hasPermission } = usePermissions();
  const allowed = hasPermission(module, action, requiredScope);

  if (!allowed) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '4rem', marginTop: '2rem' }}>
        <h2 style={{ color: '#ef4444' }}>Access Denied</h2>
        <p className="text-secondary mt-4">You do not have permission to view this page. Contact your administrator.</p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
