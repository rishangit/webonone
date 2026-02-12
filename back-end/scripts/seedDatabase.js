const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');
const { nanoid } = require('nanoid');

const seedSuperAdmin = async () => {
  try {
    console.log('Creating superadmin user...');
    
    // Check if superadmin already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      ['admin@appointmentapp.com']
    );

    if (existingUsers.length > 0) {
      console.log('⚠️  Superadmin user already exists. Skipping creation.');
      return;
    }

    // Hash the default password
    const defaultPassword = 'SuperAdmin2024!';
    const hashedPassword = await bcrypt.hash(defaultPassword, 12);

    // Generate ID using nanoid (consistent with User model)
    const superAdminId = nanoid(10);

    // Superadmin user data
    const superAdminData = {
      id: superAdminId,
      email: 'admin@appointmentapp.com',
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      phone: '+1 (555) 000-0001',
      address: '1 Admin Plaza, Tech City, TC 12345',
      dateOfBirth: null,
      preferences: JSON.stringify({
        theme: 'dark',
        notifications: true,
        language: 'en'
      }),
      isActive: true,
      isVerified: true
    };

    // Check if role column exists
    const [columns] = await pool.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'role'
    `);

    const hasRoleColumn = columns.length > 0;

    let query, values;
    if (hasRoleColumn) {
      query = `
        INSERT INTO users (
          id, email, password, firstName, lastName, role, avatar,
          phone, address, dateOfBirth, preferences,
          isActive, isVerified, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `;
      values = [
        superAdminData.id,
        superAdminData.email,
        superAdminData.password,
        superAdminData.firstName,
        superAdminData.lastName,
        0, // Role level 0 for Super Admin
        superAdminData.avatar,
        superAdminData.phone,
        superAdminData.address,
        superAdminData.dateOfBirth,
        superAdminData.preferences,
        superAdminData.isActive,
        superAdminData.isVerified
      ];
    } else {
      query = `
        INSERT INTO users (
          id, email, password, firstName, lastName, avatar,
          phone, address, dateOfBirth, preferences,
          isActive, isVerified, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `;
      values = [
        superAdminData.id,
        superAdminData.email,
        superAdminData.password,
        superAdminData.firstName,
        superAdminData.lastName,
        superAdminData.avatar,
        superAdminData.phone,
        superAdminData.address,
        superAdminData.dateOfBirth,
        superAdminData.preferences,
        superAdminData.isActive,
        superAdminData.isVerified
      ];
    }

    await pool.execute(query, values);

    // If users_role table exists, add role entry
    try {
      const [roleTables] = await pool.execute(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'users_role'
      `);

      if (roleTables.length > 0) {
        await pool.execute(
          `INSERT INTO users_role (userId, role, roleLevel, companyId) 
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE role = ?, roleLevel = ?`,
          [superAdminData.id, 'Super Admin', 0, null, 'Super Admin', 0]
        );
        console.log('✅ Added superadmin role to users_role table');
      }
    } catch (roleError) {
      console.log('ℹ️  users_role table not found or error adding role (this is okay)');
    }

    console.log('✅ Superadmin user created successfully!');
    console.log(`🆔 User ID: ${superAdminId}`);
    console.log('📧 Email: admin@appointmentapp.com');
    console.log('🔑 Password: SuperAdmin2024!');
  } catch (error) {
    console.error('❌ Error creating superadmin user:', error.message);
    throw error;
  }
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    await seedSuperAdmin();
    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Database seeding failed:', error.message);
    throw error;
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('🎉 Seeding process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding process failed:', error);
      process.exit(1);
    });
}

module.exports = {
  seedDatabase,
  seedSuperAdmin
};
