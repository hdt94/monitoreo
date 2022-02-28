import React from 'react'
import { Typography } from "@mui/material";

function ZeroTemplates({ loading }) {
  return (
    <Typography>
      {
        loading
          ? "Loading templates for analytics..."
          : "There are no records of templates for analytics"
      }
    </Typography>
  )
}

export default ZeroTemplates
