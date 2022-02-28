import React from 'react'
import { useState } from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import GrafanaDashboards from "components/common/GrafanaDashboards";
import useErrors from "components/common/useErrors";

import { useAnalytics } from "components/contexts/analytics";

import MonitoringForm from 'components/forms/analytics/MonitoringForm'


import ZeroTemplates from 'components/pages/analytics/common/ZeroTemplates'
import useRequestDashboardsTemplates from 'components/pages/analytics/common/useRequestDashboardsTemplates'

import { getMonitoringExecutions } from "services/analytics";


function Monitoring() {
  const { templates } = useAnalytics();
  const [errors, appendError, _, resetErrors] = useErrors();

  const [executionId, setExecutionId] = useState(null);
  const [structureId, setStructureId] = useState(null);

  /* TEMP */
  const tags = ["modal", "structure"];

  const { dashboards, loading } = useRequestDashboardsTemplates({
    onError: appendError,
    tags
  });

  if (templates.items.length === 0) {
    return <ZeroTemplates loading={loading} />;
  }

  const onSubmit = async (values) => {
    setExecutionId(null);
    resetErrors();

    let executions;
    try {
      executions = await getMonitoringExecutions({
        templateId: values.templateId
      })
    } catch (err) {
      appendError(err);
      return;
    }

    if (executions.length === 0) {
      const message = "There are no executions for current template";
      appendError({ message });
      return;
    }

    /* TEMP execution selection */
    const execution = executions[0];

    setExecutionId(execution.id);
    setStructureId(values.structureId);
  }


  return (
    <>
      <Paper sx={{ p: 2 }}>
        <h2>Monitoring visualization</h2>
        {
          errors.map(error => <Typography color="error" key={error}>{error}</Typography>)
        }
        <MonitoringForm
          onSubmit={onSubmit}
          templates={templates.items}
        />
      </Paper>
      {executionId && structureId && (
        <Paper>
          <GrafanaDashboards
            dashboards={dashboards}
            executionId={executionId}
            structureId={structureId}
          />
        </Paper>
      )}
    </>
  )
}

export default Monitoring;
