import React, { useEffect, useState } from "react";
import { useController } from "react-hook-form";
import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";

import { getOneItem, getItems } from "../../../services/registry";
import { useRegistry } from "../../../state/registry";

function useFetchResources({ category, defaultValue }) {
  const [fetching, setFetching] = useState(false);
  const registry = useRegistry();

  const { createUpdate } = registry;
  const resources = registry[category];

  // TODO optimize
  useEffect(() => {
    let mounted = true;

    async function fetchResources() {
      setFetching(true);
      const payload = await getItems(category);

      if (mounted) {
        setFetching(false);
        createUpdate({ meta: { category }, payload });
      }

      if (mounted && defaultValue && !(defaultValue in resources.itemsMap)) {
        setFetching(true);
        const payload = await getOneItem(category, defaultValue);

        if (mounted) {
          setFetching(false);
          createUpdate({ meta: { category }, payload: [payload] });
        }
      }
    }

    fetchResources();

    return () => {
      mounted = false;
    };
  }, []);

  return { fetching, resources };
}

export default function SelectResources({
  category,
  control,
  defaultValue,
  onChangePrev,
  label,
  name,
  placeholder = "",
  required = false,
  sx,
}) {
  const { fetching, resources } = useFetchResources({
    defaultValue,
    category,
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

  const labelId = `form-field-${category}`;
  const labelValue = `${label}:`;
  const loading = fetching && resources.items.length === 0;

  return (
    <FormControl sx={sx}>
      <>
        <InputLabel id={labelId} error={invalid} required={required}>
          {labelValue}
        </InputLabel>
        <Select
          {...inputProps}
          onChange={handleChange}
          value={(loading && "loading") || value || ""}
          disabled={loading}
          error={invalid}
          inputRef={ref}
          label={labelValue}
          labelId={labelId}
          placeholder={placeholder}
          required={required}
          variant="outlined"
        >
          {loading ? (
            <MenuItem value="loading">Loading {category}...</MenuItem>
          ) : (
            resources.items.map((s) => (
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
