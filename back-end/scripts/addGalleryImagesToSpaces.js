const { pool } = require('../config/database');

async function addGalleryImagesColumn() {
  const connection = await pool.getConnection();
  try {
    // Check if table exists
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'company_spaces'
    `);

    if (tables.length === 0) {
      console.log('Table company_spaces does not exist. Skipping migration.');
      return;
    }

    // Check if column already exists
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'company_spaces' 
      AND COLUMN_NAME = 'galleryImages'
    `);

    if (columns.length > 0) {
      console.log('Column galleryImages already exists in company_spaces table');
      return;
    }

    // Add galleryImages column
    await connection.execute(`
      ALTER TABLE company_spaces 
      ADD COLUMN galleryImages JSON DEFAULT NULL
    `);

    console.log('Successfully added galleryImages column to company_spaces table');
  } catch (error) {
    console.error('Error adding galleryImages column:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// Run the migration
if (require.main === module) {
  addGalleryImagesColumn()
    .then(async () => {
      console.log('Migration completed successfully');
      await pool.end();
      process.exit(0);
    })
    .catch(async (error) => {
      console.error('Migration failed:', error);
      await pool.end();
      process.exit(1);
    });
}

module.exports = { addGalleryImagesColumn };
