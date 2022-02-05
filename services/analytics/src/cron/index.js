const Task = require('./Task');
const { cronUpdateJobsStates } = require('./functions/jobs');

class Cron {
  start() {
    this._tasks = [new Task(cronUpdateJobsStates, 30_000)];

    this._tasks.forEach((task) => task.start());
  }
}

module.exports = new Cron();
