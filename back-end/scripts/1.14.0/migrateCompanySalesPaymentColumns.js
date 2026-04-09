const { pool } = require('../../config/database');

const migrateCompanySalesPaymentColumns = async () => {
  try {
    console.log('Starting migration: company_sales payment columns...');

    const [tables] = await pool.execute(`
      SELECT TABLE_NAME
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'company_sales'
    `);

    if (!tables.length) {
      console.log('⚠️  Table company_sales does not exist. Nothing to migrate.');
      return;
    }

    const [columns] = await pool.execute(`
      SELECT COLUMN_NAME
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'company_sales'
        AND COLUMN_NAME IN ('paymentMethod', 'paymentStatus')
    `);

    const existing = new Set(columns.map((col) => col.COLUMN_NAME));

    if (!existing.has('paymentMethod')) {
      await pool.execute(`
        ALTER TABLE company_sales
        ADD COLUMN paymentMethod VARCHAR(50) DEFAULT 'Cash'
      `);
      console.log('✅ Added column: company_sales.paymentMethod');
    } else {
      console.log('ℹ️  Column already exists: company_sales.paymentMethod');
    }

    if (!existing.has('paymentStatus')) {
      await pool.execute(`
        ALTER TABLE company_sales
        ADD COLUMN paymentStatus ENUM('Pending', 'Paid', 'Refunded') DEFAULT 'Paid'
      `);
      console.log('✅ Added column: company_sales.paymentStatus');
    } else {
      console.log('ℹ️  Column already exists: company_sales.paymentStatus');
    }

    // Normalize existing data to avoid null/empty values in legacy rows.
    await pool.execute(`
      UPDATE company_sales
      SET paymentMethod = 'Cash'
      WHERE paymentMethod IS NULL OR TRIM(paymentMethod) = ''
    `);

    await pool.execute(`
      UPDATE company_sales
      SET paymentStatus = 'Paid'
      WHERE paymentStatus IS NULL OR TRIM(paymentStatus) = ''
    `);

    console.log('✅ Migration completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  }
};

migrateCompanySalesPaymentColumns()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

