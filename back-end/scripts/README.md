# Database Scripts

This directory contains essential database management scripts for the appointment booking application.

## Core Scripts

### `initDatabase.js`
- **Purpose**: Initializes the database schema
- **Usage**: `node scripts/initDatabase.js`
- **Description**: Creates all necessary tables (users, categories, subcategories, appointments, etc.)

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

### `removeProductColumns.js`
- **Purpose**: Migration script to remove deprecated columns from products table
- **Usage**: `node scripts/removeProductColumns.js`
- **Description**: Removes categoryId, subcategoryId, baseCostPrice, suggestedSellPrice, currentStock, minimumStock, and maximumStock columns from the products table

### `removeProductTagsColumn.js`
- **Purpose**: Migration script to remove tags JSON column from products table
- **Usage**: `node scripts/removeProductTagsColumn.js`
- **Description**: Removes the tags JSON column from the products table. Tags are now stored in the product_tags junction table (similar to company_tags)

### `removeProductUnitNotesColumns.js`
- **Purpose**: Migration script to remove unit and notes columns from products table
- **Usage**: `node scripts/removeProductUnitNotesColumns.js`
- **Description**: Removes the unit and notes columns from the products table

### `migrateProductsToUUID.js`
- **Purpose**: Migration script to convert products table primary key from INT to UUID (deprecated - use migrateProductsToNanoID.js instead)
- **Usage**: `node scripts/migrateProductsToUUID.js`
- **Description**: Converts the products table id column from INT AUTO_INCREMENT to VARCHAR(36) UUID. Also updates the product_tags junction table to use VARCHAR(36) for productId. Generates UUIDs for all existing products.

### `migrateProductsToNanoID.js`
- **Purpose**: Migration script to convert products table primary key to NanoID (8-10 characters)
- **Usage**: `node scripts/migrateProductsToNanoID.js`
- **Description**: Converts the products table id column from UUID (VARCHAR(36)) or INT to NanoID (VARCHAR(10)). Also updates the product_tags junction table to use VARCHAR(10) for productId. Generates NanoIDs (10 characters) for all existing products. NanoID is shorter and more URL-friendly than UUID.

### `removeCategoryTables.js`
- **Purpose**: Migration script to remove category tables (company_categories and product_categories)
- **Usage**: `node scripts/removeCategoryTables.js`
- **Description**: Drops the company_categories and product_categories tables from the database. This migration is run when transitioning from categories to tags. Categories are no longer used in the application.

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

## Database Schema

The application uses the following main tables:
- `users` - User accounts and authentication
- `categories` - Service categories
- `subcategories` - Category subcategories
- `appointments` - Booking appointments
- `services` - Available services
- `companies` - Business entities

## Notes

- All migration scripts have been removed as they were one-time operations
- The database schema is now stable and production-ready
- Always backup your database before running any scripts in production
