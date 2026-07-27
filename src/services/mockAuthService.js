export const ROLES = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  SALES_AGENT: 'Sales Agent',
  OPS_AGENT: 'Booking / Ops Agent',
  QUALITY_AGENT: 'Quality Assurance',
  FINANCE: 'Accounts / Finance',
  CUSTOMER_SUPPORT: 'Customer Support',
  AUDITOR: 'Read-Only / Auditor',
};

// ─────────────────────────────────────────────────────────────────────────────
// MASTER PERMISSION MATRIX
// Format: Module -> Action -> [Scopes]
// Scopes: 'All' | 'Team' | 'Own' | 'Assigned' | 'Department' | 'Relevant'
// ─────────────────────────────────────────────────────────────────────────────
export const PERMISSION_MATRIX = {

  // ─── SUPER ADMIN ── Full access to everything ───────────────────────────
  [ROLES.SUPER_ADMIN]: {
    '*':          { '*':      ['All'] },
    'Audit Logs': { 'Delete': []     }, // immutable — no silent deletion
  },

  // ─── ADMIN ── Full access, restricted from security/system config ────────
  [ROLES.ADMIN]: {
    '*':                      { '*':      ['All'] },
    'System Settings':        { 'Manage': []      },
    'Security Configuration': { 'Manage': []      },
    'Audit Logs':             { 'Delete': []      },
  },

  // ─── MANAGER ── Business oversight, team-level scope ────────────────────
  // Dashboard:Full | Users:View | Roles:No | Bookings:Create+Team/All
  // PNR:View | Actual Cost:Optional(No by default) | Payment:View
  // Refund:Approve | Chargeback:View | Service:View | QA Ticket:View
  // Reports:Full | Export:Yes | Audit Logs:View | System Settings:No
  [ROLES.MANAGER]: {
    'Dashboard':           { 'View': ['All'] },
    'Users':               { 'View': ['Team'] },
    'Roles & Permissions': { 'View': [] },
    'Bookings': {
      'View':   ['Team', 'All'],
      'Create': ['All'],
      'Edit':   ['Team'],
      'Assign': ['Team'],
    },
    'Flight Search':       { 'View': ['All'], 'Create': ['All'] },
    'Passengers':          { 'View': ['Team', 'Own'], 'Edit': ['Team', 'Own'] },
    'PNR':                 { 'View': ['Team', 'Own'] },
    'Ticketing':           { 'View': ['Team', 'Own'] },
    'Payments':            { 'View': ['Team', 'Own'] },
    'Fare Breakdown':      { 'View': ['Team', 'Own'] },
    'Actual Cost':         { 'View': [] },
    'Customer DOB':        { 'View': ['All'] },
    'Phone':               { 'View': ['All'] },
    'Email':               { 'View': ['All'] },
    'Gateway Reference':   { 'View': ['All'] },
    'Cardholder Declaration': { 'View': ['All'] },
    'Refunds':             { 'View': ['All'], 'Approve': ['All'] },
    'Chargebacks':         { 'View': ['All'] },
    'Service Actions':     { 'View': ['All'] },
    'Quality Escalations': { 'View': ['All'] },
    'Notes':               { 'View': ['All'], 'Create': ['All'], 'Edit': ['Own'] },
    'Reports':             { 'View': ['All'], 'Export': ['All'], 'Download': ['All'] },
    'Audit Logs':          { 'View': ['All'] },
    'System Settings':     { 'Manage': [] },
  },

  // ─── SALES AGENT ── Own bookings + request actions ──────────────────────
  // Dashboard:Own | Users:No | Roles:No | Bookings:Create+Own
  // PNR:Request | Actual Cost:No | Payment:Initiate | Refund:Request
  // Chargeback:No | Service:Request | QA Ticket:Create
  // Reports:Own | Export:Own | Audit Logs:Own Activity | System:No
  [ROLES.SALES_AGENT]: {
    'Dashboard':           { 'View': ['Own'] },
    'Bookings':            { 'View': ['Own', 'Assigned'], 'Create': ['All'], 'Edit': ['Own', 'Assigned'] },
    'Flight Search':       { 'View': ['All'], 'Create': ['All'] },
    'Passengers':          { 'View': ['Own', 'Assigned'], 'Create': ['All'], 'Edit': ['Own', 'Assigned'] },
    'PNR':                 { 'View': ['Own'], 'Request': ['Own'] },
    'Payments':            { 'View': ['Own'], 'Initiate': ['Own'] },
    'Fare Breakdown':      { 'View': ['Own'] },
    'Customer DOB':        { 'View': ['Own'] },
    'Phone':               { 'View': ['Own'] },
    'Email':               { 'View': ['Own'] },
    'Refunds':             { 'Request': ['Own'] },
    'Service Actions':     { 'View': ['Own'], 'Request': ['Own'] },
    'Quality Escalations': { 'View': ['Own'], 'Create': ['Own'] },
    'Notes':               { 'View': ['Own'], 'Create': ['Own'] },
    'Reports':             { 'View': ['Own'], 'Export': ['Own'] },
    'Audit Logs':          { 'View': ['Own'] },
    // Granular Post-Booking Actions — Request only
    'Action: Cancellation for Refund': { 'Request': ['Own'] },
    'Action: Cancellation for Credit': { 'Request': ['Own'] },
    'Action: Itinerary Change':        { 'Request': ['Own'] },
    'Action: Name Correction':         { 'Request': ['Own'] },
    'Action: Seat Assignment':         { 'Request': ['Own'] },
    'Action: Seat Upgrade':            { 'Request': ['Own'] },
    'Action: Baggage':                 { 'Request': ['Own'] },
    'Action: Pet Booking':             { 'Request': ['Own'] },
    'Action: Minor Alone Booking':     { 'Request': ['Own'] },
    // Explicit Denials
    'Actual Cost':         { 'View': [] },
    'Chargebacks':         { 'View': [] },
    'Gateway Reference':   { 'View': [] },
    'Cardholder Declaration': { 'View': [] },
    'Users':               { 'Manage': [], 'Create': [], 'Delete': [] },
    'Roles & Permissions': { 'Manage': [], 'Edit': [] },
    'System Settings':     { 'Manage': [] },
  },

  // ─── BOOKING / OPS AGENT ── Full booking execution ──────────────────────
  // Dashboard:Team | Users:No | Roles:No | Bookings:Create+Assigned/All
  // PNR:Full | Actual Cost:Yes(View+Edit) | Payment:View
  // Refund:Request+Process | Chargeback:No | Service:Process
  // QA Ticket:Create | Reports:Team | Export:Assigned
  // Audit Logs:Own Activity | System:No
  [ROLES.OPS_AGENT]: {
    'Dashboard':       { 'View': ['Team'] },
    'Bookings': {
      'View':   ['All'],
      'Create': ['All'],
      'Edit':   ['All'],
      'Assign': ['All'],
    },
    'Flight Search':   { 'View': ['All'] },
    'Passengers':      { 'View': ['All'], 'Edit': ['All'] },
    'PNR':             { 'View': ['All'], 'Create': ['All'], 'Edit': ['All'] },
    'Ticketing':       { 'View': ['All'], 'Create': ['All'], 'Edit': ['All'] },
    'Fare Breakdown':  { 'View': ['All'] },
    'Actual Cost':     { 'View': ['All'], 'Edit': ['All'] },
    'Customer DOB':    { 'View': ['All'] },
    'Phone':           { 'View': ['All'] },
    'Email':           { 'View': ['All'] },
    'Gateway Reference': { 'View': ['All'] },
    'Cardholder Declaration': { 'View': ['All'] },
    'Payments':        { 'View': ['All'] },
    'Refunds':         { 'View': ['All'], 'Request': ['All'], 'Process': ['Assigned'] },
    'Service Actions': { 'View': ['All'], 'Process': ['All'] },
    'Quality Escalations': { 'View': ['All'], 'Create': ['All'] },
    'Notes':           { 'View': ['All'], 'Create': ['All'] },
    'Reports':         { 'View': ['Team'], 'Export': ['Assigned'] },
    'Audit Logs':      { 'View': ['Own'] },
    // Granular Post-Booking Actions — Process / Execute
    'Action: Cancellation for Refund': { 'Process': ['All'] },
    'Action: Cancellation for Credit': { 'Process': ['All'] },
    'Action: Itinerary Change':        { 'Process': ['All'] },
    'Action: Name Correction':         { 'Process': ['All'] },
    'Action: Seat Assignment':         { 'Process': ['All'] },
    'Action: Seat Upgrade':            { 'Process': ['All'] },
    'Action: Baggage':                 { 'Process': ['All'] },
    'Action: Pet Booking':             { 'Process': ['All'] },
    'Action: Minor Alone Booking':     { 'Process': ['All'] },
    // Explicit Denials
    'Chargebacks':         { 'View': [] },
    'Users':               { 'Manage': [], 'Create': [], 'Delete': [] },
    'Roles & Permissions': { 'Manage': [], 'Edit': [] },
    'System Settings':     { 'Manage': [] },
  },

  // ─── QUALITY ASSURANCE ── Escalation workflow only ──────────────────────
  // Dashboard:Limited | Users:No | Roles:No | Bookings:View(Escalated)
  // PNR:View | Actual Cost:No | Payment:No | Refund:No
  // Chargeback:No | Service:View | QA Ticket:Full
  // Reports:Quality | Export:Assigned | Audit Logs:Relevant | System:No
  [ROLES.QUALITY_AGENT]: {
    'Dashboard':       { 'View': ['Own'] },
    'Bookings':        { 'View': ['Assigned'] },
    'Passengers':      { 'View': ['All'] },
    'PNR':             { 'View': ['All'] },
    'Ticketing':       { 'View': ['All'] },
    'Payments':        { 'View': ['All'] },
    'Fare Breakdown':  { 'View': ['All'] },
    'Customer DOB':    { 'View': ['All'] },
    'Phone':           { 'View': ['All'] },
    'Email':           { 'View': ['All'] },
    'Gateway Reference': { 'View': ['All'] },
    'Cardholder Declaration': { 'View': ['All'] },
    'Service Actions': { 'View': ['All'] },
    'Quality Escalations': {
      'View':     ['All'],
      'Create':   ['All'],
      'Edit':     ['All'],
      'Assign':   ['All'],
      'Resolve':  ['All'],
      'Escalate': ['All'],
      'Reject':   ['All'],
    },
    'Notes':      { 'View': ['All'], 'Create': ['All'], 'Edit': ['Own'] },
    'Reports':    { 'View': ['Own'], 'Export': ['Assigned'] },
    'Audit Logs': { 'View': ['Relevant'] },
    // Explicit Denials
    'Actual Cost':         { 'View': [] },
    'Refunds':             { 'Approve': [], 'Process': [], 'Create': [] },
    'Chargebacks':         { 'Edit': [], 'Resolve': [] },
    'Users':               { 'Manage': [], 'Create': [], 'Delete': [] },
    'Roles & Permissions': { 'Manage': [], 'Edit': [] },
    'System Settings':     { 'Manage': [] },
  },

  // ─── ACCOUNTS / FINANCE ── Most sensitive financial permissions ──────────
  // Dashboard:Financial | Users:No | Roles:No | Bookings:View Relevant
  // PNR:View | Actual Cost:Yes | Payment:Full | Refund:Process
  // Chargeback:Full | Service:Financial | QA Ticket:Create
  // Reports:Financial | Export:Financial | Audit Logs:Financial | System:No
  [ROLES.FINANCE]: {
    'Dashboard':        { 'View': ['All'] },
    'Bookings':         { 'View': ['All'], 'Edit': ['All'] },
    'Passengers':       { 'View': ['All'] },
    'PNR':              { 'View': ['All'] },
    'Ticketing':        { 'View': ['All'] },
    'Payments': {
      'View':   ['All'],
      'Edit':   ['All'],
      'Refund': ['All'],
      'Charge': ['All'],
    },
    'Fare Breakdown':      { 'View': ['All'] },
    'Actual Cost':         { 'View': ['All'] },
    'Actual Misc Cost':    { 'View': ['All'] },
    'Customer DOB':        { 'View': ['All'] },
    'Phone':               { 'View': ['All'] },
    'Email':               { 'View': ['All'] },
    'Gateway Reference':   { 'View': ['All'] },
    'Cardholder Declaration': { 'View': ['All'] },
    'Refunds': {
      'View':    ['All'],
      'Create':  ['All'],
      'Approve': ['All'],
      'Reject':  ['All'],
      'Review':  ['All'],
      'Process': ['All'],
    },
    'Chargebacks': {
      'View':    ['All'],
      'Edit':    ['All'],
      'Resolve': ['All'],
      'Manage':  ['All'],
    },
    'Invoices':            { 'View': ['All'], 'Create': ['All'], 'Edit': ['All'], 'Export': ['All'] },
    'Service Actions':     { 'View': ['All'] },
    'Quality Escalations': { 'View': ['All'], 'Create': ['All'] },
    'Notes':               { 'View': ['All'], 'Create': ['All'] },
    'Reports':             { 'View': ['All'], 'Export': ['All'], 'Download': ['All'] },
    'Audit Logs':          { 'View': ['All'] },
    'Action: Cancellation for Refund': { 'Process': ['All'], 'Approve': ['All'] },
    // Explicit Denials
    'Users':               { 'Manage': [], 'Create': [], 'Delete': [] },
    'Roles & Permissions': { 'Manage': [], 'Edit': [] },
    'System Settings':     { 'Manage': [] },
  },

  // ─── CUSTOMER SUPPORT ── Service & search, no financial access ──────────
  // Dashboard:Limited | Users:No | Roles:No | Bookings:View(search)
  // PNR:View | Actual Cost:No | Payment:No | Refund:Request
  // Chargeback:No | Service:Request | QA Ticket:Create
  // Reports:Limited | Export:No | Audit Logs:Own Activity | System:No
  [ROLES.CUSTOMER_SUPPORT]: {
    'Dashboard':    { 'View': ['Own'] },
    'Bookings':     { 'View': ['All'], 'Edit': ['Limited'] },
    'Passengers':   { 'View': ['All'] },
    'Flight Search':{ 'View': ['All'] },
    'PNR':          { 'View': ['All'] },
    'Ticketing':    { 'View': ['All'] },
    'Customer Support': {
      'View':   ['All'],
      'Create': ['All'],
      'Edit':   ['Own'],
    },
    'Customer DOB':        { 'View': ['All'] },
    'Phone':               { 'View': ['All'] },
    'Email':               { 'View': ['All'] },
    'Refunds':             { 'Request': ['All'] },
    'Service Actions':     { 'View': ['All'], 'Request': ['All'] },
    'Quality Escalations': { 'View': ['All'], 'Create': ['All'] },
    'Notes':               { 'View': ['All'], 'Create': ['All'] },
    'Reports':             { 'View': ['Own'] },
    'Audit Logs':          { 'View': ['Own'] },
    // Granular Post-Booking Actions — Request only
    'Action: Cancellation for Refund': { 'Request': ['All'] },
    'Action: Cancellation for Credit': { 'Request': ['All'] },
    'Action: Itinerary Change':        { 'Request': ['All'] },
    'Action: Name Correction':         { 'Request': ['All'] },
    'Action: Seat Assignment':         { 'Request': ['All'] },
    'Action: Seat Upgrade':            { 'Request': ['All'] },
    'Action: Baggage':                 { 'Request': ['All'] },
    // Explicit Denials
    'Actual Cost':         { 'View': [] },
    'Fare Breakdown':      { 'View': [] },
    'Gateway Reference':   { 'View': [] },
    'Cardholder Declaration': { 'View': [] },
    'Payments':            { 'Charge': [], 'Refund': [], 'Edit': [] },
    'Chargebacks':         { 'View': [] },
    'Users':               { 'Manage': [], 'Create': [], 'Delete': [] },
    'Roles & Permissions': { 'Manage': [], 'Edit': [] },
    'System Settings':     { 'Manage': [] },
  },

  // ─── READ-ONLY / AUDITOR ── View all authorised records ─────────────────
  [ROLES.AUDITOR]: {
    'Dashboard':           { 'View': ['All'] },
    'Bookings':            { 'View': ['All'] },
    'Passengers':          { 'View': ['All'] },
    'PNR':                 { 'View': ['All'] },
    'Ticketing':           { 'View': ['All'] },
    'Payments':            { 'View': ['All'] },
    'Fare Breakdown':      { 'View': ['All'] },
    'Actual Cost':         { 'View': ['All'] },
    'Refunds':             { 'View': ['All'] },
    'Chargebacks':         { 'View': ['All'] },
    'Invoices':            { 'View': ['All'] },
    'Notes':               { 'View': ['All'] },
    'Service Actions':     { 'View': ['All'] },
    'Quality Escalations': { 'View': ['All'] },
    'Customer Support':    { 'View': ['All'] },
    'Reports':             { 'View': ['All'], 'Download': ['All'] },
    'Audit Logs':          { 'View': ['All'] },
  },
};

