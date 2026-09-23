export const AUTHORIZATION_EMAIL_SUBJECT = 'Booking Itinerary & Authorization - Please Confirm';

const esc = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const getBookingInfo = (formData, airlinePnrs) => {
  const rows = airlinePnrs || formData.airlinePnrs || [];
  const pnrRow = rows.find(r => (r.pnr || '').trim());
  const pnr = pnrRow?.pnr?.trim() || 'PENDING';
  const airlineConfirmation = (pnrRow?.status || 'On Hold').toUpperCase();
  const cardDigits = String(formData.cardNumber || '').replace(/\D/g, '');
  const cardLast4 = cardDigits.length >= 4 ? cardDigits.slice(-4) : '0000';
  return { pnr, airlineConfirmation, cardLast4 };
};

const getTotals = (formData, totalCost) => {
  const total = typeof totalCost === 'number' ? totalCost : 0;
  return {
    total,
    totalStr: total.toFixed(2),
    chargeDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
  };
};

const flightRowValues = (f) => f ? [
  f.airline || '—',
  [f.date, f.time].filter(Boolean).join(' ') || '—',
  f.route || f.origin || '—',
  f.flightCode || f.id || '—',
  f.dest || f.destination || '—',
  f.duration || '—',
] : ['—', '—', '—', '—', '—', '—'];

const FLIGHT_HEADERS = ['Airline', 'Depart', 'From', 'Airline', 'To', 'Duration'];
const PAX_HEADERS = ['PASSENGER NAME', 'DOB', 'E-TICKET NO.', 'GENDER', 'SEAT CARRY ON', 'CHECK ON'];

const buildFlightTableHtml = (title, f) => {
  const values = flightRowValues(f);
  return `
    <p style="margin:28px 0 10px; font-size:16px; color:#111;">${esc(title)}</p>
    <table cellpadding="0" cellspacing="0" border="0" style="width:100%; border-collapse:collapse; font-size:14px;">
      <tr>
        ${FLIGHT_HEADERS.map(h => `<td style="background:#2b6fd4; color:#fff; font-weight:700; padding:8px 6px;">${esc(h)}</td>`).join('')}
      </tr>
      <tr>
        ${values.map(v => `<td style="padding:8px 6px; color:#111; border-bottom:1px solid #e5e7eb;">${esc(v)}</td>`).join('')}
      </tr>
    </table>`;
};

const buildPaxTableHtml = (passengers) => {
  const rows = passengers.map(p => [
    passengerName(p) || '—',
    p.dob || '—',
    p.eTicket || '—',
    p.gender || '—',
    p.carryOn || '—',
    p.checkInBag || '—',
  ]);
  return `
    <table cellpadding="0" cellspacing="0" border="0" style="width:100%; border-collapse:collapse; font-size:14px; margin-top:28px;">
      <tr>
        ${PAX_HEADERS.map(h => `<td style="background:#2b6fd4; color:#fff; font-weight:700; padding:8px 6px;">${esc(h)}</td>`).join('')}
      </tr>
      ${rows.map(cells => `<tr>${cells.map(v => `<td style="padding:8px 6px; color:#111; border-bottom:1px solid #e5e7eb;">${esc(v)}</td>`).join('')}</tr>`).join('')}
    </table>`;
};

const passengerName = (pax) => [pax.title, pax.firstName, pax.middleName, pax.lastName].filter(Boolean).join(' ').trim();
const greetingName = (pax) => [pax.firstName, pax.lastName].filter(Boolean).join(' ').trim() || 'John Smith';

