import { Box, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

export default function TabulationView({
  category,
  columns,
  errors,
  rows,
}) {
  // const subdomainState
  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Box display="flex" justifyContent="space-between" px={1}>
        {errors.length === 0 ? (
          <Typography sx={{ mb: 1 }}>
            Number of {category}: {rows.length}
          </Typography>
        ) : (
          <Typography color="error" sx={{ mb: 1 }}>
            {errors[0]}
            {/* {errors.length > 1 && (
              <Box component="span" ml={4}>
                | Total errors: {errors.length}
              </Box>
            )} */}
          </Typography>
        )}
      </Box>
      <Box flex="1" minHeight="15rem">
        <DataGrid columns={columns} rows={rows} />
      </Box>
    </Box>
  );
}