export const MOCK_USERS = [
  {
    userId: 'u_1001',
    employeeId: 'EMP-001',
    fullName: 'Admin User',
    email: 'admin@zsmtravel.com',
    role: ROLES.SUPER_ADMIN,
    department: 'IT',
    status: 'Active',
    assignedTeam: 'Leadership',
  },
  {
    userId: 'u_1002',
    employeeId: 'EMP-024',
    fullName: 'Sarah Sales',
    email: 'sarah@zsmtravel.com',
    role: ROLES.SALES_AGENT,
    department: 'Sales',
    status: 'Active',
    assignedTeam: 'North America Sales',
  },
  {
    userId: 'u_1003',
    employeeId: 'EMP-056',
    fullName: 'Mike Ops',
    email: 'mike@zsmtravel.com',
    role: ROLES.OPS_AGENT,
    department: 'Operations',
    status: 'Active',
    assignedTeam: 'Ticketing Support',
  },
  {
    userId: 'u_1004',
    employeeId: 'EMP-088',
    fullName: 'Fiona Finance',
    email: 'fiona@zsmtravel.com',
    role: ROLES.FINANCE,
    department: 'Accounts',
    status: 'Active',
    assignedTeam: 'Reconciliation',
  },
  {
    userId: 'u_1006',
    employeeId: 'EMP-101',
    fullName: 'Queenie QA',
    email: 'queenie@zsmtravel.com',
    role: ROLES.QUALITY_AGENT,
    department: 'Quality',
    status: 'Active',
    assignedTeam: 'Quality Review',
  },
  {
    userId: 'u_1005',
    employeeId: 'EMP-092',
    fullName: 'Arthur Auditor',
    email: 'arthur@zsmtravel.com',
    role: ROLES.AUDITOR,
    department: 'Compliance',
    status: 'Active',
    assignedTeam: 'Audit & Compliance',
  },
];

