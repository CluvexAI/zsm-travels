import { getMetadata, setMetadata } from './supabase';

export const SMTP_META_KEY = 'smtpConfig';
export const SMTP_LOCAL_KEY = 'zsm_smtpConfig';

const readLocalSmtp = () => {
  try {
    const raw = localStorage.getItem(SMTP_LOCAL_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const loadSmtpConfig = async () => {
  const remote = await getMetadata(SMTP_META_KEY);
  if (remote && remote.host) return remote;
  return readLocalSmtp();
};

export const saveSmtpConfig = async (config) => {
  const payload = { ...config, updated_at: new Date().toISOString() };
  try {
    localStorage.setItem(SMTP_LOCAL_KEY, JSON.stringify(payload));
  } catch { /* ignore quota/private-mode errors */ }
  await setMetadata(SMTP_META_KEY, payload);
  return payload;
};

export const sendSmtpEmail = async ({ to, subject, html, text, replyTo }) => {
  const smtp = await loadSmtpConfig();
  if (!smtp || !smtp.host) {
    throw new Error('SMTP settings missing. Save them at /admin/smtp-settings first.');
  }
  const res = await fetch('/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ smtp, to, subject, html, text, replyTo }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Mail relay error (HTTP ${res.status})`);
  return data;
};
