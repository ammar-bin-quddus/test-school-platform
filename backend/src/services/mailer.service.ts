import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

export async function sendMailWithAttachment(opts: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: { filename: string; path: string }[];
}) {
  const { to, subject, text, html, attachments } = opts;

  const mailOptions = {
    from: `"Test_School" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
    attachments
  };

  return transporter.sendMail(mailOptions);
}
