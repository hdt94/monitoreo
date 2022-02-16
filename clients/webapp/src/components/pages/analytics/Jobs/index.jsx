import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";

import createRowActions from './createRowActions';
import defineTableColumns from './defineTableColumns';

import { useAnalytics } from 'components/contexts/analytics';

import useArray from "components/pages/common/useArray";
import useErrors from "components/pages/common/useErrors";

import TabulationView from "components/pages/common/tabulation/TabulationView";
import useRequestSubscribeEffect from "components/pages/common/tabulation/useRequestSubscribeEffect";

import { cancelJob } from "services/analytics";


export default function Jobs() {
  const category = 'jobs';
  const subdomain = 'analytics';
    
  const [cancellingIds, addCancellingId, removeCancellingId] = useArray([]);
  const { errors, appendError } = useErrors();
  const navigate = useNavigate();
  
  const context = useAnalytics();
  const { createUpdate, jobs } = context;
  useRequestSubscribeEffect({
    category,
    createUpdate,
    onError: appendError,
    subdomain
  });

  const onCancel = (jobId) => {
    addCancellingId(jobId);
    cancelJob({ jobId })
      .then(response => {
        console.log(response)
        // TODO createUpdate
      })
      .catch(({ error }) => {
        removeCancellingId(jobId);
        appendError(error);
      })
  }

  const RowActions = createRowActions({ cancellingIds, onCancel })
  const columns = defineTableColumns({ RowActions });
  const rows = jobs.items;

  return (
    <>
      <Button
        color="warning"
        onClick={() => navigate("new-stream")}
        size="small"
        // sx={{ minWidth }}
        type="button"
        variant="contained"
      >
        Create stream job
      </Button>
      <TabulationView
        category={category}
        columns={columns}
        errors={errors}
        rows={rows}
      />
    </>
    // <ul>
    //   {
    //     jobs.items
    //       .sort((a, b) => a.id < b.id ? 1 : -1)
    //       .map(job => (
    //         <li key={job.id}>
    //           <p>Name: {job.name}</p>
    //           <p>ID: {job.id}</p>
    //           <p>Current state: {job.currentState}</p>
    //         </li>
    //       ))
    //   }
    // </ul>
  );
}
