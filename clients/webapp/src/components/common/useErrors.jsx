import { useCallback, useState } from "react";

export default function useErrors() {
  const [errors, setErrors] = useState([]);
  const appendError = useCallback((err, action) => {
    let error = `Error`;
    if (action) {
      error += ` ${action}`;
    }
    if (err.status) {
      error += `: status ${err.status}`;
    }
    if (err.message) {
      error += `: ${err.message}`;
    }
    setErrors([error, ...errors]);
  }, [errors]);
  const removeError = useCallback((err) => {
    const copy = [...errors];
    copy.splice(copy.indexOf(err), 1);
    setErrors(copy);
  }, [errors])
  const resetErrors = useCallback(() => {
    setErrors([]);
  }, [])

  return [errors, appendError, removeError, resetErrors]
}
