require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Role = require('../models/Role');
const connectDB = require('../config/database');

const defaultUsers = [
  {
    fullName: 'Super Admin',
    email: 'superadmin@test.com',
    password: 'password123',
    roleName: 'SUPERADMIN',
  },
  {
    fullName: 'Manager User',
    email: 'manager@test.com',
    password: 'password123',
    roleName: 'MANAGER',
  },
  {
    fullName: 'Contributor User',
    email: 'contributor@test.com',
    password: 'password123',
    roleName: 'CONTRIBUTOR',
  },
  {
    fullName: 'Viewer User',
    email: 'viewer@test.com',
    password: 'password123',
    roleName: 'VIEWER',
  },
];

const seedUsers = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log('Seeding default users...\n');

    for (const userData of defaultUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      
      if (existingUser) {
        console.log(`User ${userData.email} already exists, skipping...`);
        continue;
      }

      // Get role
      const role = await Role.findOne({ name: userData.roleName });
      if (!role) {
        console.log(`Role ${userData.roleName} not found, skipping user ${userData.email}...`);
        continue;
      }

      // Create user
      const user = new User({
        fullName: userData.fullName,
        email: userData.email,
        password: userData.password,
        role: role._id,
      });

      await user.save();
      console.log(`✓ Created user: ${userData.email} (${userData.roleName})`);
    }

    console.log('\n✓ Default users seeded successfully!');
    console.log('\nDefault Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    defaultUsers.forEach(user => {
      console.log(`Role: ${user.roleName.padEnd(12)} | Email: ${user.email.padEnd(25)} | Password: ${user.password}`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  seedUsers();
}

module.exports = seedUsers;
