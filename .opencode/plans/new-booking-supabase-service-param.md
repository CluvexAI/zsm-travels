# Save New Bookings to Supabase + Retrieve by Search & Service Parameter

## Verified findings

- `@supabase/supabase-js` is installed and configured (`.env`, `src/services/supabase.js`), but **none of the 4 `zsm_*` tables exist** in the project — REST calls to `zsm_bookings/zsm_leads/zsm_escalations/zsm_key_value` all return `PGRST205 / 404`. Every save therefore falls back to `localStorage` and silently "succeeds".
- `supabase/schema.sql` already contains the full DDL + RLS + grants, but has never been run (and there is no Supabase CLI / service key here to run it).
- No `service` field exists on bookings, and no service search parameter exists anywhere (`cxId`, `bookingId`, `customerName` are the only URL params read by `/search`).
- Save failures are swallowed: `remote()` returns `null`, `saveBooking()` returns nothing, `NewBooking` advances to confirmation regardless.

## Decisions (confirmed with user)

1. **Schema**: user runs `supabase/schema.sql` in the Supabase SQL Editor; I verify afterwards via REST.
2. **Service parameter**: `service` field on the booking + Service filter on Search + `?service=` URL param (Dashboard can deep-link it).

---

## Step 0 — Provision schema (user action)

User pastes the contents of `supabase/schema.sql` into the Supabase SQL Editor and runs it.
I then verify with a read-only REST call:

```
GET {VITE_SUPABASE_URL}/rest/v1/zsm_bookings?select=id&limit=1   (expect 200, [])
```

Code work proceeds in parallel — it does not depend on the tables existing.

## Step 1 — Shared service vocabulary

**New file** `src/utils/serviceTypes.js`:

- `SERVICE_TYPES` array aligned with existing vocabularies (`YesterdaySales.jsx` filter options + `SearchService.jsx` `serviceActions`):
  `Flight Booking`, `UMNR Service`, `Seat Assign`, `Seat Upgrade`, `Add Baggage`, `Add Insurance`, `Pet Booking`, `Name Correction`, `Change Itinerary`, `Cancellation for Refund`, `Cancellation for Credit`.
- `DEFAULT_SERVICE = 'Flight Booking'`.
- `normalizeService(value)` — trimmed, case-insensitive fallback to `DEFAULT_SERVICE`.

## Step 2 — Persist `service` on the booking (`src/pages/NewBooking.jsx`)

- `createDefaultFormData()` (line 20): add `service: DEFAULT_SERVICE`.
- Agency Details field array (lines 1511–1517): add
  `{ label: 'Service', field: 'service', type: 'select', placeholder: 'Select Service', options: SERVICE_TYPES }`
  — rendered by the existing generic select branch, no new markup.
- Saved booking record (around line 876): add `service: formData.service` alongside `bookingSource`/`shift`
  (drafts already persist `formData` wholesale, so reload keeps it — no draft changes needed).
- Flat search fields already exist; `service` at top level is enough for filtering.

## Step 3 — Make Supabase saves real and visible

`src/services/supabase.js`:

- `saveBooking` / `saveBookings` return `{ ok, remote }` instead of nothing (`remote()` already reports success/failure).
- Keep the `localStorage` mirror (offline resilience) and the 15 s backoff.

`src/pages/NewBooking.jsx` `handleNext` (line 756):

- Inspect the `saveBooking` result; on `remote: false` render a warning on the confirmation step:
  "Saved locally only — Supabase is unreachable, this booking is not yet in the cloud database."
- Keep advancing on hard errors, but surface the error text instead of only `console.error`.

## Step 4 — Retrieve by service parameter (`src/pages/SearchService.jsx`)

- `initialFilters` (line 370): add `service: searchParams.get('service') || ''`.
- Filter UI Row 2 (lines 596–627): add a `Service` `<select>` — `All Services` + `SERVICE_TYPES`.
- `filterBookings` (line 145): destructure `service`; skip when empty/`All Services`; otherwise case-insensitive match on `booking.service`.
- Results table: show the service under the Booking ID cell (secondary line, same style as `CX: ...`).
- Nothing else changes — `applySearch`/deep-link auto-open already honour `activeFilters`.

## Step 5 — Dashboard deep link (`src/pages/Dashboard.jsx`)

- Add `service: ''` to `filters` state (line 44) and to `handleClear` (line 131).
- Add the same Service `<select>` to the search form.
- `handleSearch` (line 121) already appends every non-empty filter key → `/search?service=...` flows through automatically.

## Step 6 — Normalizer (`src/utils/bookingNormalizer.js`)

- Include `service: asText(record.service) || DEFAULT_SERVICE` in `normalizeBookingForSearch` output so rows saved before this change still filter correctly.

## Step 7 — Verification

1. `npm run lint` (oxlint) and `npm run build`.
2. After Step 0: REST-verify tables exist.
3. Runtime E2E (dev server on :5174): create a booking on `/new-booking`, then
   - query `zsm_bookings` via REST and confirm the `INST…` row landed with `data.service`;
   - open `/search`, find it by BookingId / CXId;
   - filter by Service and by `/search?service=Flight Booking`.

## Out of scope

- Leads / escalations tables (same schema file, created in one pass by Step 0).
- Post-booking service pages still using in-component mock reservations.
