import React from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Box,
  Checkbox,
  FormControl,
  FormHelperText,
  InputLabel,
  ListItemText,
  MenuItem,
  Stack,
  Select,
  TextField,
} from "@mui/material";

import { structureSchema } from "./schemas";
import useSubmit from "./useSubmit";

import SaveCancelButtons from "../common/SaveCancelButtons";


function StructureForm({ item, onCancel, onSubmitted, ...props }) {
  const { saving, submitFn } = useSubmit({
    category: "structures",
    item,
    onSubmitted,
  });
  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({
    defaultValues: item,
    mode: "onBlur",
    resolver: yupResolver(structureSchema),
  });

  const materials = [
    {
      name: "Concrete - Prestressed",
      value: "concrete-prestressed",
    },
    {
      name: "Concrete - Reinforced",
      value: "concrete-reinforced",
    },
    {
      name: "Steel",
      value: "steel",
    },
  ];
  const types = [
    {
      name: "Bridge - pedestrian",
      value: "bridge-pedestrian",
    },
    {
      name: "Bridge - vehicular",
      value: "bridge-vehicular",
    },
    {
      name: "Building - residential",
      value: "building-residential",
    },
    {
      name: "Building - special",
      value: "building-special",
    },
  ];

  return (
    <Stack
      {...props}
      component="form"
      noValidate
      onSubmit={handleSubmit(submitFn)}
      spacing={3}
    >
      <TextField
        {...register("name")}
        autoComplete="off"
        defaultValue={item?.name}
        error={Boolean(errors.name)}
        label="Name:"
        helperText={errors.name?.message}
        placeholder="Name"
        required
        variant="outlined"
      />
      <FormControl sx={{ m: 1, minWidth: 80 }}>
        <InputLabel
          id="form-structure-type"
          error={Boolean(errors.type)}
          required
        >
          Type:
        </InputLabel>
        <Controller
          name="type"
          control={control}
          defaultValue={item?.type || ""}
          render={({ field }) => (
            <Select
              {...field}
              error={Boolean(errors.type)}
              label="Type:"
              labelId="form-structure-type"
              placeholder="Type of structure"
              required
              variant="outlined"
            >
              {types.map(({ name, value }) => (
                <MenuItem key={value} value={value}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          )}
        />
        <FormHelperText error>{errors?.type?.message}</FormHelperText>
      </FormControl>
      <FormControl sx={{ m: 1, minWidth: 80 }}>
        <InputLabel
          id="form-structure-materials"
          error={Boolean(errors.materials)}
          required
        >
          Materials:
        </InputLabel>
        <Controller
          name="materials"
          control={control}
          defaultValue={item?.materials || []}
          render={({ field }) => (
            <Select
              {...field}
              error={Boolean(errors.materials)}
              label="Materials:"
              labelId="form-structure-materials"
              multiple
              placeholder="Materials of structure"
              renderValue={(selected) => selected.join(", ")}
              required
              variant="outlined"
            >
              {materials.map((m) => (
                <MenuItem key={m.value} value={m.value}>
                  <Checkbox checked={field.value.includes(m.value)} />
                  <ListItemText primary={m.name} />
                </MenuItem>
              ))}
            </Select>
          )}
        />
        <FormHelperText error>{errors?.materials?.message}</FormHelperText>
      </FormControl>
      <Box mt={4}>
        <SaveCancelButtons saving={saving} handleCancel={onCancel} />
      </Box>
    </Stack>
  );
}

export default StructureForm;
