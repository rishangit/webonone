const { pool } = require('../config/database');
const fs = require('fs');
const path = require('path');

// Load seed data from JSON files
const loadSeedData = () => {
  const dataPath = path.join(__dirname, '../../front-end/src/jsondb');
  
  const usersData = JSON.parse(fs.readFileSync(path.join(dataPath, 'users.json'), 'utf8'));
  const appointmentsData = JSON.parse(fs.readFileSync(path.join(dataPath, 'appointments.json'), 'utf8'));
  const servicesData = JSON.parse(fs.readFileSync(path.join(dataPath, 'services.json'), 'utf8'));
  const categoriesData = JSON.parse(fs.readFileSync(path.join(dataPath, 'categories.json'), 'utf8'));
  
  return { usersData, appointmentsData, servicesData, categoriesData };
};

const seedUsers = async (users) => {
  try {
    console.log('Seeding users...');
    
    for (const user of users) {
      const query = `
        INSERT INTO users (
          email, firstName, lastName, role, avatar,
          phone, address, dateOfBirth, preferences,
          isActive, isVerified, createdAt, lastLogin
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        user.email,
        user.firstName,
        user.lastName,
        user.role,
        user.avatar,
        user.phone,
        user.address,
        user.dateOfBirth,
        JSON.stringify(user.preferences || {}),
        user.isActive,
        user.isVerified,
        user.createdAt,
        user.lastLogin
      ];

      await pool.execute(query, values);
    }
    
    console.log(`✅ Seeded ${users.length} users`);
  } catch (error) {
    console.error('❌ Error seeding users:', error.message);
    throw error;
  }
};

const seedCategories = async (categories) => {
  try {
    console.log('Seeding categories...');
    
    for (const category of categories) {
      const query = `
        INSERT INTO categories (
          name, description, icon, isActive, companyCount, subcategories,
          createdDate, lastModified
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        category.name,
        category.description,
        category.icon,
        category.isActive,
        category.companyCount,
        JSON.stringify(category.subcategories || []),
        category.createdDate,
        category.lastModified
      ];

      await pool.execute(query, values);
    }
    
    console.log(`✅ Seeded ${categories.length} categories`);
  } catch (error) {
    console.error('❌ Error seeding categories:', error.message);
    throw error;
  }
};

const seedServices = async (services) => {
  try {
    console.log('Seeding services...');
    
    for (const service of services) {
      const query = `
        INSERT INTO services (
          name, description, duration, price, category, subcategory,
          status, companyId, provider, bookings, tags, image
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        service.name,
        service.description,
        service.duration,
        service.price,
        service.category,
        service.subcategory,
        service.status,
        service.companyId,
        JSON.stringify(service.provider || null),
        JSON.stringify(service.bookings || {}),
        JSON.stringify(service.tags || []),
        service.image
      ];

      await pool.execute(query, values);
    }
    
    console.log(`✅ Seeded ${services.length} services`);
  } catch (error) {
    console.error('❌ Error seeding services:', error.message);
    throw error;
  }
};

const seedAppointments = async (appointments) => {
  try {
    console.log('Seeding appointments...');
    
    for (const appointment of appointments) {
      const query = `
        INSERT INTO appointments (
          title, description, clientId, clientName, clientEmail, clientPhone,
          companyId, companyName, serviceId, serviceName, providerId, providerName,
          spaceId, spaceName, date, time, duration, status, type, priority,
          price, paymentStatus, paymentMethod, notes, reminderSent, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        appointment.title,
        appointment.description,
        appointment.clientId,
        appointment.clientName,
        appointment.clientEmail,
        appointment.clientPhone,
        appointment.companyId,
        appointment.companyName,
        appointment.serviceId,
        appointment.serviceName,
        appointment.providerId,
        appointment.providerName,
        appointment.spaceId,
        appointment.spaceName,
        appointment.date,
        appointment.time,
        appointment.duration,
        appointment.status,
        appointment.type,
        appointment.priority,
        appointment.price,
        appointment.paymentStatus,
        appointment.paymentMethod,
        appointment.notes,
        appointment.reminderSent,
        appointment.createdAt,
        appointment.updatedAt
      ];

      await pool.execute(query, values);
    }
    
    console.log(`✅ Seeded ${appointments.length} appointments`);
  } catch (error) {
    console.error('❌ Error seeding appointments:', error.message);
    throw error;
  }
};