// Body fragment — fits directly inside an email client's message body (no DOCTYPE/html/body wrapper).
export const buildAuthorizationEmailBodyHtml = ({ formData, tripType, totalCost, airlinePnrs }) => {
  const pax = formData.passengers[0] || {};
  const name = greetingName(pax);
  const { pnr, airlineConfirmation, cardLast4 } = getBookingInfo(formData, airlinePnrs);
  const { totalStr, chargeDate } = getTotals(formData, totalCost);

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:760px; margin:0 auto; background:#ffffff; font-family:Arial, Helvetica, sans-serif; color:#111; border-collapse:collapse;">
    <tr>
      <td style="padding:0;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
          <tr>
            <td width="55%" style="background:url('/email-banner.jpg') no-repeat center center; background-size:cover; background-color:#8ec3f5; height:170px; mso-background-image:url('/email-banner.jpg'); mso-background-position:center; mso-background-size:cover;">&nbsp;</td>
            <td width="45%" style="background:#2b6fd4; padding:24px 22px; color:#ffffff; font-size:14px; line-height:1.75; vertical-align:middle;">
              Please use the below PNR for all future references.<br/>
              &#9745; PNR No. : <strong>${esc(pnr)}</strong><br/>
              &#9745; Airline Confirmation : <strong>${esc(airlineConfirmation)}</strong>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:26px 22px 8px;">
        <p style="font-size:16px; margin:0 0 16px;">Dear ${esc(name)},</p>
        <p style="font-size:15px; line-height:1.6; margin:0 0 16px; color:#111;">
          Thank you for choosing Instaflight Travel to assist you in booking your travel plans. Please check the below itinerary and details to confirm if everything looks good so we will proceed with the reservation. Kindly sign the document so we can get your reservation finalized/ticketed.
        </p>
        <hr style="border:none; border-top:1px solid #cbd5e1; margin:22px 0;" />
        ${buildFlightTableHtml('Outbound Flight', formData.outboundFlight)}
        ${tripType === 'Round Trip' && formData.inboundFlight ? buildFlightTableHtml('Return Flight', formData.inboundFlight) : ''}
        ${buildPaxTableHtml(formData.passengers || [])}
        <p style="font-size:15px; line-height:1.6; margin:26px 0 14px;">
          Kindly authorize Instaflight Travel / Instaflight Travel Solutions LLC to debit your Master card ending with (${esc(cardLast4)}) for a total of USD ${esc(totalStr)} against the travel plan for passengers mentioned above.
        </p>
        <p style="font-size:15px; line-height:1.6; margin:0 0 14px;">
          Total Amount to be Charged on Card Ending With (${esc(cardLast4)}): USD ${esc(totalStr)} (USD ${esc(totalStr)}) dated ${esc(chargeDate)}.
        </p>
        <p style="font-size:15px; line-height:1.6; margin:0 0 24px;">
          Your credit/debit card may be charged in split payment in the name of INSTAFLIGHT TRAVEL &amp; INSTAFIGHT TRAVEL SOLUTIONS LLC but the total amount will remain the same.
        </p>
        <p style="font-size:15px; font-weight:700; margin:0 0 12px;">&#9635; Policies, Restrictions and/or Penalties:</p>
        <ul style="font-size:15px; line-height:1.6; padding-left:22px; margin:0 0 10px; color:#111;">
          <li style="margin-bottom:10px;">All tickets are non refundable after booking. For any cancellations, a future travel credit or travel voucher will be issued as per airline fare rules.</li>
          <li>Airline schedule and fare are subject to change without prior notice. Please check with airline for the latest information.</li>
        </ul>
        <p style="font-size:15px; line-height:1.6; margin:18px 0 8px;">Thank you for choosing Instaflight.</p>
        <p style="font-size:15px; line-height:1.6; margin:0 0 24px;">For any queries or changes to your booking please call us at</p>
      </td>
    </tr>
    <tr>
      <td style="background:#1f2937; padding:18px 22px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
          <tr>
            <td style="text-align:center; vertical-align:middle;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display:inline-block; margin:0 auto;">
                <tr>
                  <td style="padding-right:10px; vertical-align:middle;">
                    <span style="display:inline-block; width:34px; height:34px; line-height:34px; border-radius:50%; background:#ffffff; color:#1f2937; font-size:16px; text-align:center;">&#9742;</span>
                  </td>
                  <td style="vertical-align:middle; padding-right:26px;">
                    <span style="color:#ffffff; font-size:16px; font-weight:700; white-space:nowrap;">+1 800 555 0199</span>
                  </td>
                  <td style="padding-right:10px; vertical-align:middle;">
                    <span style="display:inline-block; width:34px; height:34px; line-height:34px; border-radius:50%; background:#ffffff; color:#1f2937; font-size:16px; text-align:center;">&#9993;</span>
                  </td>
                  <td style="vertical-align:middle; text-align:left;">
                    <span style="color:#ffffff; font-size:14px; line-height:1.5;">info@instaflight.com<br/>www.instaflight.com</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
};

