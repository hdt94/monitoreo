import {
  Box,
  Button,
  Stack,
} from "@mui/material";


function renderTexts(executionState) {
  if (executionState.cancelling) {
    return { primary: "Run", secondary: "Cancelling..." };
  }
  if (executionState.finalized) {
    return { primary: "Save", secondary: "Discard" };
  }
  if (executionState.running) {
    return { primary: "Running...", secondary: "Cancel" };
  }
  if (executionState.inputting) {
    return { primary: "Run", secondary: "Reset" };
  }
  if (executionState.requesting) {
    return { primary: "Requesting...", secondary: "Cancel" };
  }
  if (executionState.saving) {
    return { primary: "Saving..." };
  }

  throw new Error(`Invalid rendering texts: executionState: ${JSON.stringify(executionState)}`)
}

export default function ButtonsExecution({ executionState, handleCancelDiscardReset, sx = {} }) {
  const disabledPrimary = !(executionState.inputting || executionState.finalized);
  const disableSecondary = executionState.cancelling || executionState.saving;
  const text = renderTexts(executionState);
  const minWidth = '10em';

  return (
    <Box>
      <Stack
        direction="row"
        // justifyContent="flex-end"
        spacing={2}
      // sx={{ "& > *": { 'min-width': "9em" } }}
      // sx={{ "& > *": { flex: "1", maxWidth: "10em" } }}
      >
        <Button
          disabled={disabledPrimary}
          sx={{ minWidth, ...sx }}
          type="submit"
          variant="contained"
        >
          {text.primary}
        </Button>
        <Button
          type="button"
          color="secondary"
          disabled={disableSecondary}
          onClick={handleCancelDiscardReset}
          sx={{ minWidth, ...sx }}
          variant="outlined"
        >
          {text.secondary}
        </Button>

        {/* <Button
        type="button"
        disabled={disabledSubmit}
        onClick={handleSave}
        variant="contained"
      >
        {saving ? "Saving..." : "Save"}
      </Button> */}
      </Stack>
    </Box>)
}
