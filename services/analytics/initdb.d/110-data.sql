CREATE TABLE results (
    results_id SERIAL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    data JSONB,
    metadata JSONB,
    PRIMARY KEY(results_id)
);
--
CREATE TABLE measures (
  measures_id BIGSERIAL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  data JSONB,
  metadata JSONB,
  PRIMARY KEY (measures_id)
);
