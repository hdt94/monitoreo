import { Button } from "@mui/material";

export default function createRowActions({ cancellingIds = [], onCancel }) {
  return function RowActions(props) {
    const { id, row } = props;
    const { currentState } = row;
    const cancellable = [
      "JOB_STATE_RUNNING",
      "JOB_STATE_QUEUED"
    ]
    if (!cancellable.includes(currentState)) {
      return "";
    }

    const cancelling = cancellingIds.includes(id);
    const minWidth = "7em";

    return (
      <Button
        color="warning"
        disabled={cancelling}
        onClick={() => onCancel(id)}
        size="small"
        sx={{ minWidth }}
        type="button"
        variant="outlined"
      >
        {cancelling ? 'Cancelling...' : 'Cancel'}
      </Button>
    );
  };
}