import React from 'react'
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Box,
  Button,
  // Container,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Stack,
  Select,
  TextField,
  Typography,
} from "@mui/material";

function renderMenuText(menuValue) {
  const menuTexts = {
    "modal-identification": "Modal identification"
  }

  return menuTexts?.[menuValue] || menuValue;
}

function SelectAnalysisType({ control, disabled, name, sx = {}, templates }) {
  // const executionTypes = useMemo(() =>
  //   Array.from(new Set(templates.map(t => t.type))),
  //   [templates]
  // );
  // const menuItems = EXECUTION_TYPE_MENU_ITEMS.filter(m => executionTypes.includes(m.value))
  const menuValues = ["modal-identification"]

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <FormControl disabled={disabled} sx={sx} >
          <InputLabel id="form-analysis-type">Type of analysis:</InputLabel>
          <Select
            {...field}
            label="Type of analysis:"
            labelId="form-analysis-type"
            // native
            placeholder="Type of analysis"
            required
            variant="outlined"
          >
            {
              menuValues.map(v => (
                <MenuItem key={v} value={v}>
                  {renderMenuText(v)}
                </MenuItem>
              ))
            }
          </Select>
        </FormControl>
      )}
    />
  )
}

export default SelectAnalysisType
