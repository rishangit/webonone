const { pool } = require('../config/database');
const ProductVariant = require('../models/ProductVariant');
const CompanyProductVariant = require('../models/CompanyProductVariant');
const { nanoid } = require('nanoid');

// Variants to update
const variants = [
  {
    "name": "Mielle Babassu & Mint Damage Repair Shampoo",
    "sku": "MI-BM-DR-237",
    "color": "Green",
    "size": "237ml",
    "weight": "250g",
    "material": "Liquid"
  },
  {
    "name": "Mielle Babassu & Mint Damage Repair Shampoo",
    "sku": "MI-BM-DR-355",
    "color": "Green",
    "size": "355ml",
    "weight": "380g",
    "material": "Liquid"
  },
  {
    "name": "Mielle Rosemary Mint Strengthening Shampoo",
    "sku": "MI-RM-ST-355",
    "color": "Dark Green",
    "size": "355ml",
    "weight": "390g",
    "material": "Liquid"
  },
  {
    "name": "Mielle Rosemary Mint Strengthening Shampoo",
    "sku": "MI-RM-ST-591",
    "color": "Dark Green",
    "size": "591ml",
    "weight": "620g",
    "material": "Liquid"
  },
  {
    "name": "Mielle Pomegranate & Honey Detangling Shampoo",
    "sku": "MI-PH-DT-355",
    "color": "Pink",
    "size": "355ml",
    "weight": "390g",
    "material": "Liquid"
  },
  {
    "name": "Mielle Rice Water Hydrating Shampoo",
    "sku": "MI-RW-HY-355",
    "color": "White",
    "size": "355ml",
    "weight": "385g",
    "material": "Liquid"
  }
];

const companyProductId = '_2e5E60FiW';

async function updateVariants() {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    console.log(`Starting variant update for product: ${companyProductId}`);
    
    // Check if it's a company product or system product
    const [companyProducts] = await connection.execute(
      'SELECT * FROM company_products WHERE id = ?',
      [companyProductId]
    );
    
    let systemProductId;
    let isCompanyProduct = false;
    
    if (companyProducts.length > 0) {
      // It's a company product
      isCompanyProduct = true;
      const companyProduct = companyProducts[0];
      systemProductId = companyProduct.systemProductId;
      console.log(`Found company product. System product ID: ${systemProductId}`);
    } else {
      // Check if it's a system product
      const [systemProducts] = await connection.execute(
        'SELECT * FROM products WHERE id = ?',
        [companyProductId]
      );
      
      if (systemProducts.length === 0) {
        throw new Error(`Product with ID ${companyProductId} not found in company_products or products table`);
      }
      
      systemProductId = companyProductId;
      console.log(`Found system product. Product ID: ${systemProductId}`);
    }
    
    // Get existing company product variants (only if it's a company product)
    let existingCompanyVariants = [];
    if (isCompanyProduct) {
      existingCompanyVariants = await CompanyProductVariant.findByCompanyProductId(companyProductId);
      console.log(`Found ${existingCompanyVariants.length} existing company product variants`);
    }
    
    // Process each variant
    const createdSystemVariants = [];
    const createdCompanyVariants = [];
    
    for (const variantData of variants) {
      console.log(`\nProcessing variant: ${variantData.sku}`);
      
      // Check if system product variant exists
      const [existingSystemVariants] = await connection.execute(
        'SELECT * FROM product_variants WHERE productId = ? AND sku = ?',
        [systemProductId, variantData.sku]
      );
      
      let systemVariantId;
      
      if (existingSystemVariants.length > 0) {
        // Update existing system variant
        systemVariantId = existingSystemVariants[0].id;
        console.log(`  System variant exists (${systemVariantId}), updating...`);
        
        await connection.execute(
          `UPDATE product_variants 
           SET name = ?, color = ?, size = ?, weight = ?, material = ?, updatedAt = NOW()
           WHERE id = ?`,
          [
            variantData.name,
            variantData.color || null,
            variantData.size || null,
            variantData.weight || null,
            variantData.material || null,
            systemVariantId
          ]
        );
      } else {
        // Create new system product variant
        console.log(`  Creating new system variant...`);
        
        // Check if this will be the only variant - if so, set as default
        const [allSystemVariants] = await connection.execute(
          'SELECT COUNT(*) as count FROM product_variants WHERE productId = ?',
          [systemProductId]
        );
        const willBeOnlyVariant = allSystemVariants[0].count === 0;
        
        // If this variant is set as default, unset other defaults
        const shouldBeDefault = willBeOnlyVariant;
        if (shouldBeDefault) {
          await connection.execute(
            'UPDATE product_variants SET isDefault = FALSE WHERE productId = ?',
            [systemProductId]
          );
        }
        
        systemVariantId = nanoid(10);
        
        await connection.execute(
          `INSERT INTO product_variants (
            id, productId, name, sku,
            color, size, weight, material,
            isDefault, isActive, isVerified,
            createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            systemVariantId,
            systemProductId,
            variantData.name,
            variantData.sku,
            variantData.color || null,
            variantData.size || null,
            variantData.weight || null,
            variantData.material || null,
            shouldBeDefault,
            true, // isActive
            true  // isVerified
          ]
        );
        
        console.log(`  Created system variant: ${systemVariantId}`);
      }
      
      createdSystemVariants.push(systemVariantId);
      
      // Only create company product variants if it's a company product
      if (isCompanyProduct) {
        // Check if company product variant exists
        const [existingCompanyVariants] = await connection.execute(
          'SELECT * FROM company_product_variants WHERE companyProductId = ? AND systemProductVariantId = ?',
          [companyProductId, systemVariantId]
        );
        
        if (existingCompanyVariants.length > 0) {
          console.log(`  Company variant already exists, skipping...`);
        } else {
          // Create new company product variant
          console.log(`  Creating new company variant...`);
          
          // Check if this will be the only variant for this company product
          const [allCompanyVariants] = await connection.execute(
            'SELECT COUNT(*) as count FROM company_product_variants WHERE companyProductId = ?',
            [companyProductId]
          );
          const isOnlyVariant = allCompanyVariants[0].count === 0;
          
          // If this is the only variant, set it as default
          const shouldBeDefault = isOnlyVariant;
          if (shouldBeDefault) {
            await connection.execute(
              'UPDATE company_product_variants SET isDefault = FALSE WHERE companyProductId = ?',
              [companyProductId]
            );
          }
          
          const companyVariantId = nanoid(10);
          
          await connection.execute(
            `INSERT INTO company_product_variants (
              id, companyProductId, systemProductVariantId,
              type, isDefault, isActive, minStock, maxStock,
              createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [
              companyVariantId,
              companyProductId,
              systemVariantId,
              'sell', // type
              shouldBeDefault,
              true, // isActive
              10, // minStock
              100 // maxStock
            ]
          );
          
          console.log(`  Created company variant: ${companyVariantId}`);
          createdCompanyVariants.push(companyVariantId);
        }
      }
    }
    
    await connection.commit();
    
    console.log(`\n✅ Successfully updated variants!`);
    console.log(`   - System variants processed: ${createdSystemVariants.length}`);
    console.log(`   - Company variants created: ${createdCompanyVariants.length}`);
    
  } catch (error) {
    await connection.rollback();
    console.error('❌ Error updating variants:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// Run the script
updateVariants()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
