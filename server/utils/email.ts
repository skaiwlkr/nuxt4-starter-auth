import nodemailer from 'nodemailer'

// Interface defining the required options for sending an email
interface EmailOptions {
  to: string
  subject: string
  text: string
  html: string
}

// Sends an email using the configured SMTP server
export async function sendEmail({ to, subject, text, html }: EmailOptions) {
  // Validate SMTP configuration
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('SMTP-Konfiguration unvollständig. Bitte überprüfen Sie die Umgebungsvariablen SMTP_HOST, SMTP_USER und SMTP_PASS.')
  }

  const smtpConfig = {
    host: process.env.SMTP_HOST,
    port: Number.parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  }

  const transporter = nodemailer.createTransport(smtpConfig)

  const from = process.env.SMTP_FROM || process.env.SMTP_USER
  if (!from) {
    throw new Error('SMTP_FROM oder SMTP_USER muss gesetzt sein')
  }

  await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  })
}
