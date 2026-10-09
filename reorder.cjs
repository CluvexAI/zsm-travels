const fs = require('fs');
let content = fs.readFileSync('src/pages/SearchService.jsx.mod1', 'utf8');

const strA_start = '{/* Booking Detail card - collapsible, rendered from mapped detail data */}';
const strC_start = '{/* All bookings for this customer */}';
const strD_end = '{/* Booking History / Activity Log */}';

const posA = content.indexOf(strA_start);
const posC = content.indexOf(strC_start);
const posE = content.indexOf(strD_end);

const headerPart = content.substring(0, posA);
const detailPart = content.substring(posA, posC);
const cxAndItineraryPart = content.substring(posC, posE);
const bottomPart = content.substring(posE);

const newSections = `
              {/* CONNEXPAY Section */}
              <div className="card">
                <div style={{ backgroundColor: '#f0f4a8', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>CONNEXPAY</h3>
                  <ul style={{ fontSize: '0.85rem', color: 'var(--text-primary)', margin: 0, paddingLeft: '1.5rem' }}>
                    <li>1st Make Sale From Connexpay Charge Button(Charge Amount will Be Net Amount(Airline Cost Amount))</li>
                    <li>2nd Mention No Of Cards, You want to Create Including Card Amount Limit and mention the card you gonna using for Airline or Hotel or Cars Reservation.</li>
                    <li>3rd Issue Card one By one.</li>
                  </ul>
                </div>
                <div style={{ padding: '1rem' }}>
                  <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>CONNEXPAY SALE DETAIL</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <div style={{ color: 'var(--text-secondary)' }}>Sale Status</div><div>Transaction - Approved</div>
                    <div style={{ color: 'var(--text-secondary)' }}>Sale Time</div><div>2024-02-24T21:58:54.56-05:00</div>
                    <div style={{ color: 'var(--text-secondary)' }}>Sale Amount</div><div>$ 601.6</div>
                    <div style={{ color: 'var(--text-secondary)' }}>Sale Guid</div><div>4f7351ed-d3f6-4fb4-bf7d-b6541f938676</div>
                    <div style={{ color: 'var(--text-secondary)' }}>Incoming Tran Code</div><div>10A69BC638444087358272937</div>
                  </div>
                  <div style={{ marginTop: '1rem' }}>
                    <button style={{ background: 'none', border: 'none', color: '#10b981', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: 0 }}>
                      <ChevronDown size={14} /> CREATE NO OF CARD
                    </button>
                  </div>
                </div>
              </div>

              {/* Manage Cards */}
              <div className="card">
                <h2 className="card-title mb-4">Manage Cards</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-color)', borderTop: '1px solid var(--border-color)' }}>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600 }}>Use Case</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600 }}>Card Info</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600 }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan="3" style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>No cards found</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* VISITING ACTIVITY */}
              <div className="card">
                <h2 className="card-title mb-4" style={{ textTransform: 'uppercase', fontSize: '0.875rem' }}>VISITING ACTIVITY</h2>
                <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                  <button style={{ width: '100%', padding: '0.75rem 1rem', background: '#f8fafc', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3b82f6', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', textAlign: 'left' }}>
                    <ChevronDown size={14} /> ALL VISITING ACTIVITY
                  </button>
                </div>
              </div>

              {/* E-Sign Detail */}
              <div className="card">
                <h2 className="card-title mb-4">E-Sign Detail</h2>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600 }}>E-Sign Subject</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600 }}>Status</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600 }}>Completed At</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600 }}>IP Address</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600 }}>Completed Document</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600 }}>Certificate</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '1rem' }}>AMERICAN AIRLINES Ref No - #{selectedBooking?.refNo} - The Infinity Travel</td>
                        <td style={{ padding: '1rem' }}>SIGNED</td>
                        <td style={{ padding: '1rem' }}>2024-02-24<br/>18:23:26</td>
                        <td style={{ padding: '1rem' }}>108.145.164.10</td>
                        <td style={{ padding: '1rem' }}>
                          <button style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>VIEW COMPLETED<br/>DOCUMENT</button>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <button style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>GENERATE &amp;<br/>DOWNLOAD<br/>CERTIFICATE</button>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '1rem' }}>AMERICAN AIRLINES Ref No - #{selectedBooking?.refNo} - The Infinity Travel</td>
                        <td style={{ padding: '1rem' }}>SIGNED</td>
                        <td style={{ padding: '1rem' }}>2024-02-24<br/>18:57:42</td>
                        <td style={{ padding: '1rem' }}>108.145.164.10</td>
                        <td style={{ padding: '1rem' }}>
                          <button style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>VIEW COMPLETED<br/>DOCUMENT</button>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <button style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>GENERATE &amp;<br/>DOWNLOAD<br/>CERTIFICATE</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
`;

const newFileContent = headerPart + cxAndItineraryPart + newSections + detailPart + bottomPart;
fs.writeFileSync('src/pages/SearchService.jsx', newFileContent);
console.log('Reordered successfully!');
