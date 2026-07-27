import assert from 'node:assert';
import { getPermissionsForRole, filterDataByScope, ROLES } from './mockAuthService.js';

console.log('\n=== Starting RBAC Security Validation Suite ===\n');

let passCount = 0;
let failCount = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`[PASS] ${name}`);
    passCount++;
  } catch (err) {
    console.error(`[FAIL] ${name}`);
    console.error(`       ${err.message}`);
    failCount++;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. MOCK DATA SETUP
// ─────────────────────────────────────────────────────────────────────────────
const mockBookings = [
  { id: 'B-101', agent: 'Agent Alice', assignedAgent: 'Ops Bob', status: 'Confirmed' },
  { id: 'B-102', agent: 'Agent Charlie', assignedAgent: 'Ops Dave', status: 'On Hold' },
  { id: 'B-103', agent: 'Agent Alice', assignedAgent: 'Ops Dave', status: 'Escalated' },
];

const MOCK_USERS = {
  salesAlice: { fullName: 'Agent Alice', role: ROLES.SALES_AGENT },
  opsBob: { fullName: 'Ops Bob', role: ROLES.OPS_AGENT },
  admin: { fullName: 'System Admin', role: ROLES.ADMIN },
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. SALES AGENT TESTS
// ─────────────────────────────────────────────────────────────────────────────
runTest('Sales Agent: Cannot access another agent\'s booking (IDOR Protection)', () => {
  const aliceBookings = filterDataByScope(mockBookings, MOCK_USERS.salesAlice, 'Bookings', 'View');
  assert.strictEqual(aliceBookings.length, 2, 'Should only see 2 bookings');
  assert.strictEqual(aliceBookings.some(b => b.id === 'B-102'), false, 'Should not see Charlie\'s booking');
});

runTest('Sales Agent: Cannot see Actual Cost (Field-Level Leakage Protection)', () => {
  const perms = getPermissionsForRole(ROLES.SALES_AGENT);
  const actualCostView = perms['Actual Cost']?.View || [];
  assert.strictEqual(actualCostView.length, 0, 'Actual Cost should be hidden (empty array)');
});

runTest('Sales Agent: Cannot process refund, can only request', () => {
  const perms = getPermissionsForRole(ROLES.SALES_AGENT);
  const refundProcess = perms['Refunds']?.Process || [];
  const refundRequest = perms['Refunds']?.Request || [];
  assert.strictEqual(refundProcess.length, 0, 'Cannot process refunds');
  assert.deepStrictEqual(refundRequest, ['Own'], 'Can request refunds');
});

runTest('Sales Agent: Can create quality tickets', () => {
  const perms = getPermissionsForRole(ROLES.SALES_AGENT);
  assert.deepStrictEqual(perms['Quality Escalations']?.Create, ['Own']);
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. OPS AGENT TESTS
// ─────────────────────────────────────────────────────────────────────────────
runTest('Ops Agent: Can access bookings (All) but Refund processing is Assigned', () => {
  const bobBookings = filterDataByScope(mockBookings, MOCK_USERS.opsBob, 'Bookings', 'View');
  assert.strictEqual(bobBookings.length, 3, 'Ops can view all bookings');
  const perms = getPermissionsForRole(ROLES.OPS_AGENT);
  assert.deepStrictEqual(perms['Refunds']?.Process, ['Assigned'], 'Process refunds is assigned scope');
});

runTest('Ops Agent: Can process PNR and view Actual Cost', () => {
  const perms = getPermissionsForRole(ROLES.OPS_AGENT);
  assert.deepStrictEqual(perms['PNR']?.Edit, ['All']);
  assert.deepStrictEqual(perms['Actual Cost']?.View, ['All']);
});

runTest('Ops Agent: Cannot manage users', () => {
  const perms = getPermissionsForRole(ROLES.OPS_AGENT);
  const userManage = perms['Users']?.Manage || [];
  assert.strictEqual(userManage.length, 0, 'User manage should be empty array');
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. QUALITY AGENT TESTS
// ─────────────────────────────────────────────────────────────────────────────
runTest('Quality Agent: Can resolve escalations', () => {
  const perms = getPermissionsForRole(ROLES.QUALITY_AGENT);
  assert.ok(perms['Quality Escalations']?.Resolve || perms['Quality Escalations']?.Edit || perms['Quality Escalations']?.Full || perms['Quality Escalations']?.Process);
});

runTest('Quality Agent: Cannot process payment', () => {
  const perms = getPermissionsForRole(ROLES.QUALITY_AGENT);
  const payment = perms['Payments']?.Initiate || [];
  assert.strictEqual(payment.length, 0);
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. FINANCE AGENT TESTS
// ─────────────────────────────────────────────────────────────────────────────
runTest('Finance Agent: Can process refund and view Actual Cost', () => {
  const perms = getPermissionsForRole(ROLES.FINANCE);
  assert.deepStrictEqual(perms['Refunds']?.Process, ['All']);
  assert.deepStrictEqual(perms['Actual Cost']?.View, ['All']);
});

runTest('Finance Agent: Cannot modify PNR', () => {
  const perms = getPermissionsForRole(ROLES.FINANCE);
  const pnrEdit = perms['PNR']?.Edit || [];
  assert.strictEqual(pnrEdit.length, 0); // Only 'View' access
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. ADMIN & SECURITY ESCALATION
// ─────────────────────────────────────────────────────────────────────────────
runTest('Admin: Can view all records and manage roles', () => {
  const perms = getPermissionsForRole(ROLES.ADMIN);
  // Admin has '*' wildcard
  assert.ok(perms['*']?.['*']?.[0] === 'All');
  
  const adminBookings = filterDataByScope(mockBookings, MOCK_USERS.admin, 'Bookings', 'View');
  assert.strictEqual(adminBookings.length, 3, 'Admin sees all');
});

runTest('Security: Role Escalation Prevention', () => {
  const salesPerms = getPermissionsForRole(ROLES.SALES_AGENT);
  const canManageRoles = salesPerms['Roles & Permissions']?.Edit || [];
  assert.strictEqual(canManageRoles.length, 0, 'Sales cannot change roles');
});

console.log(`\n=== Suite Completed ===`);
console.log(`Total: ${passCount + failCount}`);
console.log(`Passed: ${passCount}`);
console.log(`Failed: ${failCount}`);

if (failCount > 0) {
  process.exit(1);
}
