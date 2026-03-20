const { pool } = require('../config/database');
const { nanoid } = require('nanoid');

class CompanyWebContent {
  static async ensureTable() {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS company_web_content (
        id VARCHAR(10) PRIMARY KEY,
        companyId VARCHAR(10) NOT NULL,
        pageId VARCHAR(10) NOT NULL,
        contentElementId VARCHAR(50) NOT NULL,
        addonType VARCHAR(50) NOT NULL,
        addonData JSON NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_company (companyId),
        INDEX idx_page (pageId),
        INDEX idx_content_element (contentElementId),
        INDEX idx_company_content (companyId, contentElementId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  static async syncFromWebPageContent({ companyId, pageId, blocks }) {
    if (!companyId || !pageId) return;
    await CompanyWebContent.ensureTable();

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const normalizedBlocks = Array.isArray(blocks) ? blocks : [];
      const addonsCount = normalizedBlocks.reduce((acc, block) => {
        const addons = Array.isArray(block?.addons) ? block.addons : [];
        return acc + addons.length;
      }, 0);

      await connection.execute(
        'DELETE FROM company_web_content WHERE companyId = ? AND pageId = ?',
        [companyId, pageId]
      );

      for (const block of normalizedBlocks) {
        const contentElementId = block?.id;
        if (!contentElementId) continue;
        const addons = Array.isArray(block?.addons) ? block.addons : [];

        for (const addon of addons) {
          const addonType = addon?.type || 'unknown';
          const addonData = {
            ...(addon?.data || {}),
            companyId,
            contentElementId,
          };

          await connection.execute(
            `INSERT INTO company_web_content (
              id, companyId, pageId, contentElementId, addonType, addonData
            ) VALUES (?, ?, ?, ?, ?, ?)`,
            [
              nanoid(10),
              companyId,
              pageId,
              contentElementId,
              addonType,
              JSON.stringify(addonData),
            ]
          );
        }
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw new Error(`Error syncing company web content: ${error.message}`);
    } finally {
      connection.release();
    }
  }
}

module.exports = CompanyWebContent;
