import cron from 'node-cron';
import { Student } from '../models/Student';

export const startCronJobs = () => {
  // Run every day at 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('[CRON] Starting daily scan for expiring & expired passes...');
    try {
      const now = new Date();
      
      const in3Days = new Date();
      in3Days.setDate(in3Days.getDate() + 3);

      const in7Days = new Date();
      in7Days.setDate(in7Days.getDate() + 7);

      // We'll log to console for now, but in the future this will trigger Twilio/WhatsApp APIs.
      
      const expiringSoon = await Student.find({
        expiryDate: { $gt: now, $lte: in7Days },
        paymentStatus: { $ne: 'paid' } // Only alert if they haven't bypassed or paid ahead
      }).select('name parentPhone expiryDate amount');

      if (expiringSoon.length > 0) {
        console.log(`[CRON] Found ${expiringSoon.length} students expiring within 7 days.`);
        for (const student of expiringSoon) {
          // Future: await smsClient.send({ to: student.parentPhone, body: 'Reminder...' })
          console.log(`[ALERT] Mock SMS sent to ${student.parentPhone} for ${student.name} - Expires on ${student.expiryDate.toDateString()}`);
        }
      } else {
        console.log('[CRON] No passes expiring soon.');
      }
      
    } catch (err) {
      console.error('[CRON ERROR]', err);
    }
  });

  console.log('[CRON] Jobs initialized.');
};
