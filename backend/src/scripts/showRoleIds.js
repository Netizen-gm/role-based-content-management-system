require('dotenv').config();
const mongoose = require('mongoose');
const Role = require('../models/Role');
const connectDB = require('../config/database');

async function showRoleIds() {
  try {
    await connectDB();

    console.log('Role IDs in Database:\n');
    const roles = await Role.find().sort({ name: 1 });
    
    if (roles.length === 0) {
      console.log('No roles found. Run: npm run seed');
      process.exit(1);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Role Name'.padEnd(15) + '| Role ID (ObjectId)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    roles.forEach(role => {
      console.log(`${role.name.padEnd(15)}| ${role._id}`);
    });
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('How it works:');
    console.log('- Users store the Role ObjectId (e.g., ' + roles[0]._id + ')');
    console.log('- When needed, we populate to get full role data');
    console.log('- This allows dynamic role management\n');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

showRoleIds();
