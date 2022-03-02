import { useState } from "react";

const baseState = {
  cancelling: false,
  finalized: false,
  inputting: false,
  requesting: false,
  running: false,
  saving: false,
};
const initialState = {
  ...baseState,
  inputting: true,
}

export default function useExecutionState() {
  const [executionState, setExecutionState] = useState(initialState);
  const updateExecutionState = (mode) => {
    if (!(mode in baseState)) {
      throw new Error(`Unknown execution state mode "${mode}"`);
    }

    if (!executionState[mode]) {
      setExecutionState({ ...baseState, [mode]: true });
    }
  };

  return { executionState, updateExecutionState };
}
