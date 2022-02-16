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
import { DatePicker } from "@mui/lab";

import { reportSchema } from "./schemas";
import useSubmit from "./useSubmit";

import SaveCancelButtons from "../common/SaveCancelButtons";
import SelectStructure from "../common/SelectStructure";

export default function ReportForm({ item, onCancel, onSubmitted, ...props }) {
  const { saving, submitFn } = useSubmit({
    category: "reports",
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
    resolver: yupResolver(reportSchema),
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
        {...register("title")}
        autoComplete="off"
        defaultValue={item?.title}
        error={Boolean(errors.title)}
        label="Title:"
        helperText={errors.title?.message}
        placeholder="Title"
        required
        variant="outlined"
      />
      <FormControl sx={{ m: 1, minWidth: 80 }}>
        <InputLabel id="form-report-type" error={Boolean(errors.type)} required>
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
              labelId="form-report-type"
              // native
              placeholder="Type of report"
              required
              variant="outlined"
            >
              <MenuItem value="earthquake">Earthquake</MenuItem>
              <MenuItem value="inspection">Inspection</MenuItem>
              <MenuItem value="maintenance">Maintenance</MenuItem>
            </Select>
          )}
        />
        <FormHelperText error>{errors?.type?.message}</FormHelperText>
      </FormControl>
      <SelectStructure
        control={control}
        defaultValue={item?.structure_id}
        name="structure_id"
        sx={{ m: 1, minWidth: 80 }}
      />
      <Controller
        name="date"
        control={control}
        render={({ field }) => (
          <DatePicker
            {...field}
            label="Date"
            // inputFormat="yyyy/MM/dd"
            // mask="___/__/__"
            // placeholder="yyyy/MM/dd"
            renderInput={(params) => (
              <TextField
                {...params}
                error={
                  Boolean(errors.date) ||
                  (params.error && params.inputProps.value !== "")
                }
                helperText="mm/dd/yyyy"
              />
            )}
            required
          />
        )}
      />
      <TextField
        {...register("description")}
        autoComplete="off"
        defaultValue={item?.description}
        error={Boolean(errors.description)}
        label="Description"
        helperText={errors.description?.message}
        // placeholder="Description"
        variant="outlined"
      />
      <TextField
        autoComplete="off"
        {...register("data_json")}
        error={Boolean(errors.data_json?.message)}
        fullWidth
        helperText={errors.data_json?.message}
        label="Additional data as JSON"
        multiline
        rows="4"
        variant="outlined"
      />
      <Box mt={4}>
        <SaveCancelButtons saving={saving} handleCancel={onCancel} />
      </Box>
    </Stack>
  );
}
