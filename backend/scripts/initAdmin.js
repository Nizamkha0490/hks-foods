import mongoose from 'mongoose';
import Admin from '../models/Admin.js';
import dotenv from 'dotenv';

dotenv.config();

const initAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const adminCount = await Admin.countDocuments();
    
    if (adminCount === 0) {
      // Create default admin
      const defaultAdmin = new Admin({
        username: 'nizam',
        email: 'nk862828@gmail.com',
        password: 'nizam123', // This will be hashed automatically
      });

      await defaultAdmin.save();
      console.log('Default admin created successfully!');
      console.log('Email: admin@khyberfoods.com');
      console.log('Password: admin123');
      console.log('Please change the password after first login!');
    } else {
      console.log('Admin already exists in database');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error initializing admin:', error);
    process.exit(1);
  }
};

initAdmin();
