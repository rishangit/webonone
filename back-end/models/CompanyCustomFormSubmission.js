const { pool } = require('../config/database');
const { nanoid } = require('nanoid');

function parseValues(raw) {
  if (!raw) return {};
  try {
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    return {};
  }
}

/** Avoid utf8mb4_unicode_ci vs utf8mb4_0900_ai_ci mix on VARCHAR id columns. */
const JOIN_FORMS =
  'LEFT JOIN company_custom_forms f ON BINARY f.id = BINARY s.formId';
const JOIN_USERS =
  'LEFT JOIN users u ON BINARY u.id = BINARY s.submittedByUserId';

class CompanyCustomFormSubmission {
  constructor(data) {
    this.id = data.id;
    this.companyId = data.companyId;
    this.formId = data.formId;
    this.appointmentId = data.appointmentId ?? null;
    this.clientId = data.clientId ?? null;
    this.submittedByUserId = data.submittedByUserId ?? null;
    this.values = parseValues(data.values);
    this.createdAt = data.createdAt;
    this.formName = data.formName ?? null;
    this.submittedByName = data.submittedByName ?? null;
  }

  toJSON() {
    return {
      id: this.id,
      companyId: this.companyId,
      formId: this.formId,
      appointmentId: this.appointmentId,
      clientId: this.clientId,
      submittedByUserId: this.submittedByUserId,
      values: this.values,
      createdAt: this.createdAt,
      formName: this.formName,
      submittedByName: this.submittedByName,
    };
  }

  static async create(data) {
    const id = nanoid(10);
    const valuesJson = JSON.stringify(data.values ?? {});
    await pool.execute(
      `INSERT INTO company_custom_form_submissions (
        id, companyId, formId, appointmentId, clientId, submittedByUserId, \`values\`
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.companyId,
        data.formId,
        data.appointmentId ?? null,
        data.clientId ?? null,
        data.submittedByUserId ?? null,
        valuesJson,
      ]
    );
    return CompanyCustomFormSubmission.findById(id);
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT s.id, s.companyId, s.formId, s.appointmentId, s.clientId,
              s.submittedByUserId, s.\`values\`, s.createdAt,
              f.name AS formName,
              CONCAT(COALESCE(u.firstName, ''), ' ', COALESCE(u.lastName, '')) AS submittedByName
       FROM company_custom_form_submissions s
       ${JOIN_FORMS}
       ${JOIN_USERS}
       WHERE BINARY s.id = BINARY ?`,
      [id]
    );
    if (rows.length === 0) return null;
    const row = rows[0];
    if (row.submittedByName) {
      row.submittedByName = row.submittedByName.trim() || null;
    }
    return new CompanyCustomFormSubmission(row);
  }

  static async findByAppointmentId(appointmentId, companyId) {
    let query = `
      SELECT s.id, s.companyId, s.formId, s.appointmentId, s.clientId,
             s.submittedByUserId, s.\`values\`, s.createdAt,
             f.name AS formName,
             CONCAT(COALESCE(u.firstName, ''), ' ', COALESCE(u.lastName, '')) AS submittedByName
      FROM company_custom_form_submissions s
      ${JOIN_FORMS}
      ${JOIN_USERS}
      WHERE BINARY s.appointmentId = BINARY ?
    `;
    const params = [appointmentId];
    if (companyId) {
      query += ' AND BINARY s.companyId = BINARY ?';
      params.push(companyId);
    }
    query += ' ORDER BY s.createdAt DESC';
    const [rows] = await pool.execute(query, params);
    return rows.map((row) => {
      if (row.submittedByName) {
        row.submittedByName = row.submittedByName.trim() || null;
      }
      return new CompanyCustomFormSubmission(row);
    });
  }

  static async delete(id) {
    const [result] = await pool.execute(
      'DELETE FROM company_custom_form_submissions WHERE BINARY id = BINARY ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = CompanyCustomFormSubmission;
