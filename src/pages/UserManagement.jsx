import React, { useState, useMemo, useEffect } from 'react';
import {
  Users, Search, Plus, Edit3, Trash2,
  CheckCircle, XCircle, Clock, X, Save,
  AlertTriangle, Server
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { ROLES, MOCK_USERS } from '../services/mockAuthService';
import { getLogs } from '../services/mockAuditService';

const DEPT_OPTIONS = ['IT', 'Sales', 'Operations', 'Accounts', 'Compliance', 'Quality', 'Customer Support'];
const TEAM_OPTIONS = ['Leadership', 'North America Sales', 'Ticketing Support', 'Reconciliation', 'Audit & Compliance', 'Quality Review', 'Support Desk'];
const STATUS_OPTIONS = ['Active', 'Inactive', 'Suspended'];

const statusBadge = (status) => {
  const styles = {
    Active: { bg: '#dcfce7', color: '#16a34a' },
    Inactive: { bg: '#f1f5f9', color: '#64748b' },
    Suspended: { bg: '#fef2f2', color: '#dc2626' },
  };
  const s = styles[status] || styles.Inactive;
  return (
    <span style={{ padding: '0.25rem 0.65rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, background: s.bg, color: s.color }}>
      {status}
    </span>
  );
};

const roleBadge = (role) => (
  <span style={{ padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, background: '#eff6ff', color: '#1d4ed8', letterSpacing: '0.02em' }}>
    {role}
  </span>
);

const UserManagement = () => {
  const { hasPermission } = usePermissions();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [users, setUsers] = useState(MOCK_USERS.map(u => ({ ...u })));
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  
  const [form, setForm] = useState({
    fullName: '', email: '', department: '', role: Object.values(ROLES)[0],
    status: 'Active', assignedTeam: '',
  });

  const [loginLogs, setLoginLogs] = useState([]);

  const canManageUsers = hasPermission('Users', 'Manage');

  useEffect(() => {
    if (activeTab === 'login-activity') {
      const allLogs = getLogs();
      setLoginLogs(allLogs.filter(l => l.action.toLowerCase().includes('login')));
    }
  }, [activeTab]);

  const filteredUsers = useMemo(() => users.filter(u => {
    const matchSearch = searchQuery === '' || u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = activeTab === 'all' || u.status.toLowerCase() === activeTab;
    return matchSearch && matchStatus;
  }), [users, searchQuery, activeTab]);

  const openAdd = () => {
    setForm({ fullName: '', email: '', department: DEPT_OPTIONS[0], role: Object.values(ROLES)[0], status: 'Active', assignedTeam: TEAM_OPTIONS[0] });
    setModalMode('add');
    setShowModal(true);
  };

  const openEdit = (u) => {
    setSelectedUser(u);
    setForm({ fullName: u.fullName, email: u.email, department: u.department, role: u.role, status: u.status, assignedTeam: u.assignedTeam });
    setModalMode('edit');
    setShowModal(true);
  };

  const handleSave = () => {
    if (modalMode === 'add') {
      const newUser = {
        ...form,
        userId: `u_${Date.now()}`,
        employeeId: `EMP-${String(users.length + 1).padStart(3, '0')}`,
      };
      setUsers(prev => [...prev, newUser]);
      setSuccessMsg('User created successfully.');
    } else {
      setUsers(prev => prev.map(u => u.userId === selectedUser.userId ? { ...u, ...form } : u));
      setSuccessMsg('User updated successfully.');
    }
    setShowModal(false);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDelete = (userId) => {
    setUsers(prev => prev.filter(u => u.userId !== userId));
    setShowDeleteConfirm(null);
    setSuccessMsg('User removed.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const cardStyle = { background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' };
  const tabStyle = (id) => ({
    padding: '0.6rem 1.25rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
    fontWeight: 600, fontSize: '0.875rem',
    background: activeTab === id ? '#0ea5e9' : 'transparent',
    color: activeTab === id ? 'white' : '#64748b',
    transition: 'all 0.2s',
  });

  return (
    <div style={{ padding: '2rem', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>User Management</h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Manage employee access and monitor login activity.</p>
        </div>
        {canManageUsers && (
          <button onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
            <Plus size={16} /> Add User
          </button>
        )}
      </div>

      {successMsg && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: '#dcfce7', border: '1px solid #86efac', borderRadius: '8px', marginBottom: '1rem', color: '#16a34a', fontWeight: 600, fontSize: '0.875rem' }}>
          <CheckCircle size={16} /> {successMsg}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: '#f1f5f9', padding: '0.35rem', borderRadius: '10px', width: 'fit-content' }}>
        <button style={tabStyle('all')} onClick={() => setActiveTab('all')}>All Users</button>
        <button style={tabStyle('active')} onClick={() => setActiveTab('active')}>Active Users</button>
        <button style={tabStyle('inactive')} onClick={() => setActiveTab('inactive')}>Inactive Users</button>
        <button style={tabStyle('suspended')} onClick={() => setActiveTab('suspended')}>Suspended</button>
        <button style={tabStyle('login-activity')} onClick={() => setActiveTab('login-activity')}>Login Activity</button>
      </div>

      <div style={cardStyle}>
        {activeTab === 'login-activity' ? (
          <div>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <h3 style={{ margin: 0, fontSize: '0.9rem', color: '#334155' }}>Recent Authentication Events</h3>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '0.75rem 1.25rem', fontWeight: 600, color: '#64748b' }}>Time</th>
                  <th style={{ padding: '0.75rem 1.25rem', fontWeight: 600, color: '#64748b' }}>User</th>
                  <th style={{ padding: '0.75rem 1.25rem', fontWeight: 600, color: '#64748b' }}>Event</th>
                  <th style={{ padding: '0.75rem 1.25rem', fontWeight: 600, color: '#64748b' }}>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {loginLogs.map(log => (
                  <tr key={log.logId} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.75rem 1.25rem', color: '#475569' }}>{new Date(log.timestamp).toLocaleString()}</td>
                    <td style={{ padding: '0.75rem 1.25rem', fontWeight: 600, color: '#0f172a' }}>{log.userName}</td>
                    <td style={{ padding: '0.75rem 1.25rem' }}>
                      <span style={{ color: log.action === 'Login' ? '#16a34a' : '#ef4444', fontWeight: 600 }}>{log.action}</span>
                    </td>
                    <td style={{ padding: '0.75rem 1.25rem', color: '#64748b' }}>{log.ipAddress}</td>
                  </tr>
                ))}
                {loginLogs.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No login activity found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ position: 'relative', width: '300px' }}>
                <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input placeholder="Search users..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem 0.55rem 2.25rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '0.75rem 1.25rem', fontWeight: 600, color: '#64748b' }}>Employee</th>
                    <th style={{ padding: '0.75rem 1.25rem', fontWeight: 600, color: '#64748b' }}>Role</th>
                    <th style={{ padding: '0.75rem 1.25rem', fontWeight: 600, color: '#64748b' }}>Department</th>
                    <th style={{ padding: '0.75rem 1.25rem', fontWeight: 600, color: '#64748b' }}>Status</th>
                    <th style={{ padding: '0.75rem 1.25rem', fontWeight: 600, color: '#64748b', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.userId} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.15s' }}>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.1rem' }}>{u.fullName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{u.email} • {u.employeeId}</div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>{roleBadge(u.role)}</td>
                      <td style={{ padding: '1rem 1.25rem', color: '#475569' }}>
                        <div>{u.department}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{u.assignedTeam}</div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>{statusBadge(u.status)}</td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        {canManageUsers && (
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => openEdit(u)} style={{ background: '#f1f5f9', border: 'none', padding: '0.4rem', borderRadius: '6px', color: '#475569', cursor: 'pointer' }}><Edit3 size={15} /></button>
                            <button onClick={() => setShowDeleteConfirm(u.userId)} style={{ background: '#fef2f2', border: 'none', padding: '0.4rem', borderRadius: '6px', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={15} /></button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr><td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No users found matching filters.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', width: '540px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>{modalMode === 'add' ? 'Add New User' : 'Edit User'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#94a3b8" /></button>
            </div>
            {/* Same form as before */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div><label style={{display: 'block', fontSize: '0.8rem', marginBottom: '0.3rem'}}>Full Name</label><input style={{width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '6px'}} value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} /></div>
              <div><label style={{display: 'block', fontSize: '0.8rem', marginBottom: '0.3rem'}}>Email</label><input style={{width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '6px'}} value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
              <div>
                <label style={{display: 'block', fontSize: '0.8rem', marginBottom: '0.3rem'}}>Role</label>
                <select style={{width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '6px'}} value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                  {Object.values(ROLES).map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label style={{display: 'block', fontSize: '0.8rem', marginBottom: '0.3rem'}}>Status</label>
                <select style={{width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '6px'}} value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                  {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '0.5rem 1rem', background: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSave} style={{ padding: '0.5rem 1rem', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Save</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', width: '400px', textAlign: 'center' }}>
            <AlertTriangle size={40} color="#ef4444" style={{ marginBottom: '1rem' }} />
            <h3 style={{ margin: '0 0 0.5rem' }}>Remove User?</h3>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.5rem' }}>
              <button onClick={() => setShowDeleteConfirm(null)} style={{ padding: '0.5rem 1rem', background: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => handleDelete(showDeleteConfirm)} style={{ padding: '0.5rem 1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
