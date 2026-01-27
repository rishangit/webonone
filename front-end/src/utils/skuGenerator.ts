/**
 * Generates a user-readable SKU from variant details
 * Format: {PRODUCT_PREFIX}-{VARIANT_NAME_SHORT}-{COLOR}-{SIZE}
 * Example: PRD-SHP-DRY-GOLD-500ML
 */
export const generateVariantSKU = (
  productName: string,
  productSKU?: string,
  variant: {
    name?: string;
    color?: string;
    size?: string;
    sizeUnit?: string;
  } = {}
): string => {
  // Get base prefix from product SKU or product name
  let basePrefix = 'PRD';
  if (productSKU) {
    // Extract prefix from SKU (e.g., "PRD-ABC123" -> "PRD")
    const skuParts = productSKU.split('-');
    basePrefix = skuParts[0] || 'PRD';
  } else if (productName) {
    // Generate prefix from product name (first 3-4 letters, uppercase)
    const words = productName.trim().split(/\s+/);
    if (words.length > 0) {
      basePrefix = words[0].substring(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (basePrefix.length < 3) {
        basePrefix = productName.substring(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, '') || 'PRD';
      }
    }
  }

  // Extract key words from variant name
  let variantCode = '';
  if (variant.name) {
    const nameWords = variant.name
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 1) // Filter out single character words
      .slice(0, 3); // Take first 3 meaningful words
    
    if (nameWords.length > 0) {
      variantCode = nameWords
        .map(word => {
          // Take first 3-4 letters of each word, uppercase
          const code = word.substring(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, '');
          return code;
        })
        .filter(code => code.length > 0) // Remove empty codes
        .join('-')
        .substring(0, 12); // Limit total length
    }
    
    // Fallback: if no good words found, use first 6 characters of variant name
    if (!variantCode || variantCode.length < 2) {
      variantCode = variant.name
        .substring(0, 6)
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '') || 'VAR';
    }
  } else {
    variantCode = 'VAR';
  }

  // Add color code (first 3-4 letters, uppercase)
  // Skip if color is the same as variant name to avoid duplication
  let colorCode = '';
  if (variant.color && variant.color.trim()) {
    const colorLower = variant.color.trim().toLowerCase();
    const variantNameLower = variant.name?.trim().toLowerCase() || '';
    
    // Only add color if it's different from variant name
    if (colorLower !== variantNameLower) {
      colorCode = variant.color
        .trim()
        .substring(0, 4)
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '');
    }
  }

  // Add size code
  let sizeCode = '';
  if (variant.size && variant.size.trim()) {
    const sizeValue = variant.size.trim();
    const sizeUnit = variant.sizeUnit || '';
    // Combine size and unit (e.g., "500ml" -> "500ML")
    sizeCode = `${sizeValue}${sizeUnit.toUpperCase()}`.replace(/[^A-Z0-9]/g, '').substring(0, 8);
  }

  // Build SKU parts
  const parts = [basePrefix, variantCode];
  if (colorCode) parts.push(colorCode);
  if (sizeCode) parts.push(sizeCode);

  // Join and ensure max length of 50 characters
  let sku = parts.join('-');
  if (sku.length > 50) {
    sku = sku.substring(0, 50);
  }

  return sku;
};

