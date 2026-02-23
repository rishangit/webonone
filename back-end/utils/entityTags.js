const { pool } = require('../config/database');
const { nanoid } = require('nanoid');
const { EntityType } = require('../constants/entityType');
const Tag = require('../models/Tag');

/**
 * Unified Entity Tags Utility
 * 
 * This utility provides a centralized way to manage tags for all entity types
 * using the new entity_tags table. It maintains backward compatibility by
 * also updating the old tag tables during the transition period.
 * 
 * Usage:
 *   const { getEntityTags, setEntityTags } = require('../utils/entityTags');
 *   const tags = await getEntityTags(EntityType.PRODUCT, productId);
 *   await setEntityTags(EntityType.PRODUCT, productId, tagIds);
 */

/**
 * Get tags for a specific entity
 * @param {string} entityType - The entity type (from EntityType enum)
 * @param {string} entityId - The entity ID
 * @returns {Promise<Array>} Array of tag objects
 */
const getEntityTags = async (entityType, entityId) => {
  try {
    const [rows] = await pool.execute(
      `SELECT t.* FROM tags t
       INNER JOIN entity_tags et ON t.id = et.tagId
       WHERE et.entityType = ? AND et.entityId = ?
       ORDER BY t.name`,
      [entityType, entityId]
    );
    return rows;
  } catch (error) {
    throw new Error(`Error getting entity tags: ${error.message}`);
  }
};

/**
 * Set tags for a specific entity
 * This method replaces all existing tags with the new ones
 * @param {string} entityType - The entity type (from EntityType enum)
 * @param {string} entityId - The entity ID
 * @param {Array<string>} tagIds - Array of tag IDs to set
 * @param {Object} connection - Optional database connection (for transactions)
 * @returns {Promise<Object>} Object with oldTagIds and newTagIds for usage count updates
 */
const setEntityTags = async (entityType, entityId, tagIds, connection = null) => {
  const useExternalConnection = connection !== null;
  const conn = connection || await pool.getConnection();
  
  try {
    if (!useExternalConnection) {
      await conn.beginTransaction();
    }
    
    // Get old tags for usage count decrement (before deleting)
    const [oldTags] = await conn.execute(
      'SELECT tagId FROM entity_tags WHERE entityType = ? AND entityId = ?',
      [entityType, entityId]
    );
    
    const oldTagIds = oldTags.map(t => t.tagId);
    
    // Remove existing tags
    await conn.execute(
      'DELETE FROM entity_tags WHERE entityType = ? AND entityId = ?',
      [entityType, entityId]
    );
    
    // Add new tags
    if (tagIds && tagIds.length > 0) {
      const values = tagIds.map(tagId => [nanoid(10), entityType, entityId, tagId]);
      const placeholders = values.map(() => '(?, ?, ?, ?)').join(', ');
      
      await conn.execute(
        `INSERT INTO entity_tags (id, entityType, entityId, tagId) VALUES ${placeholders}`,
        values.flat()
      );
    }
    
    if (!useExternalConnection) {
      await conn.commit();
    }
    
    // Return old and new tag IDs for async usage count update
    return { oldTagIds, newTagIds: tagIds || [] };
  } catch (error) {
    if (!useExternalConnection) {
      await conn.rollback();
    }
    throw new Error(`Error setting entity tags: ${error.message}`);
  } finally {
    if (!useExternalConnection) {
      conn.release();
    }
  }
};

/**
 * Add tags to an entity (without removing existing ones)
 * @param {string} entityType - The entity type (from EntityType enum)
 * @param {string} entityId - The entity ID
 * @param {Array<string>} tagIds - Array of tag IDs to add
 * @param {Object} connection - Optional database connection (for transactions)
 * @returns {Promise<void>}
 */
const addEntityTags = async (entityType, entityId, tagIds, connection = null) => {
  const useExternalConnection = connection !== null;
  const conn = connection || await pool.getConnection();
  
  try {
    if (!useExternalConnection) {
      await conn.beginTransaction();
    }
    
    if (tagIds && tagIds.length > 0) {
      // Get existing tags to avoid duplicates
      const [existing] = await conn.execute(
        'SELECT tagId FROM entity_tags WHERE entityType = ? AND entityId = ?',
        [entityType, entityId]
      );
      
      const existingTagIds = existing.map(t => t.tagId);
      const newTagIds = tagIds.filter(tagId => !existingTagIds.includes(tagId));
      
      if (newTagIds.length > 0) {
        const values = newTagIds.map(tagId => [nanoid(10), entityType, entityId, tagId]);
        const placeholders = values.map(() => '(?, ?, ?, ?)').join(', ');
        
        await conn.execute(
          `INSERT INTO entity_tags (id, entityType, entityId, tagId) VALUES ${placeholders}`,
          values.flat()
        );
      }
    }
    
    if (!useExternalConnection) {
      await conn.commit();
    }
  } catch (error) {
    if (!useExternalConnection) {
      await conn.rollback();
    }
    throw new Error(`Error adding entity tags: ${error.message}`);
  } finally {
    if (!useExternalConnection) {
      conn.release();
    }
  }
};

/**
 * Remove tags from an entity
 * @param {string} entityType - The entity type (from EntityType enum)
 * @param {string} entityId - The entity ID
 * @param {Array<string>} tagIds - Array of tag IDs to remove
 * @param {Object} connection - Optional database connection (for transactions)
 * @returns {Promise<void>}
 */
const removeEntityTags = async (entityType, entityId, tagIds, connection = null) => {
  const useExternalConnection = connection !== null;
  const conn = connection || await pool.getConnection();
  
  try {
    if (!useExternalConnection) {
      await conn.beginTransaction();
    }
    
    if (tagIds && tagIds.length > 0) {
      const placeholders = tagIds.map(() => '?').join(', ');
      await conn.execute(
        `DELETE FROM entity_tags WHERE entityType = ? AND entityId = ? AND tagId IN (${placeholders})`,
        [entityType, entityId, ...tagIds]
      );
    }
    
    if (!useExternalConnection) {
      await conn.commit();
    }
  } catch (error) {
    if (!useExternalConnection) {
      await conn.rollback();
    }
    throw new Error(`Error removing entity tags: ${error.message}`);
  } finally {
    if (!useExternalConnection) {
      conn.release();
    }
  }
};

/**
 * Update tag usage counts asynchronously (non-blocking)
 * This should be called after setEntityTags to update tag.usageCount
 * @param {Array<string>} oldTagIds - Array of old tag IDs
 * @param {Array<string>} newTagIds - Array of new tag IDs
 * @returns {Promise<void>}
 */
const updateTagUsageCounts = async (oldTagIds, newTagIds) => {
  try {
    // Decrement usage count for removed tags
    for (const oldTagId of oldTagIds) {
      if (!newTagIds || !newTagIds.includes(oldTagId)) {
        await Tag.decrementUsageCount(oldTagId);
      }
    }
    
    // Increment usage count for new tags
    if (newTagIds && newTagIds.length > 0) {
      for (const tagId of newTagIds) {
        if (!oldTagIds.includes(tagId)) {
          await Tag.incrementUsageCount(tagId);
        }
      }
    }
  } catch (error) {
    // Non-critical error - log but don't fail
    console.error(`Error updating tag usage counts (non-critical):`, error.message);
  }
};

module.exports = {
  getEntityTags,
  setEntityTags,
  addEntityTags,
  removeEntityTags,
  updateTagUsageCounts
};
