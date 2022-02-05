\c analytics;
-- 
CREATE TYPE template_type AS ENUM ('batch', 'stream');
CREATE TABLE templates (
    template_id SMALLSERIAL,
    container_spec_gcs_path VARCHAR NOT NULL,
    meta JSONB,
    name VARCHAR NOT NULL,
    type template_type NOT NULL,
    version VARCHAR,
    PRIMARY KEY (template_id)
);
-- 
CREATE TYPE execution_request_type AS ENUM ('job', 'message');
CREATE TABLE executions (
    execution_id BIGSERIAL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    message_id VARCHAR,
    request_type execution_request_type NOT NULL,
    template_id SMALLINT,
    user_id VARCHAR(30),
    FOREIGN KEY (template_id) REFERENCES templates(template_id),
    PRIMARY KEY(execution_id)
);
--
--  Possible states: https://cloud.google.com/dataflow/docs/reference/rpc/google.dataflow.v1beta3#jobstate
CREATE TYPE job_state AS ENUM (
    'JOB_STATE_UNKNOWN',
    'JOB_STATE_STOPPED',
    'JOB_STATE_RUNNING',
    'JOB_STATE_DONE',
    'JOB_STATE_FAILED',
    'JOB_STATE_CANCELLED',
    'JOB_STATE_UPDATED',
    'JOB_STATE_DRAINING',
    'JOB_STATE_DRAINED',
    'JOB_STATE_PENDING',
    'JOB_STATE_CANCELLING',
    'JOB_STATE_QUEUED',
    'JOB_STATE_RESOURCE_CLEANING_UP'
);
CREATE TABLE jobs (
    job_id VARCHAR NOT NULL,
    execution_id BIGINT,
    last_state job_state NOT NULL,
    template_id SMALLINT,
    FOREIGN KEY (execution_id) REFERENCES executions(execution_id),
    FOREIGN KEY (template_id) REFERENCES templates(template_id),
    PRIMARY KEY(job_id)
);

CREATE TABLE inconsistent_jobs (
    job_id VARCHAR NOT NULL,
    PRIMARY KEY(job_id)
);
