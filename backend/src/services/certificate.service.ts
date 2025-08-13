import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import Certificate from '../models/Certificate.model';
import User from '../models/User.model';
import { sendMailWithAttachment } from './mailer.service'; // we'll create this
import { Types } from 'mongoose';

const CERT_DIR = process.env.CERT_DIR || path.join(process.cwd(), 'uploads', 'certificates');

// ensure folder exists
fs.mkdirSync(CERT_DIR, { recursive: true });

/**
 * Render a minimal certificate HTML. You can replace this with your nicer HTML template.
 */
function buildCertificateHtml(userName: string, level: string, issuedAt: Date, certificateId: string) {
  return `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8"/>
      <title>Certificate</title>
      <style>
        body { font-family: Arial, sans-serif; display:flex; align-items:center; justify-content:center; height:100vh; margin:0; background: #f6f8fb; }
        .card { width: 900px; height: 600px; border-radius: 16px; background: white; padding:40px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); text-align:center; }
        h1 { margin: 8px 0; font-size: 36px; letter-spacing: 1px; }
        p { margin: 8px 0; color: #555; }
        .level { font-size: 48px; font-weight:700; margin-top: 16px; color:#0b63e5; }
        .meta { position:absolute; bottom:24px; left:40px; font-size:12px; color:#888; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>Certificate of Competency</h1>
        <p>This certifies that</p>
        <h2>${userName}</h2>
        <div class="level">${level}</div>
        <p>was awarded on ${issuedAt.toLocaleDateString()}</p>
        <div class="meta">Certificate ID: ${certificateId}</div>
      </div>
    </body>
  </html>
  `;
}

/**
 * Generate PDF certificate, save to disk and DB, optionally email it.
 * Returns saved Certificate document.
 */
export async function generateAndSendCertificate(options: {
  userId: Types.ObjectId | string;
  testResultId?: Types.ObjectId | string;
  level: string;
  email?: string;
  sendEmail?: boolean;
}) {
  const { userId, testResultId, level, email, sendEmail = true } = options;

  // fetch user for display name
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const issuedAt = new Date();
  const certificateId = `${userId.toString()}-${issuedAt.getTime()}`;

  const html = buildCertificateHtml((user as any).name || (user as any).email || 'Student', level, issuedAt, certificateId);

  // Launch puppeteer and generate pdf
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' }
    });

    const filename = `certificate-${certificateId}.pdf`;
    const fullPath = path.join(CERT_DIR, filename);
    await fs.promises.writeFile(fullPath, pdfBuffer);

    // Save metadata to DB
    const certDoc = await Certificate.create({
      userId,
      testResultId,
      level,
      filePath: fullPath,
      issuedAt
    });

    // Email certificate if requested
    if (sendEmail && email) {
      await sendMailWithAttachment({
        to: email,
        subject: `Your Test_School Certificate — ${level}`,
        text: `Congratulations! Your certificate for level ${level} is attached.`,
        attachments: [{ filename, path: fullPath }]
      });
    }

    return certDoc;
  } finally {
    await browser.close();
  }
}
