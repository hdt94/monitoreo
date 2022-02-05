const { requestStreamExecution } = require('./stream');

const { launchBatchJob } = require('../jobs/launch');
const queries = require('../../db/queries/templates');

async function createOne(req, res) {
  const { templateId } = req.body;

  const { template, templateCount } = await queries.selectOneTemplate({
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

module.exports = {
  createOne,
};
