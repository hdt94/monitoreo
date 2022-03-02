import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "components/contexts/auth"

import useExecutionState from 'components/pages/analytics/common/useExecutionState';

import { cancelJob, createJob } from "services/analytics";

export default function useSubmitCancel({ appendError }) {
  const { userId } = useAuth();
  const navigate = useNavigate();

  const { executionState, updateExecutionState } = useExecutionState();

  const [requestCancelled, setCancelRequested] = useState(false);
  const cancelRequestedRef = useRef();
  cancelRequestedRef.current = requestCancelled;

  const handleCancel = useCallback(async function cancelDiscard({ jobId }) {
    if (executionState.requesting) {
      setCancelRequested(true)
      updateExecutionState('cancelling');
      return
    }

    if (executionState.running) {
      updateExecutionState('cancelling');
      try {
        await cancelJob({ jobId })
      } catch ({ error }) {
        appendError(error);
      }
      updateExecutionState('inputting');
      return
    }

    throw new Error(`Invalid cancel discard: executionState: ${JSON.stringify(executionState)}`);
  }, [appendError, executionState, updateExecutionState]);

  const handleSubmit = useCallback(async function submit(values) {
    if (!executionState.inputting) {
      throw new Error(`Invalid submit: executionState: ${JSON.stringify(executionState)}`);
    }

    updateExecutionState('requesting');

    const body = {
      analysis: JSON.parse(values.analysisParams),
      templateId: values.templateId,
      userId,
    };

    try {
      const { jobId } = await createJob({ body });

      if (cancelRequestedRef.current) {
        await handleCancel({ jobId });
      } else {
        navigate('/analytics/jobs')
      }
    } catch (error) {
      appendError(error);
      updateExecutionState('inputting');
    }
  }, [
    appendError,
    cancelRequestedRef,
    executionState,
    handleCancel,
    navigate,
    updateExecutionState,
    userId
  ]);

  return { executionState, handleCancel, handleSubmit };
}
