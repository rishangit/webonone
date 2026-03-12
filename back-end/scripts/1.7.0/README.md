# Version 1.7.0 scripts

Scripts for database changes introduced in app version 1.7.0 (web design / company web pages).

## Scripts

### `setupCompanyWebPagesTable.js`
- **Purpose**: Create the `company_web_pages` table.
- **Usage**: `node scripts/1.7.0/setupCompanyWebPagesTable.js`
- **When**: Run once when upgrading to 1.7.0 or when the table is missing.

### `addContentToWebPagesTable.js`
- **Purpose**: Add the `content` (JSON) column to `company_web_pages`.
- **Usage**: `node scripts/1.7.0/addContentToWebPagesTable.js`
- **When**: Run after `setupCompanyWebPagesTable.js` if the table was created without the content column.

## Order

1. `node scripts/1.7.0/setupCompanyWebPagesTable.js`
2. `node scripts/1.7.0/addContentToWebPagesTable.js`
