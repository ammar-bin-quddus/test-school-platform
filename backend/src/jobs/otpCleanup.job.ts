import cron from 'node-cron';
import User from '../models/User.model';

// Run every 10 minutes
cron.schedule('*/10 * * * *', async () => {
  try {
    const now = new Date();
    const result = await User.updateMany(
      { otpExpiry: { $lt: now } },
      { $unset: { otpCode: "", otpExpiry: "" } }
    );

    if (result.modifiedCount > 0) {
      console.log(`[OTP CLEANUP] Removed expired OTPs from ${result.modifiedCount} user(s)`);
    }
  } catch (err) {
    console.error('[OTP CLEANUP] Failed:', err);
  }
});
