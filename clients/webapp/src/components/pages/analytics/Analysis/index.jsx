import { useState } from "react";
import { Paper, Typography } from "@mui/material";

import useInitialRequestEffect from "./useInitialRequestEffect";
import useSubmitCancelDiscard from "./useSubmitCancelDiscard";
import useSubscribeBatchJob from "./useSubscribeBatchJob";

import useExecutionState from 'components/pages/analytics/common/useExecutionState';

import GrafanaDashboards from "components/common/GrafanaDashboards";
import AnalysisExecutionForm from "components/forms/analytics/AnalysisExecutionForm";

import { useAnalytics } from "components/contexts/analytics";

import useArray from "components/pages/common/useArray"
import useErrors from "components/pages/common/useErrors"



function Analysis() {
  const [messages, appendMessage] = useArray([]);
  const { templates } = useAnalytics();
  const { errors, appendError } = useErrors();

  const [batchJobId, setBatchJobId] = useState(null);
  const [executionId, setExecutionId] = useState(null);

  const { executionState, updateExecutionState } = useExecutionState();

  /* TEMP */
  const tags = ["execution", "modal"];

  const { dashboards, requested } = useInitialRequestEffect({
    onError: appendError,
    tags
  })
  useSubscribeBatchJob({
    batchJobId,
    onError: appendError,
    onMessage: appendMessage,
    updateExecutionState,
  });

  const {
    handleCancelDiscard,
    handleSubmit
  } = useSubmitCancelDiscard({
    appendError,
    batchJobId,
    executionState,
    setBatchJobId,
    setExecutionId,
    updateExecutionState
  });

  const handleSubmitError = (errors) => {
    // console.log(errors);
  };

  if (templates.items.length === 0) {
    return (
      <Typography>
        {
          requested
            ? "There are no records of templates for analysis"
            : "Loading templates for analysis..."
        }
      </Typography>
    );
  }

  return (
    <>
      <Paper>
        {
          errors.map(error => <Typography key={error}>{error}</Typography>)
        }
        {
          messages.map(message => <Typography key={message}>{message}</Typography>)
        }
        <AnalysisExecutionForm
          executionState={executionState}
          onCancelDiscard={handleCancelDiscard}
          onSubmit={handleSubmit}
          onSubmitError={handleSubmitError}
          templates={templates.items}
        />
      </Paper>
      {executionId && (
        <Paper>
          <GrafanaDashboards dashboards={dashboards} executionId={executionId} tags={tags} />
        </Paper>
      )}
    </>
  );
}

export default Analysis;
