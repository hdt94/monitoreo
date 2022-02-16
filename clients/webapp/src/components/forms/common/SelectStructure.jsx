import React, { useContext, useEffect, useState } from "react";
import { useController } from "react-hook-form";
import {
  Box,
  Button,
  Container,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Stack,
  Select,
  TextField,
} from "@mui/material";

import { getOneItem, getItems } from "../../../services/registry";
import { useRegistry } from "../../../state/registry";

function useFetchStructures({ defaultValue }) {
  const [fetching, setFetching] = useState(false);
  const {
    createUpdate,
    structures,
  } = useRegistry();

  // TODO optimize
  useEffect(() => {
    let mounted = true;

    async function fetchStructures() {
      setFetching(true);
      const payload = await getItems("structures");

      if (mounted) {
        setFetching(false);
        createUpdate({ meta: { category: "structures" }, payload });
      }

      if (mounted && defaultValue && !(defaultValue in structures.itemsMap)) {
        setFetching(true);
        const payload = await getOneItem("structures", defaultValue);

        if (mounted) {
          setFetching(false);
          createUpdate({ meta: { category: "structures" }, payload: [payload] });
        }
      }
    }

    fetchStructures();

    return () => {
      mounted = false;
    };
  }, []);

  return { fetching, structures };
}

export default function SelectStructure({
  control,
  defaultValue,
  disabled,
  onChangePrev,
  name,
  sx,
}) {
  const { fetching, structures } = useFetchStructures({
    defaultValue,
  });
  const {
    field: { ref, onChange, value, ...inputProps },
    fieldState: { error, invalid },
  } = useController({
    control,
    name,
  });

  function handleChange(e) {
    if (onChangePrev) {
      onChangePrev(e.target.value);
    }

    onChange(e);
  }

  const loading = fetching && structures.items.length === 0;

  return (
    <FormControl sx={sx}>
      <>
        <InputLabel id="form-field-structure" error={invalid} required>
          Structure:
        </InputLabel>
        <Select
          {...inputProps}
          onChange={handleChange}
          value={(loading && "loading") || value || ""}
          disabled={loading || disabled}
          error={invalid}
          inputRef={ref}
          label="Structure:"
          labelId="form-field-structure"
          // native
          placeholder="Associated structure"
          required
          variant="outlined"
        >
          {/* <option value="modal-identification">Modal identification</option> */}
          {loading ? (
            <MenuItem value="loading">Loading structures...</MenuItem>
          ) : (
            structures.items.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.name}
              </MenuItem>
            ))
          )}
        </Select>
        <FormHelperText error={invalid}>{error?.message}</FormHelperText>
      </>
    </FormControl>
  );
}
