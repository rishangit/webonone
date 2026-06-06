const { pool } = require('../../config/database');

const setupCompanyCustomFormsTables = async (connectionPool = pool) => {
  console.log('Creating company_custom_forms table...');

  await connectionPool.execute(`
    CREATE TABLE IF NOT EXISTS company_custom_forms (
      id VARCHAR(10) PRIMARY KEY,
      companyId VARCHAR(10) NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT NULL,
      isActive BOOLEAN DEFAULT TRUE,
      definition JSON NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_company (companyId),
      INDEX idx_active (isActive)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  `);

  try {
    const [fkCheck] = await connectionPool.execute(`
      SELECT CONSTRAINT_NAME
      FROM information_schema.TABLE_CONSTRAINTS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'company_custom_forms'
      AND CONSTRAINT_TYPE = 'FOREIGN KEY'
      AND CONSTRAINT_NAME LIKE '%companyId%'
    `);
    if (fkCheck.length === 0) {
      await connectionPool.execute(`
        ALTER TABLE company_custom_forms
        ADD CONSTRAINT fk_company_custom_forms_companyId
        FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE
      `);
    }
  } catch (fkError) {
    console.warn('⚠️  Could not add FK for company_custom_forms:', fkError.message);
  }

  console.log('Creating company_custom_form_submissions table...');

  await connectionPool.execute(`
    CREATE TABLE IF NOT EXISTS company_custom_form_submissions (
      id VARCHAR(10) PRIMARY KEY,
      companyId VARCHAR(10) NOT NULL,
      formId VARCHAR(10) NOT NULL,
      appointmentId VARCHAR(10) NULL,
      clientId VARCHAR(10) NULL,
      submittedByUserId VARCHAR(10) NULL,
      \`values\` JSON NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_company (companyId),
      INDEX idx_appointment (appointmentId),
      INDEX idx_form (formId)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  `);

  try {
    await connectionPool.execute(`
      ALTER TABLE company_custom_forms CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci
    `);
  } catch (alterError) {
    if (!alterError.message.includes("doesn't exist")) {
      console.warn('⚠️  Could not convert company_custom_forms collation:', alterError.message);
    }
  }

  try {
    await connectionPool.execute(`
      ALTER TABLE company_custom_form_submissions CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci
    `);
  } catch (alterError) {
    if (!alterError.message.includes("doesn't exist")) {
      console.warn(
        '⚠️  Could not convert company_custom_form_submissions collation:',
        alterError.message
      );
    }
  }

  try {
    const [fkCheckSub] = await connectionPool.execute(`
      SELECT CONSTRAINT_NAME
      FROM information_schema.TABLE_CONSTRAINTS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'company_custom_form_submissions'
      AND CONSTRAINT_TYPE = 'FOREIGN KEY'
    `);
    if (fkCheckSub.length === 0) {
      await connectionPool.execute(`
        ALTER TABLE company_custom_form_submissions
        ADD CONSTRAINT fk_ccf_submissions_companyId
        FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE,
        ADD CONSTRAINT fk_ccf_submissions_formId
        FOREIGN KEY (formId) REFERENCES company_custom_forms(id) ON DELETE CASCADE
      `);
    }
  } catch (fkError) {
    console.warn('⚠️  Could not add FKs for company_custom_form_submissions:', fkError.message);
  }

  console.log('✅ Custom forms tables ready');
};

if (require.main === module) {
  setupCompanyCustomFormsTables()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Error:', error.message);
      process.exit(1);
    });
}

module.exports = { setupCompanyCustomFormsTables };
