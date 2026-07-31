import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const fetchLeads = async () => {
  const { data, error } = await supabase.from('zsm_leads').select('*').order('created_at', { ascending: true });
  if (error) {
    console.error('Error fetching leads:', error);
    return [];
  }
  return data.map(row => row.data);
};

export const saveLeads = async (leadsArray) => {
  const records = leadsArray.map(lead => ({ id: String(lead.id), data: lead }));
  const { error } = await supabase.from('zsm_leads').upsert(records);
  if (error) console.error('Error saving leads:', error);
};

export const fetchBookings = async () => {
  const { data, error } = await supabase.from('zsm_bookings').select('*').order('created_at', { ascending: true });
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
