import React from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Box,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Stack,
  Select,
  TextField,
} from "@mui/material";

import { instrumentsSchema } from "./schemas";
import useSubmit from "./useSubmit";

import SaveCancelButtons from "../common/SaveCancelButtons";


export default function InstrumentsForm({
  item,
  onCancel,
  onSubmitted,
  ...props
}) {
  const { saving, submitFn } = useSubmit({
    category: "instruments",
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
    resolver: yupResolver(instrumentsSchema),
  });

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
          id="form-instruments-type"
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
              labelId="form-instruments-type"
              // native
              placeholder="Type of instruments"
              required
              variant="outlined"
            >
              <MenuItem value="accelerometer">Accelerometer</MenuItem>
              <MenuItem value="acoustic">Acoustic emission</MenuItem>
              <MenuItem value="strain-gauge">Strain gauge</MenuItem>
            </Select>
          )}
        />
        <FormHelperText error>{errors?.type?.message}</FormHelperText>
      </FormControl>
      <TextField
        {...register("manufacturer")}
        defaultValue={item?.manufacturer}
        error={Boolean(errors.manufacturer)}
        label="Manufacturer:"
        helperText={errors.manufacturer?.message}
        placeholder="Manufacturer"
        required
        variant="outlined"
      />
      <Box mt={4}>
        <SaveCancelButtons saving={saving} handleCancel={onCancel} />
      </Box>
    </Stack>
  );
}
