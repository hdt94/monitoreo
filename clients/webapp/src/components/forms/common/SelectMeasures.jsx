import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
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

import { getMeasures } from "services/registry";
import { useRegistry } from "state/registry";

export default function SelectMeasures({ control, disabled, name, structureId }) {
  const [fetchingMeasures, setFetchingMeasures] = useState(false);
  const [fetchedMeasures, setFetchedMeasures] = useState(false);

  const { createUpdate, measures } = useRegistry();

  useEffect(() => {
    if (structureId) {
      setFetchingMeasures(true);
      setFetchedMeasures(false);

      getMeasures({ createUpdate, structureId })
        // .catch(onError)
        .finally(() => {
          setFetchingMeasures(false);
          setFetchedMeasures(true);
        });
    }
  }, [structureId]);

  const missingStructure = !structureId;
  const filteredMeasures = missingStructure
    ? []
    : measures.items.filter((m) => m.structure_id === structureId);
  const disabledMeasures = missingStructure || filteredMeasures.length === 0;
  const disabledMeasuresMessage =
    (missingStructure && "Choose structure first") ||
    (fetchingMeasures && "Loading measures...") ||
    (fetchedMeasures && "Create measures for assigned structure") ||
    "Initializing...";

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { invalid, error } }) => (
        <FormControl disabled={disabled} >
          <InputLabel id="analysis-measures-selector" error={invalid} required>
            Measures:
          </InputLabel>
          <Select
            {...field}
            value={disabledMeasures ? "disabled" : field.value || ""}
            disabled={disabled || disabledMeasures}
            error={invalid}
            label="Measures:"
            labelId="analysis-measures-selector"
            placeholder="Select measures"
            required
            variant="outlined"
          >
            {disabledMeasures ? (
              <MenuItem value="disabled">{disabledMeasuresMessage}</MenuItem>
            ) : (
              filteredMeasures.map((m) => (
                <MenuItem key={m.id} value={m.id}>
                  {m.title}
                </MenuItem>
              ))
            )}
          </Select>
          <FormHelperText error={invalid}>{error?.message}</FormHelperText>
        </FormControl>
      )}
    />
  );
}