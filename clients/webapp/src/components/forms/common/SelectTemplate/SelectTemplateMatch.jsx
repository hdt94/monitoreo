import { Controller } from "react-hook-form";
import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";


export default function SelectTemplateMatch({
  control,
  errors,
  disabled,
  name,
  sx = {},
  templates
}) {
  const label = "Execution template:";

  const empty = templates.length === 0;
  const errorMessage = empty ?
    "There are no execution templates for current configuration"
    : errors?.[name]?.message;
  const error = Boolean(errorMessage);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <FormControl disabled={disabled || empty} sx={sx}>
          <InputLabel id="form-template" error={error}>
            {label}
          </InputLabel>
          <Select
            {...field}
            error={error}
            label={label}
            labelId="form-template"
            placeholder="Execution template"
            required
            variant="outlined"
          >
            {
              templates.map(t => (
                <MenuItem key={t.id} value={t.id}>
                  {t.name} - v{t.version}
                </MenuItem>
              ))
            }
          </Select>
          <FormHelperText error={error}>{errorMessage}</FormHelperText>
        </FormControl>
      )}
    />
  )
}
