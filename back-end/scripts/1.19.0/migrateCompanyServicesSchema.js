const { nanoid } = require('nanoid');

function toImages(raw) {
  if (raw == null || raw === '') return [];
  if (Array.isArray(raw)) return raw.filter(Boolean).map(String);
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter(Boolean).map(String) : [];
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Migrates service model to:
 * - system services in `services`
 * - company references in `company_services.systemServiceId`
 * - company-level operational fields in `company_services` (duration/price/status/defaultProducts)
 *
 * Safe to run multiple times (idempotent).
 */
async function migrateCompanyServicesSchema(pool) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS services (
        id VARCHAR(10) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT NULL,
        images JSON NULL,
        isActive BOOLEAN DEFAULT TRUE,
        isVerified BOOLEAN DEFAULT TRUE,
        usageCount INT DEFAULT 0,
        defaultDuration INT NULL,
        defaultPrice DECIMAL(10,2) NULL,
        createdDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        lastModified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_services_name (name),
        INDEX idx_services_active (isActive)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    const [servicesColumnsRows] = await connection.execute(`
      SELECT COLUMN_NAME
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'services'
    `);
    const serviceCols = new Set(servicesColumnsRows.map((r) => r.COLUMN_NAME));

    const ensureServicesColumn = async (name, ddl) => {
      if (!serviceCols.has(name)) {
        await connection.execute(`ALTER TABLE services ADD COLUMN ${ddl}`);
        serviceCols.add(name);
        console.log(`✅ Added services.${name}`);
      }
    };

    await ensureServicesColumn('images', 'images JSON NULL');
    await ensureServicesColumn('isActive', 'isActive BOOLEAN DEFAULT TRUE');
    await ensureServicesColumn('isVerified', 'isVerified BOOLEAN DEFAULT TRUE');
    await ensureServicesColumn('usageCount', 'usageCount INT DEFAULT 0');
    await ensureServicesColumn('defaultDuration', 'defaultDuration INT NULL');
    await ensureServicesColumn('defaultPrice', 'defaultPrice DECIMAL(10,2) NULL');
    await ensureServicesColumn('createdDate', 'createdDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
    await ensureServicesColumn('lastModified', 'lastModified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

    // Backfill services.images from old columns if present
    if (serviceCols.has('image') || serviceCols.has('imageUrl')) {
      const selectPieces = ['id', 'images'];
      if (serviceCols.has('image')) selectPieces.push('image');
      if (serviceCols.has('imageUrl')) selectPieces.push('imageUrl');
      const [legacyServiceRows] = await connection.execute(`SELECT ${selectPieces.join(', ')} FROM services`);
      for (const row of legacyServiceRows) {
        const existingImages = toImages(row.images);
        if (existingImages.length > 0) continue;
        const first = row.image || row.imageUrl;
        if (first) {
          await connection.execute('UPDATE services SET images = ? WHERE id = ?', [JSON.stringify([String(first)]), row.id]);
        }
      }
      console.log('✅ Backfilled services.images from legacy image/imageUrl');
    }

    const [companyTableCheck] = await connection.execute(`
      SELECT TABLE_NAME
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'company_services'
    `);

    if (companyTableCheck.length === 0) {
      await connection.execute(`
        CREATE TABLE company_services (
          id VARCHAR(10) PRIMARY KEY,
          companyId VARCHAR(10) NOT NULL,
          systemServiceId VARCHAR(10) NOT NULL,
          duration INT NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          status ENUM('Active', 'Inactive', 'Draft') DEFAULT 'Active',
          defaultProducts JSON NULL,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_company_services_company (companyId),
          INDEX idx_company_services_system (systemServiceId),
          INDEX idx_company_services_status (status),
          FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE,
          FOREIGN KEY (systemServiceId) REFERENCES services(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ Created company_services table (system reference schema)');
      await connection.commit();
      return;
    }

    const [companyColsRows] = await connection.execute(`
      SELECT COLUMN_NAME
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'company_services'
    `);
    const companyCols = new Set(companyColsRows.map((r) => r.COLUMN_NAME));

    const ensureCompanyColumn = async (name, ddl) => {
      if (!companyCols.has(name)) {
        await connection.execute(`ALTER TABLE company_services ADD COLUMN ${ddl}`);
        companyCols.add(name);
        console.log(`✅ Added company_services.${name}`);
      }
    };

    await ensureCompanyColumn('systemServiceId', 'systemServiceId VARCHAR(10) NULL');
    await ensureCompanyColumn('defaultProducts', 'defaultProducts JSON NULL');
    await ensureCompanyColumn('status', "status ENUM('Active', 'Inactive', 'Draft') DEFAULT 'Active'");
    await ensureCompanyColumn('duration', 'duration INT NULL');
    await ensureCompanyColumn('price', 'price DECIMAL(10,2) NULL');
    await ensureCompanyColumn('name', 'name VARCHAR(255) NULL');
    await ensureCompanyColumn('description', 'description TEXT NULL');
    await ensureCompanyColumn('images', 'images JSON NULL');

    // Migrate existing company service records to reference system services.
    const selectCols = ['id', 'companyId', 'systemServiceId', 'duration', 'price', 'status'];
    if (companyCols.has('name')) selectCols.push('name');
    if (companyCols.has('description')) selectCols.push('description');
    if (companyCols.has('images')) selectCols.push('images');
    if (companyCols.has('imageUrl')) selectCols.push('imageUrl');
    if (companyCols.has('galleryImages')) selectCols.push('galleryImages');
    const [companyRows] = await connection.execute(`SELECT ${selectCols.join(', ')} FROM company_services`);

    const [existingServicesRows] = await connection.execute(`SELECT id, name FROM services`);
    const byNormalizedName = new Map(
      existingServicesRows
        .filter((r) => r.name)
        .map((r) => [String(r.name).trim().toLowerCase(), r.id])
    );

    for (const row of companyRows) {
      if (row.systemServiceId) continue;

      const name = String(row.name || '').trim() || `Service ${row.id}`;
      const normalized = name.toLowerCase();
      let serviceId = byNormalizedName.get(normalized) || null;

      if (!serviceId) {
        const images = [];
        for (const img of toImages(row.images)) {
          if (!images.includes(img)) images.push(img);
        }
        if (row.imageUrl && !images.includes(String(row.imageUrl))) images.push(String(row.imageUrl));
        for (const img of toImages(row.galleryImages)) {
          if (!images.includes(img)) images.push(img);
        }

        serviceId = nanoid(10);
        await connection.execute(
          `
          INSERT INTO services (
            id, name, description, images, isActive, isVerified, usageCount, defaultDuration, defaultPrice
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
          [
            serviceId,
            name,
            row.description || null,
            images.length > 0 ? JSON.stringify(images) : null,
            true,
            true,
            0,
            row.duration == null ? null : Number(row.duration),
            row.price == null ? null : Number(row.price),
          ]
        );
        byNormalizedName.set(normalized, serviceId);
      }

      await connection.execute('UPDATE company_services SET systemServiceId = ? WHERE id = ?', [serviceId, row.id]);
      await connection.execute('UPDATE services SET usageCount = COALESCE(usageCount, 0) + 1 WHERE id = ?', [serviceId]);
    }
    console.log('✅ Migrated company_services to services references');

    // Migrate service tags from company service ids to system service ids.
    const [tagRows] = await connection.execute(`
      SELECT et.id, et.entityId, et.tagId, cs.systemServiceId
      FROM entity_tags et
      INNER JOIN company_services cs ON cs.id = et.entityId
      WHERE et.entityType = 'service'
        AND cs.systemServiceId IS NOT NULL
    `);
    for (const row of tagRows) {
      const [exists] = await connection.execute(
        `SELECT id FROM entity_tags WHERE entityType = 'service' AND entityId = ? AND tagId = ? LIMIT 1`,
        [row.systemServiceId, row.tagId]
      );
      if (exists.length === 0) {
        await connection.execute(
          `INSERT INTO entity_tags (id, entityType, entityId, tagId) VALUES (?, 'service', ?, ?)`,
          [nanoid(10), row.systemServiceId, row.tagId]
        );
      }
      await connection.execute(`DELETE FROM entity_tags WHERE id = ?`, [row.id]);
    }
    console.log('✅ Migrated service tags to system service entities');

    // Normalize id column definitions so FK creation is compatible across existing databases.
    const [[servicesMaxIdLen]] = await connection.execute(`SELECT MAX(CHAR_LENGTH(id)) AS maxLen FROM services`);
    if ((servicesMaxIdLen?.maxLen || 0) <= 10) {
      await connection.execute(`
        ALTER TABLE services
        MODIFY COLUMN id VARCHAR(10)
        CHARACTER SET utf8mb4
        COLLATE utf8mb4_unicode_ci
        NOT NULL
      `);
    } else {
      console.warn('⚠️ Skipped services.id normalization (found id length > 10)');
    }

    const [[companyServiceMaxSystemIdLen]] = await connection.execute(`
      SELECT MAX(CHAR_LENGTH(systemServiceId)) AS maxLen
      FROM company_services
      WHERE systemServiceId IS NOT NULL
    `);
    if ((companyServiceMaxSystemIdLen?.maxLen || 0) <= 10) {
      await connection.execute(`
        ALTER TABLE company_services
        MODIFY COLUMN systemServiceId VARCHAR(10)
        CHARACTER SET utf8mb4
        COLLATE utf8mb4_unicode_ci
        NULL
      `);
    } else {
      console.warn('⚠️ Skipped company_services.systemServiceId normalization (found id length > 10)');
    }

    // Add FK after backfill
    const [fkRows] = await connection.execute(`
      SELECT CONSTRAINT_NAME
      FROM information_schema.TABLE_CONSTRAINTS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'company_services'
        AND CONSTRAINT_TYPE = 'FOREIGN KEY'
        AND CONSTRAINT_NAME = 'fk_company_services_system_service'
    `);
    if (fkRows.length === 0) {
      try {
        await connection.execute(`
          ALTER TABLE company_services
          ADD CONSTRAINT fk_company_services_system_service
          FOREIGN KEY (systemServiceId) REFERENCES services(id) ON DELETE CASCADE
        `);
        console.log('✅ Added company_services.systemServiceId foreign key');
      } catch (fkError) {
        console.warn(`⚠️ Could not add fk_company_services_system_service: ${fkError.message}`);
      }
    }

    // Make systemServiceId required after migration.
    await connection.execute(`
      ALTER TABLE company_services
      MODIFY COLUMN systemServiceId VARCHAR(10)
      CHARACTER SET utf8mb4
      COLLATE utf8mb4_unicode_ci
      NOT NULL
    `);

    const dropIfPresent = async (columnName) => {
      const [rows] = await connection.execute(
        `
        SELECT COLUMN_NAME
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'company_services'
          AND COLUMN_NAME = ?
      `,
        [columnName]
      );
      if (rows.length > 0) {
        await connection.execute(`ALTER TABLE company_services DROP COLUMN \`${columnName}\``);
        console.log(`✅ Dropped company_services.${columnName}`);
      }
    };

    // Drop legacy duplicated company service fields that are no longer used.
    // Keep name/description/images as company override columns.
    for (const col of [
      'category',
      'subcategory',
      'categoryId',
      'subcategoryId',
      'providerName',
      'providerAvatar',
      'staffId',
      'imageUrl',
      'galleryImages',
    ]) {
      await dropIfPresent(col);
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = { migrateCompanyServicesSchema };
