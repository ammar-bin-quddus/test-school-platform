import { Request, Response } from 'express';
import User from '../models/User.model';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendOtpEmail, sendOtpSms } from '../services/otp.service';

const JWT_SECRET = process.env.JWT_SECRET as string;

// Helper: Generate random 6-digit OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Register user and send OTP
 */
export const register = async (req: Request, res: Response) => {
  const { email, password, phone, role } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);

    const otpCode = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    const user = await User.create({
      email,
      password: hashed,
      role: role || 'student',
      isVerified: false,
      otpCode,
      otpExpiry
    });

    if (email) await sendOtpEmail(email, otpCode);
    if (phone) await sendOtpSms(phone, otpCode);

    res.status(201).json({ success: true, user, message: 'User registered. OTP sent.' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Registration failed' });
  }
};

/**
 * Verify OTP
 */
export const verifyOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.isVerified) return res.status(400).json({ error: 'User already verified' });

    if (user.otpCode !== otp) return res.status(400).json({ error: 'Invalid OTP' });
    if (user.otpExpiry && user.otpExpiry < new Date()) {
      return res.status(400).json({ error: 'OTP expired' });
    }

    user.isVerified = true;
    user.otpCode = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({ success: true, message: 'OTP verified successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
};

/**
 * Resend OTP
 */
export const resendOtp = async (req: Request, res: Response) => {
  const { email, phone } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.isVerified) return res.status(400).json({ error: 'User already verified' });

    const otpCode = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otpCode = otpCode;
    user.otpExpiry = otpExpiry;
    await user.save();

    if (email) await sendOtpEmail(email, otpCode);
    if (phone) await sendOtpSms(phone, otpCode);

    res.json({ success: true, message: 'OTP resent successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to resend OTP' });
  }
};

/**
 * Login (only if verified)
 */
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    if (!user.isVerified) {
      return res.status(403).json({ error: 'Account not verified. Please verify OTP.' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
};
