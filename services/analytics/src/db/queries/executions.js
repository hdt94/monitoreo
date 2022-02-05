const { pool } = require('../index');

async function insertExecution({ templateId, requestType, userId }) {
  const { rows, rowCount: executionCount } = await pool.query({
    text: `INSERT INTO executions (template_id, request_type, user_id)
           VALUES ($1, $2, $3)
           RETURNING execution_id as id, created_at`,
    values: [templateId, requestType, userId],
  });

  if (executionCount === 0) {
    return { executionCount };
  }

  const execution = {
    id: rows[0].id,
    createdAt: rows[0].created_at,
    requestType,
    userId,
  };

  return { execution, executionCount };
}

async function updateMessage({ executionId, messageId }) {
  const { rowCount } = await pool.query({
    text: `UPDATE executions
           SET message_id = $1
           WHERE execution_id = $2`,
    values: [messageId, executionId],
  });

  if (rowCount === 1) {
    return {};
  }

  return {
    error: {
      message: 'Message id was not updated',
    },
  };
}

module.exports = {
  insertExecution,
  updateMessage,
};