export const getPermissionsForRole = (role) => {
  return PERMISSION_MATRIX[role] || {};
};

export const authenticateMockUser = (userId) => {
  return MOCK_USERS.find(u => u.userId === userId) || null;
};

/**
 * filterDataByScope — Simulates backend authorization layer.
 * Filters data arrays by the user's allowed scope for a given module/action.
 */
export const filterDataByScope = (data, user, module, action = 'View') => {
  if (user.role === ROLES.SUPER_ADMIN || user.role === ROLES.ADMIN) return data;

  const permissions = getPermissionsForRole(user.role);
  const modulePerms = permissions[module] || permissions['*'] || {};
  const allowedScopes = modulePerms[action] || [];

  if (allowedScopes.includes('All'))        return data;
  if (allowedScopes.includes('Department')) return data.filter(item => item.department   === user.department);
  if (allowedScopes.includes('Team'))       return data.filter(item => item.assignedTeam === user.assignedTeam || item.agent === user.fullName);
  if (allowedScopes.includes('Own') || allowedScopes.includes('Assigned'))
    return data.filter(item => item.agent === user.fullName || item.assignedAgent === user.fullName);

  return []; // No matching scope = Access Denied
};

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURABLE REFUND APPROVAL THRESHOLDS
// Update these values to adjust the workflow without touching role code.
// Workflow: Sales Agent → Refund Request → Ops/Support Review →
//           Finance Validation → Manager Approval (if threshold exceeded) →
//           Refund Processed → Audit Log
// ─────────────────────────────────────────────────────────────────────────────
export const REFUND_THRESHOLDS = {
  LOW:    { max: 200,  approver: ROLES.FINANCE,     label: 'Finance Approval'      },
  MEDIUM: { max: 1000, approver: ROLES.MANAGER,     label: 'Manager Approval'      },
  HIGH:   { max: 5000, approver: ROLES.ADMIN,       label: 'Admin Approval'        },
  OVER:   { max: null, approver: ROLES.SUPER_ADMIN, label: 'Super Admin Approval'  },
};

