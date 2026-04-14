import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const ALLOWED_ORIGINS = [
  'https://pingsouth.net',
  'https://www.pingsouth.net',
];

function getAllowedOrigin(req) {
  const origin = req.headers.origin || '';
  if (ALLOWED_ORIGINS.includes(origin)) return origin;
  if (/\.replit\.dev$/.test(origin)) return origin;
  return null;
}

function setCorsHeaders(res, origin) {
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req, res) {
  const origin = getAllowedOrigin(req);

  if (origin) {
    setCorsHeaders(res, origin);
  }

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, message } = req.body;

    await resend.emails.send({
      from: 'PingSouth <noreply@pingsouth.net>',
      to: ['sarahmolea@gmail.com'],
      subject: `New Demo Request from ${name}`,
      text: message,
      replyTo: email,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Email send error:', error);
    return res.status(500).json({ error: 'Failed to send message' });
  }
}
