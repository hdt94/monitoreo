const { requestStreamExecution } = require('./stream');

const { launchBatchJob } = require('../jobs/launch');
const {
  selectExecutions,
  selectExecutionsWhere,
} = require('../../db/queries/executions');
const { selectOneTemplate } = require('../../db/queries/templates');

async function createOne(req, res) {
  const { templateId } = req.body;

  const { template, templateCount } = await selectOneTemplate({
    templateId,
  });
  if (templateCount !== 1) {
    return res.status(400).send(`Unknown template id:"${templateId}"`);
  }

  const args = { req, res, template };
  switch (template.type) {
    case 'batch':
      launchBatchJob(args);
      return;
    case 'stream':
      requestStreamExecution(args);
      return;
    default:
      req.status(500).json({
        error: { message: `Unknown template type: "${template.type}"` },
      });
  }
}

async function readMany(req, res) {
  // TODO filters, pagination
  const filters = req.query;
  const { executions } = filters
    ? await selectExecutionsWhere(filters)
    : await selectExecutions();

  res.json(executions);
}

module.exports = {
  createOne,
  readMany,
};