const seedCompanies = async () => {
  try {
    console.log('Seeding companies...');
    
    const companies = [
      {
        id: 'comp_1',
        name: 'Beauty & Wellness Spa',
        description: 'Full-service beauty and wellness spa offering facials, massages, and aromatherapy treatments.',
        category: 'Beauty & Wellness',
        subcategory: 'Spa & Massage',
        address: '123 Beauty Avenue, Los Angeles, CA 90210',
        phone: '+1 (555) 123-4567',
        email: 'info@beautyspace.com',
        website: 'https://beautyspace.com',
        ownerId: 'user_2',
        isActive: true
      },
      {
        id: 'comp_2',
        name: 'DentalCare Pro',
        description: 'Professional dental clinic providing comprehensive dental care and cosmetic treatments.',
        category: 'Healthcare & Medical',
        subcategory: 'Dental Services',
        address: '456 Health Street, San Francisco, CA 94105',
        phone: '+1 (555) 987-6543',
        email: 'info@dentalcare.com',
        website: 'https://dentalcare.com',
        ownerId: 'user_3',
        isActive: true
      },
      {
        id: 'comp_3',
        name: 'Fitness Plus',
        description: 'Modern fitness center with personal training and group classes.',
        category: 'Beauty & Wellness',
        subcategory: 'Fitness & Gyms',
        address: '100 Fitness Way, Austin, TX 78701',
        phone: '+1 (555) 678-9012',
        email: 'info@fitnessplus.com',
        website: 'https://fitnessplus.com',
        ownerId: 'user_8',
        isActive: true
      }
    ];

    for (const company of companies) {
      const query = `
        INSERT INTO companies (
          id, name, description, category, subcategory, address, phone, email, website, ownerId, isActive
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        company.id, company.name, company.description, company.category,
        company.subcategory, company.address, company.phone, company.email,
        company.website, company.ownerId, company.isActive
      ];

      await pool.execute(query, values);
    }
    
    console.log(`✅ Seeded ${companies.length} companies`);
  } catch (error) {
    console.error('❌ Error seeding companies:', error.message);
    throw error;
  }
};

const seedSpaces = async () => {
  try {
    console.log('Seeding spaces...');
    
    const spaces = [
      {
        id: 'space_1',
        name: 'Treatment Room A',
        description: 'Private treatment room for facials and skincare treatments',
        type: 'Treatment Room',
        capacity: 1,
        companyId: 'comp_1',
        isActive: true
      },
      {
        id: 'space_2',
        name: 'Massage Room B',
        description: 'Relaxing massage room with aromatherapy',
        type: 'Massage Room',
        capacity: 1,
        companyId: 'comp_1',
        isActive: true
      },
      {
        id: 'space_3',
        name: 'Dental Chair 1',
        description: 'Standard dental examination chair',
        type: 'Dental Chair',
        capacity: 1,
        companyId: 'comp_2',
        isActive: true
      }
    ];

    for (const space of spaces) {
      const query = `
        INSERT INTO spaces (id, name, description, type, capacity, companyId, isActive)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        space.id, space.name, space.description, space.type,
        space.capacity, space.companyId, space.isActive
      ];

      await pool.execute(query, values);
    }
    
    console.log(`✅ Seeded ${spaces.length} spaces`);
  } catch (error) {
    console.error('❌ Error seeding spaces:', error.message);
    throw error;
  }
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    const { usersData, appointmentsData, servicesData, categoriesData } = loadSeedData();
    
    // Seed in order to respect foreign key constraints
    await seedUsers(usersData.users);
    await seedCategories(categoriesData.categories);
    await seedCompanies();
    await seedSpaces();
    await seedServices(servicesData.services);
    await seedAppointments(appointmentsData.appointments);
    
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
  seedUsers,
  seedCategories,
  seedServices,
  seedAppointments,
  seedCompanies,
  seedSpaces
};

