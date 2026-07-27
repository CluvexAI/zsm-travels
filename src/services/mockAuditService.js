const AUDIT_STORAGE_KEY = 'zsm_audit_logs';

/**
 * Generates a mock IP address for simulation purposes
 */
const getMockIpAddress = () => {
  // In a real app, this comes from the backend request (e.g. req.ip)
  // We'll return a static local IP to simulate a consistent session
  return '192.168.1.104';
};

/**
 * Initializes the audit log storage if it doesn't exist
 */
const initStorage = () => {
  if (!localStorage.getItem(AUDIT_STORAGE_KEY)) {
    // Seed with a system startup event
    const seedEvent = {
      logId: 'AL-' + Date.now().toString(36).toUpperCase(),
      userId: 'SYSTEM',
      userName: 'System Process',
      role: 'SYSTEM',
      action: 'System Initialized',
      entityId: 'SYS',
      timestamp: new Date().toISOString(),
      ipAddress: '127.0.0.1',
      before: null,
      after: { status: 'Running' },
      reason: 'Application startup',
    };
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify([seedEvent]));
  }
};

initStorage();

/**
 * Logs a new immutable event to the audit trail.
 * @param {Object} params - The log parameters
 * @param {Object} params.user - The acting user object (must contain userId, fullName, role)
 * @param {string} params.action - The action performed (e.g., 'Booking Created')
 * @param {string} [params.entityId] - The ID of the affected record
 * @param {Object|string} [params.before] - The state before the change
 * @param {Object|string} [params.after] - The state after the change
 * @param {string} [params.reason] - The reason for the change
 */
export const logEvent = ({ user, action, entityId = 'N/A', before = null, after = null, reason = '' }) => {
  const logs = JSON.parse(localStorage.getItem(AUDIT_STORAGE_KEY) || '[]');
  
  const newLog = {
    logId: 'AL-' + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 1000).toString(),
    userId: user?.userId || 'SYSTEM',
    userName: user?.fullName || user?.email || 'Unknown User',
    role: user?.role || 'SYSTEM',
    action,
    entityId,
    timestamp: new Date().toISOString(),
    ipAddress: getMockIpAddress(),
    before,
    after,
    reason,
  };

  // Prepend to keep newest logs at the beginning
  logs.unshift(newLog);
  
  // Persist back to storage
  localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(logs));
  
  console.log(`[AUDIT] ${action}`, newLog);
  return newLog;
};

/**
 * Retrieves all audit logs, optionally filtered.
 * @param {Object} filters - Optional filters
 * @returns {Array} Array of log objects
 */
export const getLogs = (filters = {}) => {
  let logs = JSON.parse(localStorage.getItem(AUDIT_STORAGE_KEY) || '[]');

  if (filters.userId) {
    logs = logs.filter(l => l.userId === filters.userId);
  }
  if (filters.action) {
    logs = logs.filter(l => l.action.toLowerCase().includes(filters.action.toLowerCase()));
  }
  if (filters.entityId) {
    logs = logs.filter(l => l.entityId.toLowerCase().includes(filters.entityId.toLowerCase()));
  }

  return logs;
};
