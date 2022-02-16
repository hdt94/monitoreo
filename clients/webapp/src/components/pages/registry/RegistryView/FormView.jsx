import React, { useState } from "react";
import { Box, Typography } from "@mui/material";

import { useRegistry } from "../../../../state/registry";

function FormView({ category, itemId, ItemForm, onDone }) {
  const [submissionError, setSubmissionError] = useState();

  const registry = useRegistry();
  const { createUpdate } = registry;

  const handleSubmitted = ({ data, error }) => {
    if (error) {
      setSubmissionError(
        error.status
          ? `Error ${error.status}: ${error.message}`
          : `Error: ${error.message}`
      );
      return;
    }
    createUpdate({ meta: { category }, payload: [data] });
    onDone();
  };

  const action = Boolean(itemId) ? "Edition" : "Creation";
  const singularMap = {
    analyses: "analysis",
    instruments: "instruments",
    measures: "measures"
  };
  const singular =
    category in singularMap
      ? singularMap[category]
      : category.slice(0, category.length - 1);

  return (
    <>
      <Box
        alignItems="center"
        display="flex"
        flexWrap="wrap"
        justifyContent="space-between"
      >
        <Typography sx={{ flexShrink: 0, mb: 1.5 }} variant="h5">
          {`${action} of ${singular}`}
        </Typography>
        {Boolean(submissionError) && (
          <Typography color="error" sx={{ flexShrink: 0, mb: 1.5 }}>
            {submissionError}
          </Typography>
        )}
      </Box>
      <ItemForm
        item={(itemId && registry[category].itemsMap[itemId]) || null}
        onCancel={onDone}
        onSubmitted={handleSubmitted}
      />
    </>
  );
}

export default FormView;
