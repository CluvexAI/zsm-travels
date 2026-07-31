import React, { useState, useMemo } from 'react';
import { Search, Shield, ShieldCheck, CheckSquare, Square } from 'lucide-react';
import { ROLES, PERMISSION_MATRIX, updateRolePermission } from '../services/mockAuthService';
import { useAuth } from '../contexts/AuthContext';

const RolesPermissions = () => {
  const [selectedRole, setSelectedRole] = useState(ROLES.SALES_AGENT);
  const [searchQuery, setSearchQuery] = useState('');
  const { refreshPermissions } = useAuth();
  
  // Local state to force re-renders when matrix changes
  const [matrix, setMatrix] = useState(JSON.parse(JSON.stringify(PERMISSION_MATRIX)));

  const handleToggle = (module, action, currentlyGranted) => {
    updateRolePermission(selectedRole, module, action, !currentlyGranted, ['All']);
    // Update local state to reflect the UI change immediately
    const updated = { ...matrix };
    if (!currentlyGranted) {
      if (!updated[selectedRole][module]) updated[selectedRole][module] = {};
      updated[selectedRole][module][action] = ['All'];
    } else {
      updated[selectedRole][module][action] = [];
    }
    setMatrix(updated);
    // Propagate to current live session so menus update instantly
    refreshPermissions();
  };

  const handleSelectAll = (select) => {
    const updated = { ...matrix };
    Object.keys(updated[selectedRole]).forEach(module => {
      // Only affect visible modules if search is active
      if (searchQuery && !module.toLowerCase().includes(searchQuery.toLowerCase())) return;
      
      Object.keys(updated[selectedRole][module]).forEach(action => {
        updateRolePermission(selectedRole, module, action, select, ['All']);
        updated[selectedRole][module][action] = select ? ['All'] : [];
      });
    });
    setMatrix(updated);
    // Propagate to current live session
    refreshPermissions();
  };

  const roleList = Object.values(ROLES);
  
  // Filter modules based on search query
  const filteredModules = useMemo(() => {
    const rolePerms = matrix[selectedRole] || {};
    return Object.keys(rolePerms).filter(module => 
      module.toLowerCase().includes(searchQuery.toLowerCase()) ||
      Object.keys(rolePerms[module]).some(action => action.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [matrix, selectedRole, searchQuery]);

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 56px)', fontFamily: "'Inter', sans-serif" }}>
      {/* Left Panel: Roles List */}
      <div style={{ width: '280px', borderRight: '1px solid #e2e8f0', background: 'white', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={18} color="#0ea5e9" /> Roles
          </h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>Select a role to modify access</p>
        </div>
        <div style={{ padding: '1rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {roleList.map(role => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              style={{
                textAlign: 'left', padding: '0.75rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
                fontWeight: selectedRole === role ? 600 : 500,
                fontSize: '0.875rem',
                background: selectedRole === role ? '#f0f9ff' : 'transparent',
                color: selectedRole === role ? '#0284c7' : '#475569',
                borderLeft: selectedRole === role ? '3px solid #0ea5e9' : '3px solid transparent',
                transition: 'all 0.15s'
              }}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Right Panel: Role Details */}
      <div style={{ flex: 1, background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
        {/* Header Area */}
        <div style={{ padding: '2rem', background: 'white', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: 600, marginBottom: '0.25rem' }}>
                Editing Permissions For
              </div>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{selectedRole}</h1>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => handleSelectAll(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}>
                <CheckSquare size={14} color="#16a34a" /> Select All
              </button>
              <button onClick={() => handleSelectAll(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}>
                <Square size={14} color="#ef4444" /> Clear All
              </button>
            </div>
          </div>

          <div style={{ position: 'relative', maxWidth: '400px' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search permissions (e.g. Dashboard, Edit, Refund)..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.25rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.875rem' }} 
            />
          </div>
        </div>

        {/* Permissions Grid */}
        <div style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {filteredModules.length > 0 ? filteredModules.map(module => {
              const actions = matrix[selectedRole][module] || {};
              // Only render modules that have defined actions
              if (Object.keys(actions).length === 0) return null;

              return (
                <div key={module} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ padding: '0.75rem 1rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontWeight: 700, color: '#334155', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldCheck size={16} color="#0ea5e9" /> {module}
                  </div>
                  <div style={{ padding: '0.5rem 1rem' }}>
                    {Object.entries(actions).map(([action, scopes]) => {
                      const isGranted = Array.isArray(scopes) && scopes.length > 0 && scopes[0] !== 'No';
                      
                      // Highlight text if it matches search
                      const matchesSearch = searchQuery && (module.toLowerCase().includes(searchQuery.toLowerCase()) || action.toLowerCase().includes(searchQuery.toLowerCase()));
                      
                      return (
                        <label key={action} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}>
                          <input 
                            type="checkbox" 
                            checked={isGranted}
                            onChange={() => handleToggle(module, action, isGranted)}
                            style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#0ea5e9' }}
                          />
                          <span style={{ fontSize: '0.85rem', color: isGranted ? '#0f172a' : '#64748b', fontWeight: isGranted ? 600 : 400, backgroundColor: matchesSearch ? '#fef08a' : 'transparent' }}>
                            {action}
                          </span>
                          {isGranted && scopes[0] !== 'All' && scopes[0] !== 'Yes' && (
                            <span style={{ marginLeft: 'auto', fontSize: '0.7rem', padding: '0.1rem 0.4rem', background: '#f1f5f9', color: '#64748b', borderRadius: '4px', fontWeight: 600 }}>
                              {scopes[0]}
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            }) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                <Search size={32} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#475569' }}>No permissions found</div>
                <div style={{ fontSize: '0.85rem' }}>Try adjusting your search query</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolesPermissions;
