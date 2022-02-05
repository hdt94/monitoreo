const connection = require('../../external/connection.live');

const meta = {
  context: 'analytics',
  category: 'jobs',
};
const rootRoom = '/analytics/jobs';

function notifyCreate({ job }) {
  connection.notify({
    meta,
    payload: job,
    room: rootRoom,
    type: 'create',
  });
}

function notifyUpdate({ jobs }) {
  connection.notify({
    array: jobs.map((job) => ({
      payload: job,
      room: `${rootRoom}/${job.id}`,
    })),
    meta,
    type: 'update',
  });
}

module.exports = {
  notifyCreate,
  notifyUpdate,
};
