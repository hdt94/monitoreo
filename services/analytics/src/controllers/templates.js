const { selectManyTemplates } = require('../db/queries/templates');

async function readMany(req, res) {
  // TODO filters
  // const { filters } = res.params
  const { templates } = await selectManyTemplates();

  await res.json(templates);
}

module.exports = {
  readMany,
};
