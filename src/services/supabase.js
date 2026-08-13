import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const fetchLeads = async () => {
  const { data, error } = await supabase.from('zsm_leads').select('*');
  if (error || !data || data.length === 0) {
    if (error && error.code !== '42P01' && error.code !== 'PGRST205') console.error('Error fetching leads:', error);
    
    const d = new Date();
    d.setDate(d.getDate() + 1); // Tomorrow
    const tomorrowStr = d.toISOString().split('T')[0];
    
    const mockLeads = [
      { id: Date.now() + 1, vendorId: 'PNR-8X92', fullName: 'David Johnson', flightNumber: 'AA 100', preferredAirline: 'American Airlines', origin: 'JFK', destination: 'LHR', departureDate: tomorrowStr, departureTime: '18:30', leadType: 'Flight Booking', leadStatus: 'Converted', paymentStatus: 'Paid', salesAgent: 'Sarah Agent', createdAt: new Date().toISOString(), phone: '+1 555-0192', email: 'david@example.com' },
      { id: Date.now() + 2, vendorId: 'PNR-72YH', fullName: 'Emily Davis', flightNumber: 'DL 200', preferredAirline: 'Delta', origin: 'ATL', destination: 'CDG', departureDate: tomorrowStr, departureTime: '21:00', leadType: 'Flight Booking', leadStatus: 'Converted', paymentStatus: 'Pending', salesAgent: 'Sarah Agent', createdAt: new Date().toISOString(), phone: '+1 555-0921', email: 'emily@example.com' }
    ];
    
    await saveLeads(mockLeads);
    return mockLeads;
  }
  return data.map(row => row.data);
};

export const saveLeads = async (leadsArray) => {
  const records = leadsArray.map(lead => ({ id: String(lead.id), data: lead }));
  const { error } = await supabase.from('zsm_leads').upsert(records);
  if (error) console.error('Error saving leads:', error);
};

export const fetchBookings = async () => {
  const { data, error } = await supabase.from('zsm_bookings').select('*');
  if (error) {
    console.error('Error fetching bookings:', error);
    return null;
  }
  if (!data || data.length === 0) return null;
  return data.map(row => row.data);
};

export const saveBookings = async (bookingsArray) => {
  const records = bookingsArray.map(b => ({ id: String(b.id), data: b }));
  const { error } = await supabase.from('zsm_bookings').upsert(records);
  if (error) console.error('Error saving bookings:', error);
};

export const fetchEscalations = async () => {
  const { data, error } = await supabase.from('zsm_escalations').select('*');
  if (error) {
    if (error.code !== '42P01') console.error('Error fetching escalations:', error); // Ignore undefined table
    return null;
  }
  if (!data || data.length === 0) return null;
  return data.map(row => row.data);
};

export const saveEscalations = async (escalationsArray) => {
  const records = escalationsArray.map(e => ({ id: String(e.id), data: e }));
  const { error } = await supabase.from('zsm_escalations').upsert(records);
  if (error) console.error('Error saving escalations:', error);
};

export const getMetadata = async (key) => {
  const { data, error } = await supabase.from('zsm_key_value').select('value').eq('key', key).single();
  if (error) {
    if (error.code !== 'PGRST116') console.error('Error getting metadata:', error);
    return null;
  }
  return data.value;
};

export const setMetadata = async (key, value) => {
  const { error } = await supabase.from('zsm_key_value').upsert({ key, value, updated_at: new Date().toISOString() });
  if (error) console.error('Error setting metadata:', error);
};
