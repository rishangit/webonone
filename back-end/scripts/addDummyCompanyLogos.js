const { pool } = require('../config/database');

// Array of dummy logo URLs from reliable public image services
// Using dummyimage.com - a reliable placeholder image service
// Format: https://dummyimage.com/200x200/[hex-color]/[text-color].png&text=[text]
const dummyLogos = [
  'https://dummyimage.com/200x200/4F46E5/FFFFFF.png&text=Company',
  'https://dummyimage.com/200x200/10B981/FFFFFF.png&text=Logo',
  'https://dummyimage.com/200x200/F59E0B/FFFFFF.png&text=Brand',
  'https://dummyimage.com/200x200/EF4444/FFFFFF.png&text=Corp',
  'https://dummyimage.com/200x200/8B5CF6/FFFFFF.png&text=Inc',
  'https://dummyimage.com/200x200/3B82F6/FFFFFF.png&text=Biz',
  'https://dummyimage.com/200x200/06B6D4/FFFFFF.png&text=Group',
  'https://dummyimage.com/200x200/14B8A6/FFFFFF.png&text=Co',
  'https://dummyimage.com/200x200/EC4899/FFFFFF.png&text=Pro',
  'https://dummyimage.com/200x200/F97316/FFFFFF.png&text=Plus',
  'https://dummyimage.com/200x200/84CC16/FFFFFF.png&text=Elite',
  'https://dummyimage.com/200x200/6366F1/FFFFFF.png&text=Prime',
  'https://dummyimage.com/200x200/A855F7/FFFFFF.png&text=Max',
  'https://dummyimage.com/200x200/DC2626/FFFFFF.png&text=Gold',
  'https://dummyimage.com/200x200/EA580C/FFFFFF.png&text=Star',
  'https://dummyimage.com/200x200/CA8A04/FFFFFF.png&text=Pro',
  'https://dummyimage.com/200x200/16A34A/FFFFFF.png&text=Plus',
  'https://dummyimage.com/200x200/0891B2/FFFFFF.png&text=Elite',
  'https://dummyimage.com/200x200/0284C7/FFFFFF.png&text=Prime',
  'https://dummyimage.com/200x200/2563EB/FFFFFF.png&text=Max',
  'https://dummyimage.com/200x200/7C3AED/FFFFFF.png&text=Gold',
  'https://dummyimage.com/200x200/C026D3/FFFFFF.png&text=Star',
  'https://dummyimage.com/200x200/DB2777/FFFFFF.png&text=Pro',
  'https://dummyimage.com/200x200/E11D48/FFFFFF.png&text=Plus',
  'https://dummyimage.com/200x200/DC2626/FFFFFF.png&text=Elite',
];

async function addDummyCompanyLogos() {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    console.log('Fetching all companies...');
    
    // Get all companies to update with reliable logo URLs
    const [companies] = await connection.execute(`
      SELECT id, name, logo 
      FROM companies 
      ORDER BY id
    `);
    
    console.log(`Found ${companies.length} companies to update`);
    
    if (companies.length === 0) {
      console.log('✅ No companies found');
      await connection.commit();
      return;
    }
    
    let updatedCount = 0;
    
    // Update each company with a random logo from the dummy logos array
    for (let i = 0; i < companies.length; i++) {
      const company = companies[i];
      const logoIndex = i % dummyLogos.length; // Cycle through logos if there are more companies than logos
      const logoUrl = dummyLogos[logoIndex];
      
      await connection.execute(
        'UPDATE companies SET logo = ? WHERE id = ?',
        [logoUrl, company.id]
      );
      
      updatedCount++;
      console.log(`✅ Updated ${company.name} (${company.id}) with logo: ${logoUrl}`);
    }
    
    await connection.commit();
    console.log(`\n✅ Successfully updated ${updatedCount} companies with dummy logos`);
    
  } catch (error) {
    await connection.rollback();
    console.error('❌ Error updating company logos:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// Run script
addDummyCompanyLogos()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

