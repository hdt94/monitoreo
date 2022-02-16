import React, { useState } from "react";
import { FileError, FileRejection, useDropzone } from "react-dropzone";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormHelperText,
  InputLabel,
  MenuItem,
  Stack,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { DateTimePicker } from "@mui/lab";

import { measuresSchema } from "./schemas";
import useSubmit from "./useSubmit";

import SaveCancelButtons from "../common/SaveCancelButtons";
import SelectResources from "../common/SelectResources";

function FilesField({ errors, setValue }) {
  const [files, setFiles] = useState([]);
  const onDrop = (acceptedFiles, rejectedFiles) => {
    const newFiles = [...files, ...acceptedFiles];
    setFiles(newFiles);
    setValue("files", newFiles);
  };

  const { getRootProps, getInputProps, isDragActive, rootRef } = useDropzone({
    onDrop,
    // accept: ['image/*', 'video/*', '.pdf'],
    // maxSize: 300 * 1024, // 300KB
  });

  const rootProps = getRootProps();
  const inputProps = getInputProps();

  delete rootProps.tabIndex;

  const isInvalid = Boolean(errors?.files);

  return (
    <FormControl error={isInvalid}>
      <FormLabel id="form-files-area">Files:</FormLabel>
      <Box sx={{ display: "flex", flexDirection: "row" }}>
        <Box>
          <input {...inputProps} />
          <Button
            {...rootProps}
            sx={{
              display: "inline-flex",
              flexDirection: "column",
              height: "100%",
              minHeight: "8em",
            }}
            variant="outlined"
          >
            <span>Attach files</span>
            <span>(You can drop files here)</span>
          </Button>
        </Box>
        <Box sx={{ flexGrow: "1", pl: 2 }}>
          {isInvalid ? (
            <Typography color="error">{errors.files.message}</Typography>
          ) : (
            <Typography>
              {files.length === 0
                ? "No files attached"
                : `Number of files: ${files.length}`}
            </Typography>
          )}
        </Box>
      </Box>
    </FormControl>
  );
}

function DateTimeField({ control, errors, label, name }) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <DateTimePicker
          {...field}
          label={label}
          renderInput={(params) => {
            const isInvalid =
              Boolean(errors[name]) ||
              (params.error && params.inputProps.value !== "");

            return (
              <TextField
                {...params}
                error={isInvalid}
                helperText={
                  (isInvalid && errors[name]?.message) || "mm/dd/yyyy"
                }
              />
            );
          }}
          required
        />
      )}
    />
  );
}

export default function MeasuresForm({
  item = {},
  onCancel,
  onSubmitted,
  ...props
}) {
  // const onDrop = useCallback((accFiles: File[], rejFiles: FileRejection[]) => {
  //   const mappedAcc = accFiles.map((file) => ({ file, errors: [], id: getNewId() }));
  //   const mappedRej = rejFiles.map((r) => ({ ...r, id: getNewId() }));
  //   setFiles((curr) => [...curr, ...mappedAcc, ...mappedRej]);
  // }, []);

  const { saving, submitFn } = useSubmit({
    category: "measures",
    http: true,
    item,
    onSubmitted,
  });
  const {
    control,
    formState: { errors, isSubmitted, isValid },
    handleSubmit,
    register,
    setValue,
    watch,
  } = useForm({
    /* TEMP enforcing to "files" */
    defaultValues: {
      ...item,
      data_source_type: "files",
      // data_source: {
      //   type: "files",
      // },
    },
    mode: "onBlur",
    resolver: yupResolver(measuresSchema),
  });

  const data_source_type = watch("data_source_type");
  // const dataSourceType = watch("data_source.type");

  console.log("errors", errors);

  return (
    <>
      {isSubmitted && !isValid && (
        <Typography color="error" mb={2}>
          There are errors in form
        </Typography>
      )}
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
        <SelectResources
          category="structures"
          control={control}
          // defaultValue={}
          // initialValue={}
          label="Structures"
          name="structure_id"
          placeholder="Associated structures"
          required
        />
        <FormControl disabled sx={{ m: 1, minWidth: 80 }}>
          <InputLabel
            id="form-measures-type"
            error={Boolean(errors.type)}
            required
          >
            Type:
          </InputLabel>
          <Controller
            name="data_source_type"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                error={Boolean(errors.type)}
                label="Type:"
                labelId="form-measures-type"
                placeholder="Type of measures"
                required
                variant="outlined"
              >
                <MenuItem value="files">Files</MenuItem>
                <MenuItem value="monitoring">Monitoring</MenuItem>
              </Select>
            )}
          />
          <FormHelperText error>
            {errors?.data_source_type?.message}
          </FormHelperText>
        </FormControl>
        {data_source_type === "files" ? (
          <>
            <SelectResources
              category="instruments"
              control={control}
              // defaultValue={}
              label="Instruments"
              name="instruments_id"
              placeholder="Associated instruments"
              required
            />
            <DateTimeField
              control={control}
              errors={errors}
              label="Time start"
              name={"time_start"}
            />
            <DateTimeField
              control={control}
              errors={errors}
              label="Time end"
              name={"time_end"}
            />
            <FilesField {...{ errors, setValue }} />
          </>
        ) : (
          <p>Instruments based on time start</p>
        )}
        <Box mt={4}>
          <SaveCancelButtons saving={saving} handleCancel={onCancel} />
        </Box>
      </Stack>
    </>
  );
}
