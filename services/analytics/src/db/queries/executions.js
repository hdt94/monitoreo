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

async function selectExecutions() {
  const { rows, rowCount } = await pool.query({
    text: `
      SELECT
        execution_id AS id, e.created_at, e.request_type, e.user_id,
        t.template_id, t.name, t.type, t.version
      FROM executions AS e
      INNER JOIN templates AS t
      ON e.template_id = t.template_id;
    `,
  });

  if (rowCount === 0) {
    return { executions: [] };
  }

  const executions = rows.map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    requestType: row.request_type,
    template: {
      id: row.template_id,
      name: row.name,
      type: row.type,
      version: row.version,
    },
    userId: row.user_id,
  }));

  return { executions };
}

async function selectExecutionsWhere({ requestType, templateId }) {
  const { rows, rowCount } = await pool.query({
    text: `
      SELECT
        execution_id AS id, e.created_at, e.request_type, e.user_id,
        t.template_id, t.name, t.type, t.version
      FROM executions AS e
      INNER JOIN templates AS t
        ON e.template_id = t.template_id
      WHERE e.request_type = $1
        AND e.template_id = $2;
    `,
    values: [requestType, templateId],
  });

  if (rowCount === 0) {
    return { executions: [] };
  }

  const executions = rows.map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    requestType: row.request_type,
    template: {
      id: row.template_id,
      name: row.name,
      type: row.type,
      version: row.version,
    },
    userId: row.user_id,
  }));

  return { executions };
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
  selectExecutions,
  selectExecutionsWhere,
  updateMessage,
};
