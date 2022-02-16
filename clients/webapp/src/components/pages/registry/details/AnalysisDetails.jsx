import React from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

function AnalysisDetails({ analysis }) {
  return (
    <Stack direction="row" justifyContent="space-around">
      <Box flex="1" sx={{'> *': {mb: 2}}}>
        <Box>
          <Typography variant="overline">General:</Typography>
          <Typography>Title: {analysis.title}</Typography>
          <Typography>ID: {analysis.id}</Typography>
          <Typography>Type: {analysis.type}</Typography>
          <Typography>Author: {analysis.meta.author.name}</Typography>
        </Box>
        <Box>
          <Typography variant="overline">Parameters:</Typography>
          <Typography>{JSON.stringify(analysis.params, null, 2)}</Typography>
        </Box>
      </Box>
      {/* <Stack spacing={1}> */}
      <Box display="flex" flexDirection="column" sx={{'> *': { mb: 1.2 } }}>
        <Button variant="contained">Edit</Button>
        <Button variant="contained">Copy to new</Button>
        <Button variant="contained">Copy params</Button>
        <Button variant="outlined" color="secondary" sx={{ mt: 4 }}>
          Delete
        </Button>
      </Box>
      {/* </Stack> */}
    </Stack>
  );
}

export default AnalysisDetails;
