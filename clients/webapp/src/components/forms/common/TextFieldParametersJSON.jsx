import React from 'react';
import { useFormContext } from "react-hook-form";
import TextField from "@mui/material/TextField";

function TextFieldJSONParameters({ disabled, name, sx = {} }) {
  const { errors, register } = useFormContext();
  const message = errors?.[name]?.message || "";

  return (
    <TextField
      autoComplete="off"
      {...register(name)}
      disabled={disabled}
      error={Boolean(message)}
      fullWidth
      helperText={message}
      label="Parameters as JSON:"
      multiline
      // minRows="5"
      placeholder="Type your parameters as JSON"
      sx={sx}
      required
      variant="outlined"
    />
  );
}

export default TextFieldJSONParameters;
