import React from "react";

import {
  Button,
  Stack,
} from "@mui/material";

function FormSaveCancelButtons({ saving, handleCancel }) {
  return (
    <Stack
      direction="row"
      justifyContent="flex-end"
      spacing={2}
      sx={{ "& > *": { flex: "1" } }}
    >
      <Button
        type="button"
        onClick={handleCancel}
        variant="outlined"
        color="secondary"
      >
        Cancel
      </Button>
      <Button type="submit" variant="contained" disabled={saving}>
        {saving ? "Saving..." : "Save"}
      </Button>
    </Stack>
  );
}

export default FormSaveCancelButtons;
