import React, { createContext, useContext, useState, useEffect } from 'react';
import { authenticateMockUser, getPermissionsForRole, MOCK_USERS, ROLES } from '../services/mockAuthService';
import { logEvent } from '../services/mockAuditService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Start logged out
  const [permissions, setPermissions] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (user) {
      setPermissions(getPermissionsForRole(user.role));
    } else {
      setPermissions({});
    }
  }, [user]);

  const switchUser = (userId) => {
    const newUser = authenticateMockUser(userId);
    if (newUser) {
      setUser(newUser);
      logEvent({ user: newUser, action: 'Role assignment / User Switch', before: { role: user?.role }, after: { role: newUser.role } });
    }
  };

  const login = (userId) => {
    const newUser = authenticateMockUser(userId);
    if (newUser) {
      setUser(newUser);
      setIsLoggedIn(true);
      logEvent({ user: newUser, action: 'Login' });
    } else {
      logEvent({
        user: { userId: 'UNKNOWN', fullName: 'Unknown', role: 'SYSTEM' },
        action: 'Failed login',
        reason: `Attempted ID: ${userId}`,
      });
    }
  };

  const logout = () => {
    if (user) {
      logEvent({ user, action: 'Logout' });
    }
    setUser(null);
    setPermissions({});
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ user, permissions, switchUser, login, logout, isLoggedIn, ROLES, MOCK_USERS }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
