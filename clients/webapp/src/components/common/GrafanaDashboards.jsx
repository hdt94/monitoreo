import React from "react";
import Box from "@mui/material/Box";
import Link from '@mui/material/Link';


function renderLink({ url }) {
  return (
    <Link href={url} target="_blank" sx={{
      maxWidth: '20em',
      display: 'inline-block',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      verticalAlign: 'bottom',
      whiteSpace: 'nowrap',
    }}>
      {url}
    </Link>
  )
}

function GrafanaDashboards({
  dashboards,
  executionId = null,
  structureId = null
}) {

  if (dashboards.length === 0) {
    return "No dashboards available";
  }
  if (executionId === null) {
    return null;
  }

  /* TEMP dashboard selection */
  const index = 0;

  const dash = dashboards[index];
  const title = `${dash.title} - execution_id=${executionId}`;

  /* TEMP hardcoded timestamps */
  const timeStart = new Date("2019-09-10 17:17:07").getTime();
  const timeEnd = new Date("2019-09-10 17:36:59").getTime();
  const params = new URLSearchParams({
    from: timeStart,
    to: timeEnd,
    "var-execution_id": executionId
  });

  const url = `${window.location.origin}${dash.url}?${params.toString()}`;

  return (
    <div>
      <p>Dashboard title: {title}</p>
      <p>Dashboard link: {renderLink({ url })}</p>
      <Box sx={{ aspectRatio: "16/9", width: "100%" }}>
        <iframe
          height="100%"
          src={`${url}&kiosk=tv`}
          title={title}
          width="100%"
        />
      </Box>
    </div>
  );
}

export default GrafanaDashboards;
