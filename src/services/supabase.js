import { createClient } from '@supabase/supabase-js'
import { mapBookingDetail } from '../utils/bookingNormalizer'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let client = null

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Please check your .env file.')
} else {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey)
  } catch (err) {
    console.error('Failed to create Supabase client:', err)
  }
}

// The Supabase client is only used when the project is reachable. Every read
// falls back to browser storage and every write is mirrored there, so drafts,
// bookings and metadata survive even when the database is unreachable.
export const supabase = client

const LOCAL_PREFIX = 'zsm'
const BACKOFF_MS = 15000

let offlineUntil = 0
let offlineWarned = false

const warnOffline = () => {
  if (offlineWarned) return
  offlineWarned = true
  console.warn(
    'Supabase unreachable — data is being kept in browser storage instead. Check VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in .env.'
  )
}

// PostgREST/application errors always carry a `code`; a missing one means the
// request never reached the API (DNS/network), so back off before retrying.
const noteNetworkFailure = () => {
  offlineUntil = Date.now() + BACKOFF_MS
  warnOffline()
}

const isBackedOff = () => Date.now() < offlineUntil

const localKey = (key) => `${LOCAL_PREFIX}:${key}`

const localRead = (key) => {
  try {
    const raw = window.localStorage.getItem(localKey(key))
    return raw === null ? null : JSON.parse(raw)
  } catch {
    return null
  }
}

const localWrite = (key, value) => {
  try {
    if (value === null || value === undefined) window.localStorage.removeItem(localKey(key))
    else window.localStorage.setItem(localKey(key), JSON.stringify(value))
    return true
  } catch (err) {
    console.error('Local storage write failed:', err)
    return false
  }
}

// Runs a Supabase query and returns its rows, or null when the project cannot
// be reached so callers can fall back to browser storage.
const remote = async (label, run) => {
  if (!client) {
    warnOffline()
    return null
  }
  if (isBackedOff()) {
    warnOffline()
    return null
  }
  try {
    const result = await run()
    if (result && result.error) {
      if (!result.error.code) noteNetworkFailure()
      else console.error(`Error ${label}:`, result.error)
      return null
    }
    return result ? (result.data ?? null) : null
  } catch (err) {
    console.error(`Error ${label}:`, err)
    noteNetworkFailure()
    return null
  }
}

// Write counterpart of `remote()`: reports whether the row actually reached
// Supabase so callers can warn instead of silently falling back to storage.
const remoteWrite = async (label, run) => {
  if (!client) {
    warnOffline()
    return false
  }
  if (isBackedOff()) {
    warnOffline()
    return false
  }
  try {
    const result = await run()
    if (result && result.error) {
      if (!result.error.code) noteNetworkFailure()
      else console.error(`Error ${label}:`, result.error)
      return false
    }
    return true
  } catch (err) {
    console.error(`Error ${label}:`, err)
    noteNetworkFailure()
    return false
  }
}

export const fetchLeads = async () => {
  const data = await remote('fetching leads', () => client.from('zsm_leads').select('*'))
  if (data && data.length > 0) {
    const rows = data.map(row => row.data)
    localWrite('leads', rows)
    return rows
  }

  const local = localRead('leads')
  if (Array.isArray(local) && local.length > 0) return local

  const d = new Date()
  d.setDate(d.getDate() + 1) // Tomorrow
  const tomorrowStr = d.toISOString().split('T')[0]

  const mockLeads = [
    { id: Date.now() + 1, vendorId: 'PNR-8X92', fullName: 'David Johnson', flightNumber: 'AA 100', preferredAirline: 'American Airlines', origin: 'JFK', destination: 'LHR', departureDate: tomorrowStr, departureTime: '18:30', leadType: 'Flight Booking', leadStatus: 'Converted', paymentStatus: 'Paid', salesAgent: 'Sarah Agent', createdAt: new Date().toISOString(), phone: '+1 555-0192', email: 'david@example.com' },
    { id: Date.now() + 2, vendorId: 'PNR-72YH', fullName: 'Emily Davis', flightNumber: 'DL 200', preferredAirline: 'Delta', origin: 'ATL', destination: 'CDG', departureDate: tomorrowStr, departureTime: '21:00', leadType: 'Flight Booking', leadStatus: 'Converted', paymentStatus: 'Pending', salesAgent: 'Sarah Agent', createdAt: new Date().toISOString(), phone: '+1 555-0921', email: 'emily@example.com' }
  ]

  await saveLeads(mockLeads)
  return mockLeads
}

export const saveLeads = async (leadsArray) => {
  localWrite('leads', leadsArray)
  const records = leadsArray.map(lead => ({ id: String(lead.id), data: lead }))
  const remoteOk = await remoteWrite('saving leads', () => client.from('zsm_leads').upsert(records))
  return { ok: true, remote: remoteOk }
}

export const fetchBookings = async () => {
  const local = localRead('bookings') || []
  const data = await remote('fetching bookings', () => client.from('zsm_bookings').select('*'))
  if (data && data.length > 0) {
    const remoteRows = data.map(row => row.data)
    const map = new Map()
    local.forEach(b => { if (b && (b.id || b.refNo)) map.set(String(b.id || b.refNo), b) })
    remoteRows.forEach(b => { if (b && (b.id || b.refNo)) map.set(String(b.id || b.refNo), b) })
    const merged = Array.from(map.values())
    localWrite('bookings', merged)
    return merged
  }

  return local.length > 0 ? local : null
}

