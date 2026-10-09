const fs = require('fs');
let content = fs.readFileSync('src/pages/SearchService.jsx', 'utf8');

content = content.replace(
  /<div className="found-header">[\s\S]*?<\/div>\s*<div className="found-strip">[\s\S]*?<\/div>/,
  `<div className="found-header" style={{ backgroundColor: '#f4f5e7', padding: '1.5rem', borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0', borderBottom: '1px solid var(--border-color)' }}>
    <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem' }}>
      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Ref No # {selectedBooking.refNo}</div>
      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Booking Status : {selectedBooking.status}</div>
    </div>
    <div style={{ display: 'flex', gap: '2rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
      <span>Esign status : <b>SIGNED</b></span>
      <span>Esign delivered date : <b>2024-02-24 18:55:42</b></span>
      <span>Esign completed date : <b>2024-02-24 18:57:42</b></span>
    </div>
  </div>`
);

content = content.replace(
  /<div className="found-meta">[\s\S]*?<\/div>/,
  `<div className="found-meta" style={{ backgroundColor: '#f4f5e7', padding: '1rem 1.5rem', borderRadius: '0 0 var(--radius-sm) var(--radius-sm)' }}>
    <span>Sale By : <b>{selectedBooking.saleBy || selectedBooking.agent}</b></span>
    <span>Sale Date : <b>{selectedBooking.saleDate || selectedBooking.date || '—'}</b></span>
    <span>Charge Date : <b>{selectedBooking.chargeDate || '—'}</b></span>
    <span>Vendor : <b>{selectedBooking.vendorCode || selectedBooking.vendor || '—'}</b></span>
    <span className="meta-icons" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <button style={{ backgroundColor: '#334155', color: 'white', border: 'none', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>ESIGN</button>
      <button type="button" className="meta-icon-btn" style={{ backgroundColor: '#10b981', color: 'white', border: 'none' }} title="Copy booking reference" onClick={copyReference}>
        <Copy size={14} />
      </button>
      <button type="button" className="meta-icon-btn" style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none' }} title="Print" onClick={() => window.print()}>
        <Printer size={14} />
      </button>
    </span>
  </div>`
);

// We need to also change the Booking Detail card background to match screenshot 3.
content = content.replace(
  /<div className="card" style={{ padding: '1.5rem' }}>\s*<h3 style={{ margin: '0 0 1.25rem 0', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Booking Detail<\/h3>/,
  `<div className="card" style={{ padding: '0', backgroundColor: '#f4f5e7' }}>
    <h3 style={{ padding: '1rem 1.5rem', margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)' }}>BOOKING DETAIL</h3>
    <div style={{ padding: '1.5rem' }}>`
);

content = content.replace(
  /\{selectedDetail \? renderBookingDetailCard\(selectedDetail, canViewCardBlock\) : \([\s\S]*?\}\s*<\/div>/,
  `{selectedDetail ? renderBookingDetailCard(selectedDetail, canViewCardBlock) : (
                    <div style={{ height: '8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      <Loader2 size={24} className="spin" style={{ marginRight: '0.5rem' }} /> Loading detail data...
                    </div>
                  )}
                </div>
              </div>`
);

// We also need to change the toggle button color for related booking.
content = content.replace(
  /color: 'var\(--text-secondary\)' \};\s*\.rel-toggle:hover \{ color: var\(--primary-accent\); \}/,
  `color: '#3b82f6' };
.rel-toggle:hover { color: '#2563eb'; }`
);

fs.writeFileSync('src/pages/SearchService.jsx', content);
console.log('Done replacement');
