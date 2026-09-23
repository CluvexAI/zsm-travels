import { buildAuthorizationEmail, buildAuthorizationMailto, buildAuthorizationEmailHtml } from '../src/utils/authorizationEmailTemplate.js';

const formData = {
  passengers: [{ title: 'Mr', firstName: 'John', middleName: '', lastName: 'Smith', dob: '1990-05-12', gender: 'Male', email: 'john.smith@example.com', eTicket: '001-2345678901', carryOn: '1 Bag (Included)', checkInBag: '1 Bag (23kg)' }],
  billingEmail: 'billing@example.com',
  cardNumber: '4111 1111 1111 4321',
  outboundFlight: { airline: 'American Airlines', flightCode: 'AA204', date: 'Oct 15, 2026', time: '10:15 AM', route: 'JFK', dest: 'LAX', duration: '6h 30m' },
  inboundFlight: { airline: 'American Airlines', flightCode: 'AA305', date: 'Oct 22, 2026', time: '09:00 AM', route: 'LAX', dest: 'JFK', duration: '5h 30m' },
};
const airlinePnrs = [{ airline: 'American Airlines', pnr: 'INFT48275622', status: 'On Hold' }];
const args = { formData, tripType: 'Round Trip', totalCost: 1250.00, airlinePnrs };

const email = buildAuthorizationEmail(args);
const mailto = buildAuthorizationMailto(args);

const checks = [];
const check = (label, pass, detail = '') => checks.push({ label, pass, detail });

check('recipient is passenger email', email.to === 'john.smith@example.com', email.to);
check('mailto targets recipient', mailto.startsWith('mailto:john.smith%40example.com'));
check('subject present', email.subject.length > 0, email.subject);
check('mailto length within modern limit', mailto.length <= 8000, `len=${mailto.length}${mailto.length > 2000 ? ' (legacy IE-only limit is 2000)' : ''}`);
check('text has PNR', email.text.includes('INFT48275622'));
check('text has total USD 1250.00', email.text.includes('USD 1250.00'));
check('text has greeting', email.text.includes('Dear John Smith'));
check('text has card last4', email.text.includes('(4321)'));
check('text has outbound flight', email.text.includes('AA204'));
check('text has policies', email.text.includes('Policies, Restrictions and/or Penalties'));
check('html doctype', email.html.startsWith('<!DOCTYPE html>'));
check('html closes', email.html.trim().endsWith('</html>'));
check('html has PNR', email.html.includes('INFT48275622'));
check('html has flight row', email.html.includes('AA204'));
check('html has passenger row', email.html.includes('John Smith'));
check('html has footer phone', email.html.includes('+1 800 555 0199'));

const empty = buildAuthorizationEmail({ formData: { passengers: [{ email: '' }] }, tripType: 'One Way', totalCost: 0, airlinePnrs: [] });
check('empty: pnr fallback', empty.html.includes('PENDING'));
check('empty: card fallback', empty.html.includes('(0000)'));
check('empty: default name', empty.html.includes('Dear John Smith'));

const evilHtml = buildAuthorizationEmailHtml({ formData: { passengers: [{ firstName: '<img onerror=x>', lastName: 'a"b', email: 'x@y.z' }], outboundFlight: null }, tripType: 'One Way', totalCost: 0, airlinePnrs: [] });
check('XSS escaped', !evilHtml.includes('<img onerror') && evilHtml.includes('&lt;img'));

// mailto URI-decodes back to original text
const bodyParam = mailto.split('&body=')[1];
const decoded = decodeURIComponent(bodyParam);
check('mailto body decodes to text', decoded === email.text);

let failed = 0;
for (const c of checks) {
  console.log(`${c.pass ? 'PASS' : 'FAIL'}  ${c.label}${c.detail ? `  [${c.detail}]` : ''}`);
  if (!c.pass) failed++;
}
console.log(`\n${checks.length - failed}/${checks.length} passed`);
process.exit(failed ? 1 : 0);
