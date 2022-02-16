const { cancelJob, getJob, listJobs } = require('./jobs');
const { launchFlexTemplate } = require('./templates');

module.exports = {
  cancelJob,
  getJob,
  launchFlexTemplate,
  listJobs,
};
