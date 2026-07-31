import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';

/**
 * ProtectedRoute — Enforces permission-based route access.
 *
 * If the user LACKS permission:
 *   - Redirects to /unauthorized (feature is completely invisible — no Access Denied block).
 *
 * If the user HAS permission:
 *   - Renders children normally.
 *
 * Props:
 *   featureKey   — High-level key from FEATURE_PERMISSION_MAP (preferred).
 *   module       — Low-level module name (used if featureKey not provided).
 *   action       — Low-level action name (used with module).
 *   requiredScope— Optional scope constraint (default: 'All').
 */
const ProtectedRoute = ({ children, featureKey, module, action = 'View', requiredScope = 'All' }) => {
  const { hasPermission, canAccess } = usePermissions();

  const allowed = featureKey
    ? canAccess(featureKey)
    : hasPermission(module, action, requiredScope);

  if (!allowed) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
