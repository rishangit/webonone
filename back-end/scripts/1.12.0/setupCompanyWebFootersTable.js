/**
 * @deprecated Use migrateToCompanyWebLayoutComponents.js (npm run migrate:web-layout-components).
 * Kept for backwards compatibility; merges legacy footers into company_web_layout_components.
 */
const { pool } = require('../../config/database');
const { migrateCompanyWebLayoutComponentsLegacy } = require('./migrateToCompanyWebLayoutComponents');

migrateCompanyWebLayoutComponentsLegacy(pool)
  .then(() => {
    console.log('✅ Done (web layout components migration)');
    process.exit(0);
  })
  .catch((e) => {
    console.error('❌', e.message);
    process.exit(1);
  });