// Full standalone document — used for the iframe preview in Step 2.
export const buildAuthorizationEmailHtml = (args) => `<!DOCTYPE html>
<html>
<body style="margin:0; padding:0; background:#f3f4f6; font-family:Arial, Helvetica, sans-serif; color:#111;">
${buildAuthorizationEmailBodyHtml(args)}
</body>
</html>`;

export const buildAuthorizationEmailText = ({ formData, tripType, totalCost, airlinePnrs }) => {
  const pax = formData.passengers[0] || {};
  const name = greetingName(pax);
  const { pnr, airlineConfirmation, cardLast4 } = getBookingInfo(formData, airlinePnrs);
  const { totalStr, chargeDate } = getTotals(formData, totalCost);

  const flightLines = (title, f) => {
    const v = flightRowValues(f);
    return [
      title,
      `${FLIGHT_HEADERS.join(' | ')}`,
      `${v.join(' | ')}`,
    ];
  };

  const paxLines = (formData.passengers || []).map(p =>
    [
      passengerName(p) || '—',
      p.dob || '—',
      p.eTicket || '—',
      p.gender || '—',
      p.carryOn || '—',
      p.checkInBag || '—',
    ].join(' | ')
  );

  return [
    `PNR No. : ${pnr}`,
    `Airline Confirmation : ${airlineConfirmation}`,
    '',
    `Dear ${name},`,
    '',
    'Thank you for choosing Instaflight Travel to assist you in booking your travel plans. Please check the below itinerary and details to confirm if everything looks good so we will proceed with the reservation. Kindly sign the document so we can get your reservation finalized/ticketed.',
    '',
    ...flightLines('Outbound Flight', formData.outboundFlight),
    '',
    ...(tripType === 'Round Trip' && formData.inboundFlight ? [...flightLines('Return Flight', formData.inboundFlight), ''] : []),
    `${PAX_HEADERS.join(' | ')}`,
    ...paxLines,
    '',
    `Kindly authorize Instaflight Travel / Instaflight Travel Solutions LLC to debit your Master card ending with (${cardLast4}) for a total of USD ${totalStr} against the travel plan for passengers mentioned above.`,
    '',
    `Total Amount to be Charged on Card Ending With (${cardLast4}): USD ${totalStr} (USD ${totalStr}) dated ${chargeDate}.`,
    '',
    'Your credit/debit card may be charged in split payment in the name of INSTAFLIGHT TRAVEL & INSTAFIGHT TRAVEL SOLUTIONS LLC but the total amount will remain the same.',
    '',
    'Policies, Restrictions and/or Penalties:',
    '- All tickets are non refundable after booking. For any cancellations, a future travel credit or travel voucher will be issued as per airline fare rules.',
    '- Airline schedule and fare are subject to change without prior notice. Please check with airline for the latest information.',
    '',
    'Thank you for choosing Instaflight.',
    'For any queries or changes to your booking please call us at',
    '+1 800 555 0199 | info@instaflight.com | www.instaflight.com',
  ].join('\n');
};

export const buildAuthorizationEmail = ({ formData, tripType, totalCost, airlinePnrs }) => ({
  to: (formData.passengers?.[0]?.email || formData.billingEmail || '').trim(),
  subject: AUTHORIZATION_EMAIL_SUBJECT,
  text: buildAuthorizationEmailText({ formData, tripType, totalCost, airlinePnrs }),
  html: buildAuthorizationEmailHtml({ formData, tripType, totalCost, airlinePnrs }),
  bodyHtml: buildAuthorizationEmailBodyHtml({ formData, tripType, totalCost, airlinePnrs }),
});

export const buildAuthorizationMailto = ({ formData, tripType, totalCost, airlinePnrs }) => {
  const { to, subject, text } = buildAuthorizationEmail({ formData, tripType, totalCost, airlinePnrs });
  return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
};
