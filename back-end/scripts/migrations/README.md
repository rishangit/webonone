# Database Migrations

This directory contains database migration scripts for updating the live environment.

## System Product Attributes Migration

### Files
- `create_systemproductattribute_table.js` - Node.js migration script (creates `product_attributes` table)
- `create_systemproductattribute_table.sql` - SQL migration script (creates `product_attributes` table)
- `rename_systemproductattribute_to_product_attributes.js` - Renames `systemproductattribute` to `product_attributes`

### Running the Migration

#### Option 1: Using Node.js Script (Recommended)
```bash
cd back-end
node scripts/migrations/create_systemproductattribute_table.js
```

#### Option 2: Using SQL Script
```bash
mysql -u your_username -p your_database_name < scripts/migrations/create_systemproductattribute_table.sql
```

Or execute directly in MySQL:
```sql
source scripts/migrations/create_systemproductattribute_table.sql;
```

### What This Migration Does

Creates the `product_attributes` table with the following structure:
- `id` - Primary key (VARCHAR(10))
- `name` - Attribute name (VARCHAR(255))
- `description` - Attribute description (TEXT)
- `valueDataType` - Attribute data type: 'text', 'number', 'boolean', 'date', 'json' (ENUM)
- `unit_of_measure` - Foreign key to units_of_measure table (VARCHAR(10))
- `isActive` - Active status (BOOLEAN)
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

### Verification

After running the migration, verify the table was created:
```sql
SHOW TABLES LIKE 'product_attributes';
DESCRIBE product_attributes;
```

Or run the verification script:
```bash
node scripts/verifyDatabase.js
```

### Rollback

If you need to rollback this migration:
```sql
DROP TABLE IF EXISTS product_attributes;
```

**Note:** This will delete all system product attribute data. Make sure to backup your data before rolling back.
