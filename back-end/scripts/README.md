# Database Scripts

This directory contains essential database management scripts for the appointment booking application.

## Core Scripts

### `initDatabase.js`
- **Purpose**: Initializes the database schema
- **Usage**: `node scripts/initDatabase.js`
- **Description**: Creates all necessary tables (users, appointments, services, companies, etc.)

### `seedDatabase.js`
- **Purpose**: Seeds the database with initial data
- **Usage**: `node scripts/seedDatabase.js`
- **Description**: Populates the database with sample users, categories, and other essential data

### `setup.js`
- **Purpose**: Complete application setup
- **Usage**: `node scripts/setup.js`
- **Description**: Runs database initialization and seeding in the correct order

### `start.js`
- **Purpose**: Application startup script
- **Usage**: `node scripts/start.js`
- **Description**: Starts the application server with proper configuration

## Utility Scripts

### `verifyDatabase.js`
- **Purpose**: Verify database structure and tables
- **Usage**: `node scripts/verifyDatabase.js`
- **Description**: Checks if all required tables exist and verifies their structure

### `migrateToUnifiedEntityTags.js`
- **Purpose**: Migrate tag data from separate tables to unified entity_tags table
- **Usage**: `node scripts/migrateToUnifiedEntityTags.js`
- **Safety**: Safe for production - idempotent, checks for existing records before inserting
- **Description**: Migrates tag relationships from old tables (company_tags, product_tags, service_tags, space_tags, company_product_tags) to the new unified entity_tags table.
- **What it does**:
  - Creates entity_tags table if it doesn't exist
  - Migrates data from all old tag tables
  - Skips records that already exist (safe to run multiple times)
  - Preserves old tables for backward compatibility (until you run migrateDropOldTagTables.js)

### `migrateDropOldTagTables.js`
- **Purpose**: Remove old tag tables after migration to unified entity_tags
- **Usage**: `node scripts/migrateDropOldTagTables.js`
- **Safety**: Requires confirmation - permanently deletes old tag tables
- **Description**: Drops the old tag junction tables (company_tags, product_tags, service_tags, space_tags, company_product_tags) after migration is complete and verified.
- **When to run**: Only after:
  1. Migration to entity_tags has been completed successfully
  2. All code has been updated to use entity_tags
  3. You have verified that entity_tags contains all the data
  4. You have a database backup

### `migrateAddPasswordResetTokens.js`
- **Purpose**: Rename password_reset_tokens table to authentication_tokens (for multiple auth token types)
- **File**: `migrateRenamePasswordResetTokensToAuthenticationTokens.js`
- **Usage**: `node scripts/migrateRenamePasswordResetTokensToAuthenticationTokens.js`
- **Safety**: Safe for production - uses atomic RENAME TABLE operation, preserves all data and indexes
- **Usage**: `node scripts/migrateAddPasswordResetTokens.js`
- **Description**: Migration script to add the password reset tokens table for existing databases. Safe to run multiple times (checks if table exists first).

### `generateRandomUsers.js`
- **Purpose**: Generate random test users
- **Usage**: `node scripts/generateRandomUsers.js`
- **Description**: Creates a specified number of random users for testing purposes

### `cleanupOrphanedRows.js`
- **Purpose**: Clean up orphaned database rows
- **Usage**: `node scripts/cleanupOrphanedRows.js`
- **Description**: Removes orphaned records that violate referential integrity

### `addDummyCompanyLogos.js`
- **Purpose**: Add dummy logos to companies
- **Usage**: `node scripts/addDummyCompanyLogos.js`
- **Description**: Updates companies with placeholder logo URLs for testing

### `updateMielleVariants.js`
- **Purpose**: Update specific product variants
- **Usage**: `node scripts/updateMielleVariants.js`
- **Description**: Updates Mielle product variants with specific data

## Usage

### First Time Setup
```bash
# Run complete setup (recommended)
node scripts/setup.js

# Or run individually
node scripts/initDatabase.js
node scripts/seedDatabase.js
```

### Starting the Application
```bash
node scripts/start.js
```

### Verifying Database
```bash
node scripts/verifyDatabase.js
```

## Migration Scripts

### Migrating to Unified Entity Tags
If you have an existing database with separate tag tables and need to migrate to the unified entity_tags structure:
```bash
node scripts/migrateToUnifiedEntityTags.js
```

This script will:
- Create the entity_tags table if it doesn't exist
- Migrate data from company_tags, product_tags, service_tags, space_tags, and company_product_tags
- Skip records that already exist (idempotent - safe to run multiple times)
- Preserve old tables for backward compatibility
- Provide a detailed migration summary

**Note**: This migration is safe for production use. Old tag tables are preserved during the transition period for backward compatibility.

### Renaming Password Reset Tokens Table
If you have an existing database with `password_reset_tokens` table and need to rename it to `authentication_tokens`:
```bash
node scripts/migrateRenamePasswordResetTokensToAuthenticationTokens.js
```

This script will:
- Check if the `password_reset_tokens` table exists
- Check if `authentication_tokens` table already exists
- Rename the table using atomic RENAME TABLE operation (preserves all data, indexes, and foreign keys)
- Verify the rename was successful
- Safe to run multiple times (idempotent)

**Note**: This migration is safe for production use. The RENAME TABLE operation in MySQL is atomic and preserves all data.

## Notes

- The database schema is stable and production-ready
- Always backup your database before running any scripts in production
- Migration scripts are idempotent and safe to run multiple times
- Utility scripts can be run as needed for maintenance and testing