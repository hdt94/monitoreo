import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Box,
  Grid,
  Stack,
} from "@mui/material";

import AnalysisInput from "./AnalysisInput"

import ButtonsExecution from "components/forms/analytics/common/ButtonsExecution"

import { analysisExecution } from "components/forms/analytics/configs";

import SelectTemplate from "components/forms/common/SelectTemplate"
import TextFieldParametersJSON from "components/forms/common/TextFieldParametersJSON"

// import { getItems } from "services/registry";
// import { useRegistry } from "state/registry";


export default function AnalysisExecutionForm({
  executionState,
  onCancelDiscard,
  onSubmit,
  onSubmitError,
  templates = [],
  ...props
}) {
  const { defaultValues, schema } = analysisExecution;
  const methods = useForm({
    defaultValues,
    mode: "onBlur",
    resolver: yupResolver(schema),
  });
  const {
    control,
    handleSubmit,
    // formState: { errors },
    reset,
    setValue,
  } = methods;

  const handleCancelDiscardReset = () => {
    if (executionState.inputting) {
      reset();
      return
    }
    onCancelDiscard();
  };

  const disabled = !executionState.inputting;

  return (
    <FormProvider {...methods}>
      <Box
        component="form"
        noValidate
        onSubmit={handleSubmit(onSubmit, onSubmitError)}
        p={2}
        {...props}
      >
        <ButtonsExecution {...{
          executionState,
          handleCancelDiscardReset
        }}
        />
        <Grid
          container
          // columnSpacing={4}
          spacing={4}
          sx={{ mt: 2 }}
        >
          <Grid item xs={12} sm={7} md={7} lg={7}>
            <Stack spacing={3}>
              <AnalysisInput disabled={disabled} />
              <SelectTemplate
                control={control}
                disabled={disabled}
                name="templateId"
                setValue={setValue}
                templates={templates}
              />
            </Stack>
          </Grid>
          <Grid item xs={12} sm={5} md={5} lg={5}>
            <TextFieldParametersJSON
              disabled={disabled}
              name="analysisParams"
              sx={{ height: '100%' }}
            />
          </Grid>
        </Grid>
      </Box>
    </FormProvider>
  );
}
