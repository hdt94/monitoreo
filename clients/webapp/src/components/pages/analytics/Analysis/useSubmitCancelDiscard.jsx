import { useCallback, useRef, useState } from "react";

import { useAnalytics } from "components/contexts/analytics";
import { useAuth } from "components/contexts/auth"

import {
  cancelJob,
  createJob,
  requestExecution,
} from "services/analytics";

export default function useSubmitCancelDiscard({
  appendError,
  batchJobId,
  executionState,
  setExecutionId,
  setBatchJobId,
  updateExecutionState
}) {
  const { createUpdate, templates } = useAnalytics();
  const { userId } = useAuth();

  const [cancelRequested, setCancelRequested] = useState(false);
  const cancelRequestedRef = useRef();
  cancelRequestedRef.current = cancelRequested;

  const handleCancelDiscard = useCallback(async function cancelDiscard(args) {
    if (executionState.requesting) {
      setCancelRequested(true)
      updateExecutionState('cancelling');
      return
    }

    // Cancel
    if (executionState.executing) {
      updateExecutionState('cancelling');

      // Only jobs are cancellable
      const jobId = args?.jobId || batchJobId;
      if (jobId) {
        try {
          const response = await cancelJob({ jobId })
          // TODO createUpdate
        }
        catch ({ error }) {
          appendError(error);
        }
      }
      updateExecutionState('inputting');
      return
    }

    // Discard as analysis
    if (executionState.executed) {
      setExecutionId(null);
      updateExecutionState('inputting');
      return
    }

    throw new Error(`Invalid cancel discard: executionState: ${JSON.stringify(executionState)}`);
  }, [batchJobId, executionState]);

  const handleSubmit = useCallback(async function submit(values) {
    if (executionState.inputting) {
      updateExecutionState('requesting');
    } else if (executionState.executed) {
      // TODO save as analysis
      updateExecutionState('saving');
      return alert('Not available');
    } else {
      throw new Error(`Invalid submit: executionState: ${JSON.stringify(executionState)}`);
    }

    const templateId = values.templateId;
    const body = {
      analysis: JSON.parse(values.analysisParams),
      input: values.input,
      inputType: values.inputType,
      templateId,
      userId,
    };

    try {
      const batching = templates.entities[templateId].type === 'batch';
      const response = batching
        ? await createJob({ body })
        : await requestExecution({ body });

      if (cancelRequestedRef.current) {
        handleCancelDiscard({ jobId: response.id });
      } else {
        updateExecutionState('executing');
        if (batching) {
          // TODO createUpdate
          setExecutionId(response.executionId);
          setBatchJobId(response.id);
        } else {
          // TODO createUpdate
          setExecutionId(response.id);
        }
      }
    } catch (error) {
      updateExecutionState('inputting');
      appendError(error)
    }
  }, []);

  return { executionState, handleCancelDiscard, handleSubmit };
}