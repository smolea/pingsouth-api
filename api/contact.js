import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const ALLOWED_ORIGINS = [
  'https://pingsouth.net',
  'https://www.pingsouth.net',
];

function getAllowedOrigin(req) {
  const origin = req.headers.origin || '';

  if (ALLOWED_ORIGINS.includes(origin)) return origin;

  // allow any Replit preview domain
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

  // ✅ handle preflight FIRST
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ✅ only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    await resend.emails.send({
      from: 'PingSouth <onboarding@resend.dev>',
      to: ['info@pingsouth.com'], // <-- your real inbox
      subject: 'New Demo Request',
      html: `
        <h2>New Contact Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p>${message}</p>
      `,
    });

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Email failed' });
  }
}
