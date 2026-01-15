require('dotenv').config();
const mongoose = require('mongoose');
const Article = require('../models/Article');
const User = require('../models/User');
const Role = require('../models/Role'); // Required for populate to work
const connectDB = require('../config/database');

const sampleArticles = [
  {
    title: 'Welcome to Our CMS Platform',
    body: 'This is a comprehensive Content Management System built with Node.js, Express, MongoDB, and Angular. It features dynamic role-based access control, allowing administrators to create custom roles and assign specific permissions to users. The system supports article creation, editing, publishing, and management with a user-friendly interface.',
    status: 'published',
  },
  {
    title: 'Understanding Role-Based Access Control',
    body: 'Role-Based Access Control (RBAC) is a security mechanism that restricts system access based on user roles. In this CMS, we have implemented a dynamic RBAC system where SuperAdmins can create custom roles and assign permissions like create, edit, delete, publish, and view. Each role has specific capabilities that determine what actions users can perform within the system.',
    status: 'published',
  },
  {
    title: 'Getting Started with Article Management',
    body: 'Creating and managing articles is simple in this CMS. Users with the appropriate permissions can create new articles, add images, set publication status, and manage their content. Articles can be in either published or unpublished state, and only users with publish permissions can change the status. Viewers can only see published articles, ensuring content control and workflow management.',
    status: 'published',
  },
  {
    title: 'Best Practices for Content Creation',
    body: 'When creating content, it\'s important to write clear, engaging titles and well-structured body content. Use images to enhance your articles and make them more visually appealing. Remember to set the appropriate status - unpublished articles are only visible to users with view permissions beyond the Viewer role. Always review your content before publishing to ensure quality and accuracy.',
    status: 'unpublished',
  },
  {
    title: 'Security Features in Our CMS',
    body: 'Security is a top priority in this CMS. We use JWT tokens for authentication, with separate access and refresh tokens. Tokens are rotated on each login for enhanced security. The system also implements token blacklisting to handle logout and token revocation. All API endpoints are protected with authentication middleware, and permissions are checked before allowing any operations.',
    status: 'published',
  },
];

const seedArticles = async () => {
  try {
    await connectDB();
    console.log('Seeding sample articles...\n');

    // Get a user to use as author (prefer SuperAdmin or Manager)
    let author = await User.findOne().populate('role');
    if (!author) {
      console.error('No users found. Please seed users first: npm run seed:users');
      process.exit(1);
    }

    // Try to get a user with create permission
    const users = await User.find().populate('role');
    for (const user of users) {
      if (user.role && user.role.permissions && user.role.permissions.includes('create')) {
        author = user;
        break;
      }
    }

    console.log(`Using author: ${author.email} (${author.role ? author.role.name : 'No Role'})\n`);

    let createdCount = 0;
    let skippedCount = 0;

    for (const articleData of sampleArticles) {
      // Check if article with same title already exists
      const existing = await Article.findOne({ title: articleData.title });
      if (existing) {
        console.log(`⚠ Article "${articleData.title}" already exists, skipping...`);
        skippedCount++;
        continue;
      }

      const article = new Article({
        ...articleData,
        author: author._id,
      });

      await article.save();
      console.log(`✓ Created article: "${articleData.title}" (${articleData.status})`);
      createdCount++;
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✓ Articles seeded successfully!`);
    console.log(`  Created: ${createdCount}`);
    console.log(`  Skipped: ${skippedCount}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Show summary
    const totalArticles = await Article.countDocuments();
    const publishedCount = await Article.countDocuments({ status: 'published' });
    const unpublishedCount = await Article.countDocuments({ status: 'unpublished' });

    console.log('Article Summary:');
    console.log(`  Total Articles: ${totalArticles}`);
    console.log(`  Published: ${publishedCount}`);
    console.log(`  Unpublished: ${unpublishedCount}\n`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding articles:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedArticles();
}

module.exports = seedArticles;
