import React from 'react'
import { useFormContext } from "react-hook-form";
import {
  TextField,
} from "@mui/material";

function TextFieldGoogleStorage({ disabled, name }) {
  const { errors, register } = useFormContext()
  const labelStart = name.slice(0, 1).toUpperCase() + name.slice(1)

  return (
    <TextField
      {...register(name)}
      autoComplete="off"
      disabled={disabled}
      error={Boolean(errors?.[name])}
      label={`${labelStart} (object or pattern):`}
      helperText={errors?.[name]?.message}
      placeholder="Object or pattern"
      required
      variant="outlined"
    />
  )
}

export default TextFieldGoogleStorage
