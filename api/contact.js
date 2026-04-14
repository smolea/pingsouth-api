const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

function getCorsOrigin(req) {
  const origin = req.headers['origin'] || '';

  if (origin.endsWith('.replit.dev')) return origin;
  if (origin === 'https://pingsouth.net') return origin;
  if (origin === 'https://www.pingsouth.net') return origin;

  return null;
}

module.exports = async function handler(req, res) {
  const origin = getCorsOrigin(req);

  // ✅ ALWAYS set headers (even if origin null)
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // ✅ Preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ✅ Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, message } = req.body;

    await resend.emails.send({
      from: 'PingSouth <onboarding@resend.dev>', // safe default
      to: ['sarahmolea@gmail.com'],
      subject: `New Demo Request from ${name}`,
      text: message,
      replyTo: email,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Email send error:', error);

    return res.status(500).json({
      error: 'Failed to send message',
      details: error.message,
    });
  }
};
