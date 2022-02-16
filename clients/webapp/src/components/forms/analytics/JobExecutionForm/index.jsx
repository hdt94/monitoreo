import { Box, Grid, Stack } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import ButtonsExecution from "components/forms/analytics/common/ButtonsExecution"

import { analysisExecutionJobStream } from "components/forms/analytics/configs";

import SelectTemplate from "components/forms/common/SelectTemplate"
import TextFieldParametersJSON from "components/forms/common/TextFieldParametersJSON"

export default function JobExecutionForm({
  executionState,
  onCancelDiscard,
  onSubmit,
  onSubmitError,
  templates,
  ...props
}) {
  const { defaultValues, schema } = analysisExecutionJobStream;
  const methods = useForm({
    defaultValues,
    mode: "onBlur",
    resolver: yupResolver(schema),
  });

  const handleCancelDiscardReset = () => {
    if (executionState.inputting) {
      reset();
      return
    }
    onCancelDiscard();
  };

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
    setValue,
  } = methods;

  const disabled = false;
  console.log('errors:', errors)

  return (
    <FormProvider {...methods}>
      <Box
        component="form"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        p={2}
        {...props}
      >
        <ButtonsExecution {...{
          executionState,
          handleCancelDiscardReset,
        }}
        />
        <Grid
          container
          spacing={4}
          sx={{ mt: 2 }}
        >
          <Grid item xs={12} sm={7} md={7} lg={7}>
            <Stack spacing={3}>
              <SelectTemplate
                control={control}
                disabled={disabled}
                name="templateId"
                fixedExecutionType="stream"
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
