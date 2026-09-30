import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import nodemailer from 'nodemailer'

const readJsonBody = (req) => new Promise((resolve, reject) => {
  let raw = ''
  req.on('data', (chunk) => {
    raw += chunk
    if (raw.length > 5_000_000) reject(new Error('Payload too large'))
  })
  req.on('end', () => {
    if (!raw) return resolve({})
    try { resolve(JSON.parse(raw)) } catch { reject(new Error('Invalid JSON body')) }
  })
  req.on('error', reject)
})

const handleSendEmail = async (req, res) => {
  const json = (status, body) => {
    res.statusCode = status
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(body))
  }
  if (req.method !== 'POST') return json(405, { error: 'Method Not Allowed' })
  try {
    const { smtp, to, subject, html, text, replyTo } = await readJsonBody(req)
    if (!smtp?.host || !smtp?.port) {
      return json(400, { error: 'SMTP settings missing. Save them at /admin/smtp-settings first.' })
    }
    if (!to) return json(400, { error: 'Recipient (to) is required.' })

    const port = Number(smtp.port)
    const security = smtp.security || 'TLS'
    const transport = nodemailer.createTransport({
      host: smtp.host,
      port,
      secure: security === 'SSL' || port === 465,
      ignoreTLS: security === 'None',
      requireTLS: security === 'TLS',
      auth: smtp.username ? { user: smtp.username, pass: smtp.password } : undefined,
      connectionTimeout: 15_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    })

    const info = await transport.sendMail({
      from: smtp.fromEmail ? `${smtp.fromName || 'ZSM Travel'} <${smtp.fromEmail}>` : undefined,
      to,
      replyTo: replyTo || smtp.replyTo || undefined,
      subject: subject || 'No subject',
      html: html || undefined,
      text: text || undefined,
    })
    return json(200, { ok: true, messageId: info.messageId || null })
  } catch (err) {
    return json(500, { error: err?.message || 'SMTP send failed' })
  }
}

const mountSmtpRelay = (server) => {
  server.middlewares.use('/api/send-email', (req, res) => {
    handleSendEmail(req, res).catch((err) => {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: err?.message || 'SMTP send failed' }))
    })
  })
}

// Dev/preview HTTP relay so the browser can send mail via the SMTP settings
// configured at /admin/smtp-settings (browsers cannot speak SMTP themselves).
const smtpRelayPlugin = () => ({
  name: 'zsm-smtp-relay',
  configureServer: mountSmtpRelay,
  configurePreviewServer: mountSmtpRelay,
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), smtpRelayPlugin()],
})
