const pool = require('../config/database');

const logAudit = async ({ tableName, recordId, action, oldData, newData, performedBy }) => {
  const query = `
    INSERT INTO audit_logs (table_name, record_id, action, old_data, new_data, performed_at, performed_by)
    VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, $6)
  `;
  try {
    await pool.query(query, [
      tableName,
      recordId,
      action,
      oldData ? JSON.stringify(oldData) : null,
      newData ? JSON.stringify(newData) : null,
      performedBy || null,
    ]);
  } catch (err) {
    console.error('Failed to log audit:', err);
    throw err; // Handle errors as appropriate
  }
};

module.exports = { logAudit };
