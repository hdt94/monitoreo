const dataflowJobToJob = require('./dataflowJobToJob');
const { pool } = require('../../index');
const { valuesPlaceholders } = require('../../utils');

async function insertJob({ dataflowJob, executionId, templateId }) {
  const columns = ['job_id', 'execution_id', 'last_state', 'template_id'];
  const values = [
    dataflowJob.id,
    executionId,
    dataflowJob.currentState,
    templateId,
  ];
  const text = `
    INSERT INTO jobs (${columns.join(',')})
    VALUES ${valuesPlaceholders(columns.length)}
    `;
  const { rowCount: jobCount } = await pool.query(text, values);

  const job = dataflowJobToJob({
    executionId,
    dataflowJob,
    templateId,
  });

  return { job, jobCount };
}

async function selectJobs({ dataflowJobs }) {
  const values = dataflowJobs.map((j) => j.id);
  const text = `
        SELECT
          execution_id,
          job_id AS id,
          last_state,
          template_id
        FROM jobs
        WHERE job_id IN ${valuesPlaceholders(values.length)}
      `;
  const { rowCount, rows } = await pool.query(text, values);
  const rowsMap = rows.reduce(
    (all, row) => Object.assign(all, { [row.id]: row }),
    {}
  );

  if (rowCount !== dataflowJobs.length) {
    // TODO mitigate inconsistency
  }

  const dataflowJobsWithNewState = [];
  const jobs = dataflowJobs.map((dataflowJob) => {
    let executionId;
    let templateId;

    if (dataflowJob.id in rowsMap) {
      const row = rowsMap[dataflowJob.id];
      if (row.last_state !== dataflowJob.currentState) {
        dataflowJobsWithNewState.push(dataflowJob);
      }
      [executionId, templateId] = [row.execution_id, row.template_id];
    } else {
      // inconsistent database regarding jobs
      [executionId, templateId] = [null, null];
    }

    return dataflowJobToJob({
      dataflowJob,
      executionId,
      templateId,
    });
  });

  return { jobs, dataflowJobsWithNewState };
}

async function selectJobWhereRunningTemplate({ templateId }) {
  const {
    rows: [job],
    rowCount: jobCount,
  } = await pool.query({
    text: `
      SELECT job_id as id, execution_id, template_id
      FROM jobs
      WHERE last_state = 'JOB_STATE_RUNNING'
        AND template_id = $1`,
    values: [templateId],
  });

  return { job, jobCount };
}

async function updateJobsStates({ dataflowJobs }) {
  const columns = ['job_id', 'last_state'];
  const conversions = {
    1: 'job_state',
  };
  const placeholders = valuesPlaceholders(
    columns.length,
    dataflowJobs.length,
    conversions
  );
  const text = `
    UPDATE jobs
    SET last_state = temp.last_state
    FROM (
      VALUES ${placeholders}
    ) AS temp(${columns.join(',')})
    WHERE jobs.job_id = temp.job_id
    RETURNING jobs.execution_id, jobs.job_id, jobs.template_id
    `;
  const values = dataflowJobs.flatMap((job) => [job.id, job.currentState]);

  let rows;
  try {
    // const { rows } = await pool.query(text, values);
    ({ rows } = await pool.query(text, values));
  } catch (error) {
    return { error };
  }

  const dtjsMap = dataflowJobs.reduce(
    (all, dtj) => Object.assign(all, { [dtj.id]: dtj }),
    {}
  );
  const jobs = rows.map((row) =>
    dataflowJobToJob({
      dataflowJob: dtjsMap[row.job_id],
      executionId: row.execution_id,
      templateId: row.template_id,
    })
  );

  return { jobs };
}

module.exports = {
  insertJob,
  selectJobs,
  selectJobWhereRunningTemplate,
  updateJobsStates,
};
