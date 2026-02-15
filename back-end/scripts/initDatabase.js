const { pool } = require('../config/database');

const createTables = async () => {
  try {
    console.log('Creating database tables...');

    // Users table (role column removed - use users_role table instead)
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(10) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        firstName VARCHAR(100) NOT NULL,
        lastName VARCHAR(100) NOT NULL,
        avatar TEXT,
        -- companyId removed - now stored in users_role table
        phone VARCHAR(20),
        address TEXT,
        dateOfBirth DATE,
        preferences JSON,
        -- permissions removed - now using role-based access control
        isActive BOOLEAN DEFAULT TRUE,
        isVerified BOOLEAN DEFAULT FALSE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        lastLogin TIMESTAMP NULL,
        -- appointmentsCount, totalSpent, joinDate, emergencyContact removed
        INDEX idx_email (email),
        INDEX idx_active (isActive)
      )
    `);

    // Note: categories and subcategories tables have been removed
    // All category data is now stored in company_categories table

    // Services table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS services (
        id VARCHAR(10) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        duration INT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        category VARCHAR(100),
        subcategory VARCHAR(100),
        status ENUM('Active', 'Inactive', 'Suspended') DEFAULT 'Active',
        companyId VARCHAR(10) NOT NULL,
        provider JSON,
        bookings JSON,
        tags JSON,
        image TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_company (companyId),
        INDEX idx_category (category),
        INDEX idx_status (status)
      )
    `);

    // Appointments table - using only IDs, duplicate data fields are nullable for backward compatibility
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS appointments (
        id VARCHAR(10) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        clientId VARCHAR(10) NOT NULL,
        -- Removed duplicate data fields: clientName, clientEmail, clientPhone (use clientId to fetch from users table)
        clientName VARCHAR(255) DEFAULT NULL,
        clientEmail VARCHAR(255) DEFAULT NULL,
        clientPhone VARCHAR(50) DEFAULT NULL,
        companyId VARCHAR(10) NOT NULL,
        -- Removed duplicate data field: companyName (use companyId to fetch from companies table)
        companyName VARCHAR(255) DEFAULT NULL,
        serviceId VARCHAR(10) DEFAULT NULL,
        -- Removed duplicate data field: serviceName (use serviceId to fetch from company_services table)
        serviceName VARCHAR(255) DEFAULT NULL,
        providerId VARCHAR(10) DEFAULT NULL,
        -- Removed duplicate data field: providerName (use providerId to fetch from company_staff table)
        providerName VARCHAR(255) DEFAULT NULL,
        spaceId VARCHAR(10) DEFAULT NULL,
        -- Removed duplicate data field: spaceName (use spaceId to fetch from company_spaces table)
        spaceName VARCHAR(255) DEFAULT NULL,
        date DATE NOT NULL,
        time TIME NOT NULL,
        duration INT NOT NULL,
        status ENUM('Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'No Show') DEFAULT 'Pending',
        type ENUM('Regular', 'Consultation', 'Follow-up', 'Emergency') DEFAULT 'Regular',
        priority ENUM('Low', 'Medium', 'High', 'Urgent') DEFAULT 'Medium',
        price DECIMAL(10,2) DEFAULT 0,
        paymentStatus ENUM('Pending', 'Paid', 'Partially Paid', 'Refunded') DEFAULT 'Pending',
        paymentMethod VARCHAR(50) DEFAULT NULL,
        notes TEXT,
        reminderSent BOOLEAN DEFAULT FALSE,
        preferredStaffIds JSON DEFAULT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_client (clientId),
        INDEX idx_company (companyId),
        INDEX idx_provider (providerId),
        INDEX idx_service (serviceId),
        INDEX idx_space (spaceId),
        INDEX idx_date (date),
        INDEX idx_status (status),
        INDEX idx_date_time (date, time),
        FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE,
        FOREIGN KEY (clientId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (serviceId) REFERENCES company_services(id) ON DELETE SET NULL,
        FOREIGN KEY (providerId) REFERENCES company_staff(id) ON DELETE SET NULL,
        FOREIGN KEY (spaceId) REFERENCES company_spaces(id) ON DELETE SET NULL
      )
    `);

    // Users Role table (for multi-role support)
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users_role (
        id VARCHAR(10) PRIMARY KEY,
        userId VARCHAR(10) NOT NULL,
        role TINYINT NOT NULL,
        companyId VARCHAR(10) DEFAULT NULL,
        isActive BOOLEAN DEFAULT TRUE,
        isDefault BOOLEAN DEFAULT FALSE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user (userId),
        INDEX idx_role (role),
        INDEX idx_company (companyId),
        INDEX idx_active (isActive),
        INDEX idx_user_company (userId, companyId),
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_role_company (userId, role, companyId)
      )
    `);

    // Companies table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS companies (
        id VARCHAR(10) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        address TEXT,
        city VARCHAR(255) DEFAULT NULL,
        state VARCHAR(255) DEFAULT NULL,
        postalCode VARCHAR(20) DEFAULT NULL,
        country VARCHAR(255) DEFAULT NULL,
        latitude DECIMAL(10, 8) DEFAULT NULL,
        longitude DECIMAL(11, 8) DEFAULT NULL,
        phone VARCHAR(20),
        email VARCHAR(255),
        website VARCHAR(255),
        companySize ENUM('1-5', '6-10', '11-20', '21-50', '51-200', '201-500', '500+') DEFAULT NULL,
        logo TEXT,
        isActive BOOLEAN DEFAULT TRUE,
        ownerId VARCHAR(10),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_owner (ownerId),
        INDEX idx_active (isActive)
      )
    `);

    // Company Users table - tracks which users are clients of which companies
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS company_users (
        id VARCHAR(10) PRIMARY KEY,
        companyId VARCHAR(10) NOT NULL,
        userId VARCHAR(10) NOT NULL,
        firstInteractionDate DATE NOT NULL,
        lastInteractionDate DATE NOT NULL,
        totalAppointments INT DEFAULT 0,
        totalSales INT DEFAULT 0,
        totalSpent DECIMAL(10,2) DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_company (companyId),
        INDEX idx_user (userId),
        INDEX idx_company_user (companyId, userId),
        FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_company_user (companyId, userId)
      )
    `);

    // Spaces table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS spaces (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        type VARCHAR(100),
        capacity INT,
        companyId VARCHAR(10) NOT NULL,
        isActive BOOLEAN DEFAULT TRUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_company (companyId),
        INDEX idx_active (isActive)
      )
    `);

    // Notifications table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(10) PRIMARY KEY,
        userId VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
        isRead BOOLEAN DEFAULT FALSE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user (userId),
        INDEX idx_read (isRead),
        INDEX idx_created (createdAt)
      )
    `);

    // Sales table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS sales (
        id VARCHAR(10) PRIMARY KEY,
        appointmentId VARCHAR(10),
        companyId VARCHAR(10) NOT NULL,
        serviceId VARCHAR(50),
        clientId VARCHAR(50) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        paymentMethod VARCHAR(50),
        paymentStatus ENUM('Pending', 'Paid', 'Refunded') DEFAULT 'Pending',
        saleDate DATE NOT NULL,
        items JSON,
        notes TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_appointment (appointmentId),
        INDEX idx_company (companyId),
        INDEX idx_client (clientId),
        INDEX idx_sale_date (saleDate)
      )
    `);

    // Products table (System Products)
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(10) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        imageUrl TEXT,
        isActive BOOLEAN DEFAULT TRUE,
        isVerified BOOLEAN DEFAULT FALSE,
        usageCount INT DEFAULT 0,
        createdDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        lastModified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_active (isActive),
        INDEX idx_verified (isVerified)
      )
    `);

    // Product Variants table (for system product variants - no price/stock)
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS product_variants (
        id VARCHAR(10) PRIMARY KEY,
        productId VARCHAR(10) NOT NULL,
        name VARCHAR(255) NOT NULL,
        sku VARCHAR(100) NOT NULL,
        color VARCHAR(50),
        size VARCHAR(50),
        weight VARCHAR(50),
        material VARCHAR(255),
        isDefault BOOLEAN DEFAULT FALSE,
        isActive BOOLEAN DEFAULT TRUE,
        isVerified BOOLEAN DEFAULT FALSE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_product_sku (productId, sku),
        INDEX idx_product (productId),
        INDEX idx_sku (sku),
        INDEX idx_default (isDefault),
        INDEX idx_verified (isVerified),
        FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);

    // Tags table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tags (
        id VARCHAR(10) PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        color VARCHAR(7) DEFAULT '#3B82F6',
        icon VARCHAR(10),
        isActive BOOLEAN DEFAULT TRUE,
        usageCount INT DEFAULT 0,
        createdDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        lastModified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (name),
        INDEX idx_active (isActive),
        INDEX idx_usage (usageCount)
      )
    `);

    // Company Tags junction table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS company_tags (
        id VARCHAR(10) PRIMARY KEY,
        companyId VARCHAR(10) NOT NULL,
        tagId VARCHAR(10) NOT NULL,
        createdDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_company_tag (companyId, tagId),
        INDEX idx_company (companyId),
        INDEX idx_tag (tagId),
        FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE,
        FOREIGN KEY (tagId) REFERENCES tags(id) ON DELETE CASCADE
      )
    `);

    // Product Tags junction table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS product_tags (
        id VARCHAR(10) PRIMARY KEY,
        productId VARCHAR(10) NOT NULL,
        tagId VARCHAR(10) NOT NULL,
        createdDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_product_tag (productId, tagId),
        INDEX idx_product (productId),
        INDEX idx_tag (tagId),
        FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (tagId) REFERENCES tags(id) ON DELETE CASCADE
      )
    `);

    // Product Attributes table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS product_attributes (
        id VARCHAR(10) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        valueDataType ENUM('text', 'number', 'boolean', 'date', 'json') DEFAULT 'text',
        unit_of_measure VARCHAR(10),
        isActive BOOLEAN DEFAULT TRUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_active (isActive),
        INDEX idx_unit_of_measure (unit_of_measure),
        FOREIGN KEY (unit_of_measure) REFERENCES units_of_measure(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);

    // Product Related Attributes junction table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS product_related_attributes (
        id VARCHAR(10) PRIMARY KEY,
        productId VARCHAR(10) NOT NULL,
        attributeId VARCHAR(10) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_product_attribute (productId, attributeId),
        INDEX idx_product (productId),
        INDEX idx_attribute (attributeId),
        FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (attributeId) REFERENCES product_attributes(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);

    // Product Related Attributes Values table (stores attribute values for variants)
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS product_related_attributes_values (
        id VARCHAR(10) PRIMARY KEY,
        variantId VARCHAR(10) NOT NULL,
        productRelatedAttributeId VARCHAR(10) NOT NULL,
        attributeValue TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_variant_attribute (variantId, productRelatedAttributeId),
        INDEX idx_variant (variantId),
        INDEX idx_product_related_attribute (productRelatedAttributeId),
        FOREIGN KEY (variantId) REFERENCES product_variants(id) ON DELETE CASCADE,
        FOREIGN KEY (productRelatedAttributeId) REFERENCES product_related_attributes(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);

    // Company Products table (only company-specific data, system product data comes from products table)
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS company_products (
        id VARCHAR(10) PRIMARY KEY,
        companyId VARCHAR(10) NOT NULL,
        systemProductId VARCHAR(10) NOT NULL,
        type ENUM('sell', 'service', 'both') DEFAULT 'service',
        costPrice DECIMAL(10,2) DEFAULT 0,
        sellPrice DECIMAL(10,2),
        margin DECIMAL(10,2),
        currentStock INT DEFAULT 0,
        minStock INT DEFAULT 10,
        maxStock INT DEFAULT 100,
        stockUnit VARCHAR(50) DEFAULT 'pieces',
        isAvailableForPurchase BOOLEAN DEFAULT FALSE,
        notes TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_company_system_product (companyId, systemProductId),
        INDEX idx_company (companyId),
        INDEX idx_system_product (systemProductId),
        FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE,
        FOREIGN KEY (systemProductId) REFERENCES products(id) ON DELETE CASCADE
      )
    `);

    // Company Product Tags junction table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS company_product_tags (
        id VARCHAR(10) PRIMARY KEY,
        companyProductId VARCHAR(10) NOT NULL,
        tagId VARCHAR(10) NOT NULL,
        createdDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_company_product_tag (companyProductId, tagId),
        INDEX idx_company_product (companyProductId),
        INDEX idx_tag (tagId),
        FOREIGN KEY (companyProductId) REFERENCES company_products(id) ON DELETE CASCADE,
        FOREIGN KEY (tagId) REFERENCES tags(id) ON DELETE CASCADE
      )
    `);

    // Company Appointments table - using only IDs, duplicate data fields are nullable
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS company_appointments (
        id VARCHAR(10) PRIMARY KEY,
        clientId VARCHAR(10) NOT NULL,
        -- Removed duplicate data fields: clientName, clientEmail, clientPhone (use clientId to fetch from users table)
        clientName VARCHAR(255) DEFAULT NULL,
        clientEmail VARCHAR(255) DEFAULT NULL,
        clientPhone VARCHAR(50) DEFAULT NULL,
        companyId VARCHAR(10) NOT NULL,
        -- Removed duplicate data field: companyName (use companyId to fetch from companies table)
        companyName VARCHAR(255) DEFAULT NULL,
        serviceId VARCHAR(10) DEFAULT NULL,
        -- Removed duplicate data field: serviceName (use serviceId to fetch from company_services table)
        serviceName VARCHAR(255) DEFAULT NULL,
        providerId VARCHAR(10) DEFAULT NULL,
        -- Removed duplicate data field: providerName (use providerId to fetch from company_staff table)
        providerName VARCHAR(255) DEFAULT NULL,
        spaceId VARCHAR(10) DEFAULT NULL,
        -- Removed duplicate data field: spaceName (use spaceId to fetch from company_spaces table)
        spaceName VARCHAR(255) DEFAULT NULL,
        date DATE NOT NULL,
        time TIME NOT NULL,
        duration INT NOT NULL,
        status ENUM('Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'No Show') DEFAULT 'Pending',
        type ENUM('Regular', 'Consultation', 'Follow-up', 'Emergency') DEFAULT 'Regular',
        priority ENUM('Low', 'Medium', 'High', 'Urgent') DEFAULT 'Medium',
        price DECIMAL(10, 2) DEFAULT 0,
        paymentStatus ENUM('Pending', 'Paid', 'Partially Paid', 'Refunded') DEFAULT 'Pending',
        paymentMethod VARCHAR(50) DEFAULT NULL,
        notes TEXT,
        reminderSent BOOLEAN DEFAULT FALSE,
        preferredStaffIds JSON DEFAULT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_company (companyId),
        INDEX idx_client (clientId),
        INDEX idx_provider (providerId),
        INDEX idx_service (serviceId),
        INDEX idx_space (spaceId),
        INDEX idx_date (date),
        INDEX idx_status (status),
        INDEX idx_date_time (date, time),
        FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE,
        FOREIGN KEY (clientId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (serviceId) REFERENCES company_services(id) ON DELETE SET NULL,
        FOREIGN KEY (providerId) REFERENCES company_staff(id) ON DELETE SET NULL,
        FOREIGN KEY (spaceId) REFERENCES company_spaces(id) ON DELETE SET NULL
      )
    `);

    console.log('✅ Database tables created successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    throw error;
  }
};

const dropTables = async () => {
  try {
    console.log('Dropping database tables...');
    
    const tables = [
      'product_tags', 'company_tags', 'tags',
      'products', 'sales', 'notifications', 'appointments', 'company_appointments', 'services', 
      'spaces', 'companies', 'company_categories', 'product_categories', 'users'
    ];

    for (const table of tables) {
      await pool.execute(`DROP TABLE IF EXISTS ${table}`);
    }

    console.log('✅ Database tables dropped successfully');
  } catch (error) {
    console.error('❌ Error dropping tables:', error.message);
    throw error;
  }
};

module.exports = {
  createTables,
  dropTables
};

