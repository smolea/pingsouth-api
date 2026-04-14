import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // ✅ Allow your domain
  const allowedOrigins = [
  'https://pingsouth.net',
  'https://www.pingsouth.net'
];

const origin = req.headers.origin;

if (allowedOrigins.includes(origin)) {
  res.setHeader('Access-Control-Allow-Origin', origin);
}
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // ✅ Handle preflight FIRST and EXIT
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ✅ Only allow POST after preflight
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    await resend.emails.send({
      from: 'Website <onboarding@resend.dev>',
      to: 'sarahmolea@gmail.com',
      subject: 'New Contact Form Submission',
      html: `
        <h2>New Contact Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p>${message}</p>
      `
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Email failed' });
  }
}
