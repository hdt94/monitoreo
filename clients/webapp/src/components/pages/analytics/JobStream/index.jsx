import { Paper, Typography } from "@mui/material";

import { useAnalytics } from "components/contexts/analytics";
import JobExecutionForm from "components/forms/analytics/JobExecutionForm";

import useErrors from "components/pages/common/useErrors"
import useRequestsEffect from "components/pages/common/useRequestsEffect"

import useSubmitCancel from "./useSubmitCancel";

export default function JobExecutionStream() {
  const { createUpdate, templates } = useAnalytics();
  const { errors, appendError } = useErrors();

  useRequestsEffect({
    categories: ['templates'],
    createUpdate,
    subdomain: 'analytics',
  })

  const handleSubmitError = (errors) => {
    // console.log(errors);
  }
  const {
    executionState,
    handleCancel,
    handleSubmit
  } = useSubmitCancel({ appendError });

  return (
    <Paper>
      {
        errors.map(error => <Typography error>{error.message}</Typography>)
      }
      <JobExecutionForm
        executionState={executionState}
        onCancelDiscard={handleCancel}
        onSubmit={handleSubmit}
        onSubmitError={handleSubmitError}
        templates={templates.items}
      />
    </Paper>
  );
}
