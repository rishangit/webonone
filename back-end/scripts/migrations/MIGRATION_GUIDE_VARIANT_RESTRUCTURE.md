# Product Variant Restructuring Migration Guide

## Overview

This migration restructures the product variant system to use dynamic attributes instead of hardcoded fields (color, size, weight, material). Variants are now defined by one or more variant-defining attributes, making the system more flexible and reusable.

## Changes Made

### Database Changes

1. **Added `isVariantDefining` column** to `product_related_attributes` table
   - Marks which attributes define product variants
   - Allows different products to have different variant-defining attributes

2. **Removed hardcoded columns** from `product_variants` table:
   - `color`
   - `size`
   - `weight`
   - `material`
   - These values are now stored in `product_related_attributes_values`

3. **Data Migration**
   - Existing hardcoded values are migrated to dynamic attributes
   - System attributes are created for Color, Size, Weight, Material if they don't exist
   - Values are moved to `product_related_attributes_values` table

### Backend Changes

- **ProductVariant Model**: Removed hardcoded fields from constructor, create, and update methods
- **ProductRelatedAttribute Model**: Added support for `isVariantDefining` field
- **Routes**: Updated to handle variant-defining attributes
- **Services**: Removed hardcoded field handling

### Frontend Changes

- **ProductVariant Interface**: Removed hardcoded fields
- **VariantDialog**: Updated to save variant-defining attributes
- **ProductAttributesTab**: Added UI to mark attributes as variant-defining
- **ProductVariantCard**: Removed hardcoded field display
- **Services**: Updated to support variant-defining attributes

## Migration Steps

### Step 1: Add isVariantDefining Column

```bash
node back-end/scripts/migrations/add_isVariantDefining_to_product_related_attributes.js
```

Or using SQL:
```bash
mysql -u your_username -p your_database_name < back-end/scripts/migrations/add_isVariantDefining_to_product_related_attributes.sql
```

### Step 2: Migrate Existing Data

**IMPORTANT**: Run this before removing columns to preserve existing data.

```bash
node back-end/scripts/migrations/migrate_hardcoded_variant_values_to_attributes.js
```

This script will:
- Create or find system attributes for Color, Size, Weight, Material
- Link them to products that have variants with these values
- Create `product_related_attributes_values` entries
- Mark these attributes as variant-defining

### Step 3: Remove Hardcoded Columns

**WARNING**: Only run this after Step 2 is complete and verified!

```bash
node back-end/scripts/migrations/remove_hardcoded_columns_from_product_variants.js
```

## Verification

After running migrations, verify:

1. Check that `isVariantDefining` column exists:
   ```sql
   DESCRIBE product_related_attributes;
   ```

2. Verify data migration:
   ```sql
   SELECT COUNT(*) FROM product_related_attributes_values;
   SELECT * FROM product_related_attributes WHERE isVariantDefining = TRUE;
   ```

3. Verify columns removed:
   ```sql
   DESCRIBE product_variants;
   -- Should NOT have color, size, weight, material columns
   ```

## Rollback (if needed)

If you need to rollback:

1. Restore hardcoded columns:
   ```sql
   ALTER TABLE product_variants 
   ADD COLUMN color VARCHAR(50),
   ADD COLUMN size VARCHAR(50),
   ADD COLUMN weight VARCHAR(50),
   ADD COLUMN material VARCHAR(255);
   ```

2. Migrate data back (manual process):
   - Extract values from `product_related_attributes_values`
   - Update `product_variants` with hardcoded values
   - Remove `isVariantDefining` column if desired

## Usage After Migration

### Marking Attributes as Variant-Defining

1. Go to Product Detail → Product Attributes tab
2. Check the "Use as variant-defining attribute" checkbox for attributes that should define variants
3. Save changes

### Creating Variants

1. Go to Product Detail → Overview tab
2. Click "Add Variant"
3. Select variant-defining attributes and set their values
4. Variant name and SKU can be auto-generated or manually entered
5. Save variant

### Viewing Variants

- Variants are displayed with their variant-defining attribute values
- All attribute values are stored in `product_related_attributes_values`
- Variant-defining attributes are shown prominently in the variant dialog

## Notes

- The migration preserves all existing data
- Variants created before migration will have their hardcoded values migrated to dynamic attributes
- The system is backward compatible - old variants will continue to work
- New variants should use the dynamic attribute system

## Support

If you encounter issues during migration:
1. Check the migration logs for errors
2. Verify database permissions
3. Ensure all previous migrations have been run
4. Review the migration scripts for any custom modifications needed
