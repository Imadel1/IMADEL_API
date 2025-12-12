// Utils/seedAdmin.js
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Admin from '../Models/Admin.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDB();

    // Check if admin already exists
    const adminExists = await Admin.findOne({ email: process.env.ADMIN_EMAIL });

    if (adminExists) {
      console.log(' Admin user already exists');
      process.exit(1);
    }

    // Create admin user
    const admin = await Admin.create({
      username: process.env.ADMIN_USERNAME || 'admin',
      email: process.env.ADMIN_EMAIL || 'admin@imadel.org',
      password: process.env.ADMIN_PASSWORD || 'Admin@123',
      role: 'admin'
    });

    console.log('✅ Admin user created successfully');
    console.log(`Email: ${admin.email}`);
    console.log(`Username: ${admin.username}`);
    console.log('⚠️  Please change the password after first login');

    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();