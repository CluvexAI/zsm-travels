import { useAuth } from '../contexts/AuthContext';
import { ROLES, FEATURE_PERMISSION_MAP } from '../services/mockAuthService';

export const usePermissions = () => {
  const { user, permissions } = useAuth();

  /**
   * hasPermission — Low-level check against the permission matrix.
   * Used for data-layer gating where scope matters (e.g. 'Own', 'Team', 'All').
   * Supports '*' wildcards for Super Admin / Admin.
   */
  const hasPermission = (module, action, requiredScope = 'All') => {
    if (!user) return false;

    // Super Admin has all permissions
    if (user.role === ROLES.SUPER_ADMIN) {
      return true;
    }

    const modulePerms = permissions[module] || permissions['*'];
    if (!modulePerms) return false;

    const actionPerms = modulePerms[action] || modulePerms['*'];
    if (!actionPerms) return false;

    // Empty array = explicitly denied
    if (actionPerms.length === 0) return false;

    // If they have 'All' scope for this action, they can do anything.
    if (actionPerms.includes('All')) {
      return true;
    }

    // Otherwise, check if they have the specific required scope.
    return actionPerms.includes(requiredScope);
  };

  /**
   * hasAnyPermission — Checks if the user has ANY non-empty scope for a
   * module+action, regardless of which scope it is.
   *
   * Used for UI visibility (menus, route guards) — scopes like 'Own' or 'Team'
   * mean the feature IS accessible, just with filtered data.
   * Explicit denials (empty []) still return false.
   */
  const hasAnyPermission = (module, action) => {
    if (!user) return false;

    if (user.role === ROLES.SUPER_ADMIN) return true;

    const modulePerms = permissions[module] || permissions['*'];
    if (!modulePerms) return false;

    const actionPerms = modulePerms[action] || modulePerms['*'];
    // Empty array or missing = explicitly denied / not granted
    if (!actionPerms || actionPerms.length === 0) return false;

    // Any non-empty scope array means the feature is accessible
    return true;
  };

  /**
   * canAccess — High-level check using the FEATURE_PERMISSION_MAP.
   * Pass a featureKey (e.g. 'new-booking', 'retention-reports').
   * Uses hasAnyPermission so that 'Own'/'Team' scopes correctly grant visibility.
   * Returns false if the feature key doesn't exist in the map.
   */
  const canAccess = (featureKey) => {
    const feature = FEATURE_PERMISSION_MAP[featureKey];
    if (!feature) return false;
    return hasAnyPermission(feature.module, feature.action);
  };

  /**
   * getVisibleFeatures — Returns an array of feature descriptors
   * the current user can access, filtered by category.
   * Used to build dynamic menus.
   * category: 'booking' | 'reports' | 'admin' | 'top' | null (all)
   */
  const getVisibleFeatures = (category = null) => {
    return Object.entries(FEATURE_PERMISSION_MAP)
      .filter(([key, feat]) => {
        if (category && feat.category !== category) return false;
        return canAccess(key);
      })
      .map(([key, feat]) => ({ key, ...feat }));
  };

  return { hasPermission, hasAnyPermission, canAccess, getVisibleFeatures };
};
