const { pool } = require('../../config/database');
const { nanoid } = require('nanoid');

/**
 * Migration: Migrate hardcoded variant values to dynamic attributes
 * This migration:
 * 1. Creates or finds system attributes for color, size, weight, material
 * 2. Links them to products that have variants with these values
 * 3. Creates product_related_attributes_values entries
 * 4. Marks these attributes as variant-defining
 * 
 * Run this script to update the live environment:
 * node scripts/migrations/migrate_hardcoded_variant_values_to_attributes.js
 */

const migrateHardcodedVariantValues = async () => {
  const connection = await pool.getConnection();
  
  try {
    console.log('🔄 Starting migration: Migrate hardcoded variant values to dynamic attributes...');
    await connection.beginTransaction();

    // Step 1: Create or find system attributes for color, size, weight, material
    const attributeNames = ['Color', 'Size', 'Weight', 'Material'];
    const attributeMap = {};

    for (const attrName of attributeNames) {
      // Check if attribute already exists
      const [existing] = await connection.execute(
        'SELECT id FROM product_attributes WHERE name = ?',
        [attrName]
      );

      if (existing.length > 0) {
        attributeMap[attrName.toLowerCase()] = existing[0].id;
        console.log(`✅ Found existing attribute: ${attrName} (${existing[0].id})`);
      } else {
        // Create new attribute
        const attributeId = nanoid(10);
        await connection.execute(
          `INSERT INTO product_attributes (id, name, description, valueDataType, isActive, createdAt, updatedAt)
           VALUES (?, ?, ?, 'text', TRUE, NOW(), NOW())`,
          [attributeId, attrName, `${attrName} attribute for product variants`]
        );
        attributeMap[attrName.toLowerCase()] = attributeId;
        console.log(`✅ Created new attribute: ${attrName} (${attributeId})`);
      }
    }

    // Step 2: Get all variants with hardcoded values
    const [variants] = await connection.execute(
      `SELECT id, productId, color, size, weight, material 
       FROM product_variants 
       WHERE color IS NOT NULL 
          OR size IS NOT NULL 
          OR weight IS NOT NULL 
          OR material IS NOT NULL`
    );

    console.log(`📦 Found ${variants.length} variants with hardcoded values to migrate`);

    // Step 3: For each variant, create product_related_attributes and values
    for (const variant of variants) {
      const productId = variant.productId;
      const variantId = variant.id;

      // Process each attribute type
      const attributesToProcess = [
        { field: 'color', attributeId: attributeMap.color },
        { field: 'size', attributeId: attributeMap.size },
        { field: 'weight', attributeId: attributeMap.weight },
        { field: 'material', attributeId: attributeMap.material },
      ];

      for (const { field, attributeId } of attributesToProcess) {
        const value = variant[field];
        
        if (value && value.trim() !== '') {
          // Check if product_related_attribute exists for this product and attribute
          const [existingPra] = await connection.execute(
            'SELECT id FROM product_related_attributes WHERE productId = ? AND attributeId = ?',
            [productId, attributeId]
          );

          let praId;
          if (existingPra.length > 0) {
            praId = existingPra[0].id;
          } else {
            // Create product_related_attribute
            praId = nanoid(10);
            await connection.execute(
              `INSERT INTO product_related_attributes 
               (id, productId, attributeId, isVariantDefining, createdAt, updatedAt)
               VALUES (?, ?, ?, TRUE, NOW(), NOW())`,
              [praId, productId, attributeId]
            );
            console.log(`  ✅ Created product_related_attribute for ${field} on product ${productId}`);
          }

          // Mark as variant-defining if not already
          await connection.execute(
            'UPDATE product_related_attributes SET isVariantDefining = TRUE WHERE id = ?',
            [praId]
          );

          // Check if value already exists
          const [existingValue] = await connection.execute(
            'SELECT id FROM product_related_attributes_values WHERE variantId = ? AND productRelatedAttributeId = ?',
            [variantId, praId]
          );

          if (existingValue.length === 0) {
            // Create product_related_attributes_value
            const valueId = nanoid(10);
            await connection.execute(
              `INSERT INTO product_related_attributes_values 
               (id, variantId, productRelatedAttributeId, attributeValue, createdAt, updatedAt)
               VALUES (?, ?, ?, ?, NOW(), NOW())`,
              [valueId, variantId, praId, value.trim()]
            );
            console.log(`    ✅ Migrated ${field} value "${value}" for variant ${variantId}`);
          }
        }
      }
    }

    await connection.commit();
    console.log('✅ Migration completed successfully: Hardcoded variant values migrated to dynamic attributes');
  } catch (error) {
    await connection.rollback();
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    connection.release();
  }
};

// Run migration if this file is executed directly
if (require.main === module) {
  migrateHardcodedVariantValues()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateHardcodedVariantValues };
