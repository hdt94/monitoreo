import React from "react";
import { useController } from "react-hook-form";
import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";


function renderTemplates({ fixedExecutionType, templates }) {
  const executionTypeTextMap = {
    "batch": "Batch (slow start, high volume of data)",
    "stream": "Stream (fast start, low volume of data)"
  }

  if (fixedExecutionType) {
    return (
      <MenuItem value={fixedExecutionType}>
        {executionTypeTextMap?.[fixedExecutionType] || fixedExecutionType}
      </MenuItem>
    )
  }

  const executionTypes = Array.from(new Set(templates.map(t => t.type)))

  return executionTypes.map(t => (
    <MenuItem key={t} value={t}>
      {executionTypeTextMap?.[t] || t}
    </MenuItem>
  ))
}

export default function SelectExecutionType({
  control,
  disabled,
  fixedExecutionType,
  name,
  onChangeBefore,
  sx = {},
  templates
}) {
  const {
    field: { onChange, ...inputProps },
    fieldState: { error, invalid },
  } = useController({
    control,
    name,
  });

  const handleChange = (e) => {
    if (onChangeBefore) {
      onChangeBefore(e.target.value)
    }

    onChange(e);
  }

  return (
    <FormControl disabled={disabled || Boolean(fixedExecutionType)} sx={sx}>
      <InputLabel id="form-execution-type">Type of execution:</InputLabel>
      <Select
        {...inputProps}
        onChange={handleChange}
        error={invalid}
        label="Type of execution:"
        labelId="form-execution-type"
        placeholder="Type of execution"
        required
        variant="outlined"
      >
        {renderTemplates({ fixedExecutionType, templates })}
      </Select>
      <FormHelperText error={invalid}>{error?.message}</FormHelperText>
    </FormControl>
  )
  // return (
  //   <Controller
  //     control={control}
  //     name={name}
  //     render={({ field }) => (
  //       <FormControl sx={sx}>
  //         <InputLabel id="form-execution-type">Type of execution:</InputLabel>
  //         <Select
  //           {...field}
  //           // disabled
  //           label="Type of execution:"
  //           labelId="form-execution-type"
  //           // native
  //           placeholder="Type of execution"
  //           required
  //           variant="outlined"
  //         >
  //           {
  //             menuItems.map(m => (
  //               <MenuItem value={m.value}>
  //                 {m.text}
  //               </MenuItem>
  //             ))
  //           }
  //         </Select>
  //       </FormControl>
  //     )}
  //   />
  // )
}