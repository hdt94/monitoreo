const { pool } = require('../index');

async function selectManyTemplates() {
  // TODO filters
  const { rows: templates } = await pool.query({
    text: 'SELECT template_id AS id, name, type FROM templates',
  });

  return { templates };
}

async function selectOneTemplate({ templateId }) {
  const { rows, rowCount: templateCount } = await pool.query({
    text: `
            SELECT template_id as id, container_spec_gcs_path, name, type
            FROM templates WHERE template_id = $1`,
    values: [templateId],
  });

  if (templateCount === 0) {
    return { templateCount };
  }

  const template = rows[0];
  template.containerSpecGcsPath = template.container_spec_gcs_path;
  delete template.container_spec_gcs_path;

  return { template, templateCount };
}

module.exports = {
  selectManyTemplates,
  selectOneTemplate,
};
