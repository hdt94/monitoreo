import { useEffect } from 'react';

import { useAnalytics } from "components/contexts/analytics";
import { useConnection } from "components/contexts/connection";

export default function useSubscribeBatchJob({
  batchJobId,
  onError,
  onMessage,
  updateExecutionState
}) {
  const { connectionRef } = useConnection();
  const { jobs } = useAnalytics();
  const job = jobs.entities?.[batchJobId];

  // subscribe to job changes
  useEffect(() => {
    if (batchJobId) {
      const connection = connectionRef.current;
      const rooms = [`/analytics/jobs/${batchJobId}`];

      connection.subscribe({ rooms });

      return () => {
        connection.unsubscribe({ rooms });
      };
    }
  }, [batchJobId]);


  // parse state
  useEffect(() => {
    if (!job) {
      return;
    }

    switch (job.currentState) {
      case "JOB_STATE_CANCELLING": {
        updateExecutionState('cancelling');
        return;
      }
      case "JOB_STATE_DONE": {
        onMessage('Job has been finalized')
        updateExecutionState('finalized');
        return;
      }
      case "JOB_STATE_FAILED": {
        onError(`Job failed - ID: ${batchJobId}`);
        updateExecutionState('inputting');
        return;
      }
      case "JOB_STATE_RUNNING": {
        updateExecutionState('running');
        return;
      }
      case "JOB_STATE_STOPPED": {
        onMessage('Job has been stopped')
        updateExecutionState('inputting');
        return;
      }
      default: {
        return;
      }
    }
  }, [batchJobId, job])
}
