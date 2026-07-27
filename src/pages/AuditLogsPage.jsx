import React, { useState, useEffect } from 'react';
import { Search, Filter, Clock, User, Shield, FileText, ChevronRight, RefreshCw, Server, Info } from 'lucide-react';
import { usePermissions } from '../hooks/usePermissions';
import { getLogs } from '../services/mockAuditService';

const diffStyle = {
  background: '#f8fafc',
  padding: '1rem',
  borderRadius: '8px',
  fontFamily: 'monospace',
  fontSize: '0.8rem',
  color: '#334155',
  whiteSpace: 'pre-wrap',
  border: '1px solid #e2e8f0',
  marginTop: '0.5rem',
  maxHeight: '300px',
  overflowY: 'auto'
};

const AuditLogsPage = () => {
  const { hasPermission } = usePermissions();
  const canView = hasPermission('Audit Logs', 'View');

  const [logs, setLogs] = useState([]);
  const [filterAction, setFilterAction] = useState('');
  const [expandedLog, setExpandedLog] = useState(null);

  const fetchLogs = () => {
    setLogs(getLogs({ action: filterAction }));
  };

  useEffect(() => {
    if (canView) {
      fetchLogs();
    }
  }, [canView, filterAction]);

  if (!canView) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
        <Shield size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
        <h2>Access Denied</h2>
        <p>You do not have permission to view Audit Logs.</p>
      </div>
    );
  }

  const toggleExpand = (id) => {
    setExpandedLog(expandedLog === id ? null : id);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: '0 0 0.5rem', fontSize: '1.75rem', color: '#0f172a', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Server size={24} color="#3b82f6" /> Audit & Security Controls
          </h1>
          <p style={{ margin: 0, color: '#64748b' }}>Immutable ledger of all sensitive system actions.</p>
        </div>
        <button onClick={fetchLogs} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: '#475569' }}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Filter by action (e.g. Login, Cost)" 
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.25rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.875rem', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Filter size={14} /> Showing {logs.length} events
          </div>
        </div>

        <div>
          {logs.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No audit logs found.</div>
          ) : (
            logs.map((log) => (
              <div key={log.logId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <div 
                  onClick={() => toggleExpand(log.logId)}
                  style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', background: expandedLog === log.logId ? '#f8fafc' : 'white', transition: 'background 0.2s' }}
                >
                  <div style={{ color: '#94a3b8' }}>
                    <ChevronRight size={18} style={{ transform: expandedLog === log.logId ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{log.action}</span>
                      {log.entityId !== 'N/A' && (
                        <span style={{ background: '#f1f5f9', padding: '0.1rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', color: '#475569', fontWeight: 600 }}>ID: {log.entityId}</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.8rem', color: '#64748b' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><User size={14} /> {log.userName} ({log.role})</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={14} /> {new Date(log.timestamp).toLocaleString()}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Server size={14} /> {log.ipAddress}</span>
                    </div>
                  </div>
                </div>

                {expandedLog === log.logId && (
                  <div style={{ padding: '1rem 1.25rem 1.5rem 3.5rem', background: '#f8fafc', borderTop: '1px dashed #e2e8f0' }}>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#475569' }}>
                      <Info size={16} color="#3b82f6" /> 
                      <strong>Log ID:</strong> <span style={{ fontFamily: 'monospace' }}>{log.logId}</span>
                      {log.reason && <span style={{ marginLeft: '1rem' }}><strong>Reason:</strong> {log.reason}</span>}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      <div>
                        <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em' }}>Before</h4>
                        <div style={diffStyle}>
                          {log.before ? JSON.stringify(log.before, null, 2) : <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>N/A (No previous state)</span>}
                        </div>
                      </div>
                      <div>
                        <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em' }}>After</h4>
                        <div style={diffStyle}>
                          {log.after ? JSON.stringify(log.after, null, 2) : <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>N/A (No new state)</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLogsPage;
