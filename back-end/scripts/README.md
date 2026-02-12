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

## Notes

- All one-time migration scripts have been removed as the local and live databases are now in sync
- The database schema is stable and production-ready
- Always backup your database before running any scripts in production
- Utility scripts can be run as needed for maintenance and testing