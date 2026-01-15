require('dotenv').config();
const mongoose = require('mongoose');
const Role = require('../models/Role');
const connectDB = require('../config/database');

const defaultRoles = [
  {
    name: 'SUPERADMIN',
    description: 'Full system access with ability to manage roles and permissions',
    permissions: ['create', 'edit', 'delete', 'publish', 'view'],
    isDefault: true,
  },
  {
    name: 'MANAGER',
    description: 'Can manage content and publish articles',
    permissions: ['create', 'edit', 'delete', 'publish', 'view'],
    isDefault: true,
  },
  {
    name: 'CONTRIBUTOR',
    description: 'Can create and edit articles but cannot publish',
    permissions: ['create', 'edit', 'view'],
    isDefault: true,
  },
  {
    name: 'VIEWER',
    description: 'Can only view published content',
    permissions: ['view'],
    isDefault: true,
  },
];

const seedRoles = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log('Seeding default roles...');

    for (const roleData of defaultRoles) {
      const existingRole = await Role.findOne({ name: roleData.name });
      
      if (existingRole) {
        console.log(`Role ${roleData.name} already exists, skipping...`);
      } else {
        const role = new Role(roleData);
        await role.save();
        console.log(`✓ Created role: ${roleData.name}`);
      }
    }

    console.log('\n✓ Default roles seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding roles:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  seedRoles();
}

module.exports = seedRoles;
