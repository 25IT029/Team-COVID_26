const { Resend } = require('resend');

function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is missing from .env.');
  }

  return new Resend(process.env.RESEND_API_KEY);
}

async function sendTestEmail() {
  if (!process.env.TEST_EMAIL) {
    throw new Error('TEST_EMAIL is missing from .env.');
  }

  const { data, error } = await getResendClient().emails.send({
    from: process.env.EMAIL_FROM || 'VROOMY <onboarding@resend.dev>',
    to: [process.env.TEST_EMAIL],
    subject: 'VROOMY email setup works',
    html: `
      <h1>Welcome to VROOMY</h1>
      <p>Your email-notification setup is working correctly.</p>
    `
  });

  if (error) throw new Error(error.message || 'Resend could not send the email.');
  return data;
}

module.exports = { sendTestEmail };
