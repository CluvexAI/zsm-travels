import React, { useState } from 'react';
import { Shield, User, Eye, EyeOff, Lock, PlaneTakeoff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = ({ onLogin }) => {
  const { MOCK_USERS, login } = useAuth();
  const [selectedRole, setSelectedRole] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const DEMO_CREDS = {
    'u_1001': { username: 'superadmin',    password: 'Admin@123'   },
    'u_1002': { username: 'sarah.sales',   password: 'Sales@123'   },
    'u_1003': { username: 'mike.ops',      password: 'Ops@123'     },
    'u_1004': { username: 'fiona.finance', password: 'Finance@123' },
    'u_1005': { username: 'arthur.audit',  password: 'Audit@123'   },
    'u_1006': { username: 'queenie.qa',    password: 'QA@123'      },
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!selectedRole) { setError('Please select a role to continue.'); return; }
    const user = MOCK_USERS.find(u => u.userId === selectedRole);
    const creds = DEMO_CREDS[selectedRole];
    if (username === creds.username && password === creds.password) {
      login(selectedRole);
      onLogin();
    } else {
      setError('Invalid username or password.');
    }
  };

  const handleQuickLogin = (userId) => {
    login(userId);
    onLogin();
  };

  const selectedUser = MOCK_USERS.find(u => u.userId === selectedRole);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f4c75 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}>
      <div style={{ display: 'flex', gap: '4rem', alignItems: 'center', maxWidth: '1100px', width: '100%' }}>
        {/* Branding Panel */}
        <div style={{ flex: 1, color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <div style={{ background: '#f59e0b', borderRadius: '10px', padding: '0.5rem' }}>
              <PlaneTakeoff size={28} color="white" />
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.5px' }}>ZSM TRAVEL</span>
          </div>
          <h1 style={{ fontSize: '2.75rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1rem' }}>
            Secure Access<br /><span style={{ color: '#38bdf8' }}>Control Center</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '2.5rem' }}>
            Role-Based Access Control ensures every team member has precisely the permissions they need — no more, no less.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { icon: '🔐', label: 'Granular Permission Matrix', desc: 'Module + Action + Scope' },
              { icon: '👥', label: 'Role-Based Data Scoping', desc: 'OWN → TEAM → DEPARTMENT → ALL' },
              { icon: '📋', label: 'Full Audit Trail', desc: 'Every action is logged & monitored' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '0.75rem 1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.label}</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Login Panel */}
        <div style={{
          flex: '0 0 440px',
          background: 'white',
          borderRadius: '20px',
          padding: '2.5rem',
          boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
            <Shield size={20} color="#0ea5e9" />
            <span style={{ fontWeight: 700, fontSize: '1.25rem', color: '#0f172a' }}>Sign In</span>
          </div>

          <form onSubmit={handleLogin}>
            {/* Role Selector */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Select Role</label>
              <select
                value={selectedRole}
                onChange={e => { setSelectedRole(e.target.value); setError(''); }}
                style={{ width: '100%', padding: '0.7rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', color: '#1e293b', background: '#f8fafc', cursor: 'pointer' }}
              >
                <option value="">-- Select your role --</option>
                {MOCK_USERS.map(u => (
                  <option key={u.userId} value={u.userId}>{u.role} — {u.fullName}</option>
                ))}
              </select>
              {selectedUser && (
                <div style={{ marginTop: '0.5rem', padding: '0.5rem 0.75rem', background: '#f0f9ff', borderRadius: '6px', fontSize: '0.78rem', color: '#0369a1', border: '1px solid #bae6fd' }}>
                  <strong>Username:</strong> {DEMO_CREDS[selectedRole]?.username} &nbsp;|&nbsp; <strong>Password:</strong> {DEMO_CREDS[selectedRole]?.password}
                </div>
              )}
            </div>

            {/* Username */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Username</label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={e => { setUsername(e.target.value); setError(''); }}
                  style={{ width: '100%', padding: '0.7rem 1rem 0.7rem 2.5rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  style={{ width: '100%', padding: '0.7rem 2.5rem 0.7rem 2.5rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  {showPassword ? <EyeOff size={16} color="#94a3b8" /> : <Eye size={16} color="#94a3b8" />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ padding: '0.6rem 0.9rem', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '6px', color: '#dc2626', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</div>
            )}

            <button type="submit" style={{ width: '100%', padding: '0.8rem', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', letterSpacing: '0.02em' }}>
              Sign In Securely
            </button>
          </form>

          {/* Demo Quick-Login */}
          <div style={{ marginTop: '1.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Quick Demo Access</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {MOCK_USERS.map(u => (
                <button key={u.userId} onClick={() => handleQuickLogin(u.userId)} style={{
                  padding: '0.35rem 0.75rem', fontSize: '0.75rem', borderRadius: '20px',
                  border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#475569',
                  cursor: 'pointer', fontWeight: 500, transition: 'all 0.15s',
                }}>
                  {u.role.split(' ')[0]} {u.role.split(' ')[1] || ''}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