export const getRefundApprover = (amount) => {
  if (amount <= REFUND_THRESHOLDS.LOW.max)    return { level: 'LOW',    ...REFUND_THRESHOLDS.LOW    };
  if (amount <= REFUND_THRESHOLDS.MEDIUM.max) return { level: 'MEDIUM', ...REFUND_THRESHOLDS.MEDIUM };
  if (amount <= REFUND_THRESHOLDS.HIGH.max)   return { level: 'HIGH',   ...REFUND_THRESHOLDS.HIGH   };
  return                                              { level: 'OVER',   ...REFUND_THRESHOLDS.OVER   };
};

/**
 * Updates a specific permission for a role in the in-memory matrix.
 * Used by the Roles & Permissions Admin UI.
 */
export const updateRolePermission = (role, module, action, granted, scopes = ['All']) => {
  if (!PERMISSION_MATRIX[role]) return;
  if (!PERMISSION_MATRIX[role][module]) {
    PERMISSION_MATRIX[role][module] = {};
  }
  
  if (granted) {
    PERMISSION_MATRIX[role][module][action] = scopes;
  } else {
    // Revoke permission (empty array or delete the key)
    PERMISSION_MATRIX[role][module][action] = [];
  }
  
  // If we wanted this to persist across reloads in the prototype, we would serialize PERMISSION_MATRIX to localStorage here.
  // For now, in-memory mutation is sufficient for the UI demonstration.
};
