import React, { useState, useEffect } from 'react';
import { Mail, Save, Eye, EyeOff, CheckCircle, Server } from 'lucide-react';
import { usePermissions } from '../hooks/usePermissions';
import { getMetadata, setMetadata } from '../services/supabase';

const SMTP_KEY = 'smtpConfig';

const DEFAULT_CONFIG = {
  host: '',
  port: '587',
  security: 'TLS',
  username: '',
  password: '',
  fromName: '',
  fromEmail: '',
  replyTo: '',
};

const SmtpSettings = () => {
  const { hasPermission } = usePermissions();
  const canManage = hasPermission('System Settings', 'Manage');

  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const load = async () => {
      const saved = await getMetadata(SMTP_KEY);
      if (saved) setConfig({ ...DEFAULT_CONFIG, ...saved });
      setLoading(false);
    };
    load();
  }, []);

  const update = (field, value) => setConfig(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!config.host.trim() || !config.port.trim() || !config.fromEmail.trim()) {
      setErrorMsg('Host, Port, and From Email are required.');
      setTimeout(() => setErrorMsg(''), 3000);
      return;
    }
    setSaving(true);
    setErrorMsg('');
    await setMetadata(SMTP_KEY, { ...config, updated_at: new Date().toISOString() });
    setSaving(false);
    setSuccessMsg('SMTP settings saved successfully.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const inputStyle = {
    width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #cbd5e1',
    borderRadius: '8px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
    backgroundColor: canManage ? 'white' : '#f8fafc',
  };
  const labelStyle = { display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.03em' };
  const cardStyle = { background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' };

  if (loading) {
    return <div style={{ padding: '2rem', color: '#94a3b8' }}>Loading SMTP settings...</div>;
  }

  return (
    <div style={{ padding: '2rem', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Mail size={22} color="#0ea5e9" /> SMTP Settings
          </h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
            Configure the mail server used to send booking and authorization emails.
          </p>
        </div>
        {canManage && (
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.875rem', cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1 }}
          >
            <Save size={16} /> {saving ? 'Saving...' : 'Save Settings'}
          </button>
        )}
      </div>

      {successMsg && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#dcfce7', border: '1px solid #bbf7d0', color: '#166534', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.875rem', fontWeight: 600 }}>
          <CheckCircle size={16} /> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.875rem', fontWeight: 600 }}>
          {errorMsg}
        </div>
      )}

      <div style={{ ...cardStyle, padding: '2rem', maxWidth: '760px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
          <Server size={18} color="#64748b" />
          <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Mail Server</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <div>
            <label style={labelStyle}>SMTP Host *</label>
            <input type="text" style={inputStyle} disabled={!canManage} value={config.host} onChange={e => update('host', e.target.value)} placeholder="smtp.example.com" />
          </div>
          <div>
            <label style={labelStyle}>Port *</label>
            <input type="number" style={inputStyle} disabled={!canManage} value={config.port} onChange={e => update('port', e.target.value)} placeholder="587" />
          </div>
          <div>
            <label style={labelStyle}>Security</label>
            <select style={{ ...inputStyle, backgroundColor: canManage ? 'white' : '#f8fafc' }} disabled={!canManage} value={config.security} onChange={e => update('security', e.target.value)}>
              <option value="TLS">TLS</option>
              <option value="SSL">SSL</option>
              <option value="None">None</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Username</label>
            <input type="text" style={inputStyle} disabled={!canManage} value={config.username} onChange={e => update('username', e.target.value)} placeholder="mailer@example.com" autoComplete="off" />
          </div>
          <div>
            <label style={labelStyle}>Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPassword ? 'text' : 'password'} style={{ ...inputStyle, paddingRight: '2.4rem' }} disabled={!canManage} value={config.password} onChange={e => update('password', e.target.value)} placeholder="••••••••" autoComplete="new-password" />
              <button type="button" onClick={() => setShowPassword(v => !v)} style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0, display: 'flex' }} title={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid #e2e8f0' }}>
          <h2 style={{ margin: '0 0 1.25rem', fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Sender Identity</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={labelStyle}>From Name</label>
              <input type="text" style={inputStyle} disabled={!canManage} value={config.fromName} onChange={e => update('fromName', e.target.value)} placeholder="ZSM Travel" />
            </div>
            <div>
              <label style={labelStyle}>From Email *</label>
              <input type="email" style={inputStyle} disabled={!canManage} value={config.fromEmail} onChange={e => update('fromEmail', e.target.value)} placeholder="bookings@zsmtravel.com" />
            </div>
            <div>
              <label style={labelStyle}>Reply-To Email</label>
              <input type="email" style={inputStyle} disabled={!canManage} value={config.replyTo} onChange={e => update('replyTo', e.target.value)} placeholder="support@zsmtravel.com" />
            </div>
          </div>
        </div>

        {!canManage && (
          <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: '#94a3b8' }}>You do not have permission to modify SMTP settings. Contact a Super Admin.</p>
        )}
      </div>
    </div>
  );
};

export default SmtpSettings;