export const saveBookings = async (bookingsArray) => {
  localWrite('bookings', bookingsArray)
  const records = bookingsArray.map(b => ({ id: String(b.id), data: b }))
  const remoteOk = await remoteWrite('saving bookings', () => client.from('zsm_bookings').upsert(records, { onConflict: 'id' }))
  return { ok: true, remote: remoteOk }
}

// Append (or update) a single booking without fetching every existing record.
// Used by NewBooking on submit to avoid a read-then-write race condition.
export const saveBooking = async (booking) => {
  // Mirror into the local bookings list
  const local = localRead('bookings') || []
  const map = new Map(local.map(b => [String(b.id || b.refNo), b]))
  map.set(String(booking.id), booking)
  localWrite('bookings', Array.from(map.values()))

  const record = { id: String(booking.id), data: booking }
  const remoteOk = await remoteWrite('saving booking', () =>
    client.from('zsm_bookings').upsert(record, { onConflict: 'id' })
  )
  return { ok: true, remote: remoteOk }
}

// One-time backfill for rows written before the Booking Detail fields existed.
// Only empty values are filled and nothing is written back once every row is
// complete, so repeat loads cost a single read and no writes.
const DETAIL_FIELD_DEFAULTS = {
  descriptor: 'Airline Tkt Infinity',
  gateway: 'Connex-pay',
  bookingSource: 'Airline',
  shift: 'Day',
  paymentBookingType: 'CX Credit Card',
}

export const backfillBookingDetailFields = async () => {
  const rows = await fetchBookings()
  if (!Array.isArray(rows)) return null

  const isMissing = (value) =>
    value === null || value === undefined || String(value).trim() === ''

  const patched = rows.map((row) => {
    if (!row || typeof row !== 'object') return row
    const fill = {}
    Object.entries(DETAIL_FIELD_DEFAULTS).forEach(([key, fallback]) => {
      if (isMissing(row[key])) fill[key] = fallback
    })
    return Object.keys(fill).length ? { ...row, ...fill } : row
  })

  const changed = patched.filter((row, index) => row !== rows[index])
  if (changed.length) {
    console.info(`Backfilled ${changed.length} booking(s) with missing detail fields.`)
    await saveBookings(patched)
  }
  return patched
}

export const fetchBookingDetail = async (refNo) => {
  if (!client) {
    warnOffline()
    return null
  }
  if (isBackedOff()) {
    warnOffline()
    return null
  }
  try {
    const { data, error } = await client
      .from('zsm_bookings')
      .select('*')
      .eq('refNo', refNo)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      console.error('Error fetching booking detail:', error)
      return null
    }

    if (!data) return null

    // Single source of truth: same mapping the Search & Service page uses.
    const record = data.data || data
    return mapBookingDetail(record)
  } catch (err) {
    console.error('Error fetching booking detail:', err)
    return null
  }
}

export const fetchEscalations = async () => {
  const data = await remote('fetching escalations', () => client.from('zsm_escalations').select('*'))
  if (data && data.length > 0) {
    const rows = data.map(row => row.data)
    localWrite('escalations', rows)
    return rows
  }

  const local = localRead('escalations')
  return Array.isArray(local) && local.length > 0 ? local : null
}

export const saveEscalations = async (escalationsArray) => {
  localWrite('escalations', escalationsArray)
  const records = escalationsArray.map(e => ({ id: String(e.id), data: e }))
  const remoteOk = await remoteWrite('saving escalations', () => client.from('zsm_escalations').upsert(records))
  return { ok: true, remote: remoteOk }
}

export const getMetadata = async (key) => {
  if (!client || isBackedOff()) {
    warnOffline()
    return localRead(`meta:${key}`)
  }
  try {
    const { data, error } = await client
      .from('zsm_key_value')
      .select('value')
      .eq('key', key)
      .single()

    if (error) {
      // PGRST116 = no such row, which is not a failure.
      if (error.code === 'PGRST116') return localRead(`meta:${key}`)
      if (!error.code) noteNetworkFailure()
      else console.error('Error getting metadata:', error)
      return localRead(`meta:${key}`)
    }

    localWrite(`meta:${key}`, data.value)
    return data.value
  } catch (err) {
    console.error('Error getting metadata:', err)
    noteNetworkFailure()
    return localRead(`meta:${key}`)
  }
}

export const setMetadata = async (key, value) => {
  localWrite(`meta:${key}`, value)
  if (!client || isBackedOff()) {
    warnOffline()
    return
  }
  try {
    const { error } = await client
      .from('zsm_key_value')
      .upsert({ key, value, updated_at: new Date().toISOString() })
    if (error) {
      if (!error.code) noteNetworkFailure()
      else console.error('Error setting metadata:', error)
    }
  } catch (err) {
    console.error('Error setting metadata:', err)
    noteNetworkFailure()
  }
}
