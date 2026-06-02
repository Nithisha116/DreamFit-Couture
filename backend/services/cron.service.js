import cron from 'node-cron';
import Customer from '../models/Customer.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { getIO } from '../utils/socket.js';

class CronService {
  init() {
    console.log('⏰ Initializing Cron Jobs...');

    // Run every day at 9:00 AM
    cron.schedule('0 9 * * *', async () => {
      console.log('🎂 Running daily birthday check...');
      await this.checkBirthdays();
    });
  }

  async checkBirthdays() {
    try {
      const today = new Date();
      const currentMonth = today.getMonth() + 1; // 1-12
      const currentDay = today.getDate(); // 1-31

      // Find customers with birthdays today using JS filtering to avoid timezone issues
      const allCustomers = await Customer.find({ dateOfBirth: { $ne: null } }, 'firstName lastName phone dateOfBirth');
      
      const customers = allCustomers.filter(customer => {
        const dob = new Date(customer.dateOfBirth);
        return dob.getMonth() + 1 === currentMonth && dob.getDate() === currentDay;
      });

      if (customers.length === 0) {
        console.log('ℹ️ No birthdays found for today.');
        return;
      }

      console.log(`🎉 Found ${customers.length} customer(s) with birthdays today.`);

      // Get staff users (ADMIN, STORE_KEEPER)
      const staffMembers = await User.find({
        role: { $in: ['ADMIN', 'STORE_KEEPER'] }
      });

      if (staffMembers.length === 0) {
        console.log('⚠️ No staff members found to receive birthday notifications.');
        return;
      }

      let io;
      try {
        io = getIO();
      } catch (err) {
        console.warn('Socket.io not initialized yet, will only save to DB');
      }

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      for (const customer of customers) {
        const customerName = `${customer.firstName} ${customer.lastName || ''}`.trim();
        
        for (const staff of staffMembers) {
          // Check if notification was already sent today for this customer to this staff
          const existingNotif = await Notification.findOne({
            type: 'birthday',
            recipient: staff._id,
            message: { $regex: customerName, $options: 'i' },
            createdAt: { $gte: startOfDay, $lte: endOfDay }
          });

          if (existingNotif) {
            continue; // Skip if already notified
          }

          const notification = await Notification.create({
            type: 'birthday',
            recipient: staff._id,
            recipientModel: 'User',
            title: '🎂 Customer Birthday Today',
            message: `${customerName}'s birthday is today. Phone: ${customer.phone}. Send birthday wishes or special offer.`,
            priority: 'high',
            isRead: false
          });

          if (io) {
            io.emit('notification:new', notification);
          }
        }
      }
      
      console.log('✅ Birthday notifications sent successfully.');
    } catch (error) {
      console.error('❌ Error in checkBirthdays cron job:', error);
    }
  }
}

export default new CronService();
