/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { createServer as createViteServer } from 'vite';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Middleware for parsing JSON with a generous file limit
app.use(express.json({ limit: '10mb' }));

/**
 * Mask sensitive credentials for safe UI rendering
 */
function maskString(str?: string): string | null {
  if (!str) return null;
  if (str.length <= 4) return '***';
  return `${str.substring(0, 2)}***${str.substring(str.length - 2)}`;
}

/**
 * Check if SMTP configuration is present
 */
function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : null;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  const isConfigured = !!(host && port && user && pass);

  return {
    configured: isConfigured,
    host: host || null,
    port: port,
    user: user ? maskString(user) : null,
    fromAddress: from || null,
    secure: secure,
  };
}

// REST API: Get SMTP configuration status
app.get('/api/smtp-config', (req, res) => {
  try {
    const config = getSmtpConfig();
    res.json(config);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// REST API: Send single email with optional SMTP dispatch
app.post('/api/send-email', async (req, res) => {
  const { recipient, subject, htmlBody, textBody } = req.body;

  if (!recipient || !subject || !htmlBody) {
    res.status(400).json({ error: 'Missing required fields (recipient, subject, htmlBody)' });
    return;
  }

  // Retrieve SMTP variables
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : null;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user || 'nepasrepondre.logistique@wevioo.com';
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  const isSMTPReady = !!(host && port && user && pass);

  if (!isSMTPReady) {
    // Elegant fallback: Sandbox simulated delivery
    res.json({
      success: true,
      status: 'simulated',
      message: 'SMTP is not configured in .env. Email simulated successfully inside the sandboxed UI logs.',
      timestamp: new Date().toISOString()
    });
    return;
  }

  try {
    // Lazy initialize nodemailer transporter to avoid pre-config crashes
    const transporter = nodemailer.createTransport({
      host: host,
      port: port!,
      secure: secure,
      auth: {
        user: user,
        pass: pass
      },
      tls: {
        // Safe configuration to allow custom testing servers if needed
        rejectUnauthorized: false
      }
    });

    // Send the actual email
    const mailOptions = {
      from: `"Wevioo Tunis Desk" <${from}>`,
      to: recipient,
      subject: subject,
      text: textBody || 'Veuillez ouvrir cet email au format HTML pour voir toutes les informations de votre retrait de tickets restaurant.',
      html: htmlBody,
    };

    const info = await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      status: 'sent',
      messageId: info.messageId,
      response: info.response,
      recipient: recipient,
      timestamp: new Date().toISOString()
    });
  } catch (smtpError: any) {
    // SMTP dispatch failed but let's notify the front-end gracefully
    console.error('SMTP Delivery failed:', smtpError);
    res.status(500).json({
      success: false,
      status: 'failed',
      error: smtpError.message,
      message: 'Impossible d\'envoyer l\'email via le relais SMTP configuré.'
    });
  }
});

/**
 * Vite integration vs Static serve
 */
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Dev: Mount Vite as middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production: Serve pre-built static files from /dist
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[TUNISDESK] Full-Stack App server listening on http://0.0.0.0:${PORT}`);
    console.log(`[TUNISDESK] Mode: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer();
