import nodemailer from 'nodemailer';
import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const EMAIL_USER = process.env.EMAIL_USER as string;
const EMAIL_PASS = process.env.EMAIL_PASS as string;

const TWILIO_SID = process.env.TWILIO_SID as string;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN as string;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER as string;

// Nodemailer transporter for email
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email provider
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// Twilio client for SMS
const twilioClient = twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);

export async function sendOtpEmail(toEmail: string, otp: string) {
  const mailOptions = {
    from: EMAIL_USER,
    to: toEmail,
    subject: 'Your OTP Code for Test_School',
    text: `Your OTP code is: ${otp}. It will expire in 10 minutes.`,
  };
  await transporter.sendMail(mailOptions);
}

export async function sendOtpSms(toPhone: string, otp: string) {
  await twilioClient.messages.create({
    body: `Your OTP code is: ${otp}. It will expire in 10 minutes.`,
    from: TWILIO_PHONE_NUMBER,
    to: toPhone,
  });
}
