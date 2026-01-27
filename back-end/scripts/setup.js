const { createTables, dropTables } = require('./initDatabase');
const { seedDatabase } = require('./seedDatabase');
const { testConnection } = require('../config/database');

const setup = async () => {
  try {
    console.log('🚀 Starting database setup...');
    
    // Test database connection
    console.log('📡 Testing database connection...');
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Database connection failed');
    }
    
    // Ask user if they want to drop existing tables
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const answer = await new Promise((resolve) => {
      rl.question('Do you want to drop existing tables? (y/N): ', resolve);
    });
    
    rl.close();
    
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      console.log('🗑️  Dropping existing tables...');
      await dropTables();
    }
    
    // Create tables
    console.log('📋 Creating database tables...');
    await createTables();
    
    // Ask user if they want to seed the database
    const seedAnswer = await new Promise((resolve) => {
      const rl2 = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      rl2.question('Do you want to seed the database with sample data? (Y/n): ', resolve);
      rl2.close();
    });
    
    if (seedAnswer.toLowerCase() !== 'n' && seedAnswer.toLowerCase() !== 'no') {
      console.log('🌱 Seeding database with sample data...');
      await seedDatabase();
    }
    
    console.log('✅ Database setup completed successfully!');
    console.log('🎉 You can now start the server with: npm run dev');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
};

// Run setup if this file is executed directly
if (require.main === module) {
  setup();
}

module.exports = { setup };

