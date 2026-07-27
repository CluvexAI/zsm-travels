import { useAuth } from '../contexts/AuthContext';
import { ROLES } from '../services/mockAuthService';

export const usePermissions = () => {
  const { user, permissions } = useAuth();

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

    // If they have 'All' scope for this action, they can do anything.
    if (actionPerms.includes('All')) {
      return true;
    }

    // Otherwise, check if they have the specific required scope.
    return actionPerms.includes(requiredScope);
  };

  return { hasPermission };
};
