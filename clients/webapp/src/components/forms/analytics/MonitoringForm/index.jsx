import React from 'react'
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

import { monitoringVisualization} from "../configs";

import SelectStructure from "components/forms/common/SelectStructure";
import SelectTemplate from "components/forms/common/SelectTemplate"


function MonitoringForm({
  onSubmit,
  templates = [],
}) {
  const { defaultValues, schema } = monitoringVisualization;
  const methods = useForm({
    defaultValues,
    mode: "onBlur",
    resolver: yupResolver(schema),
  });
  const { control, handleSubmit } = methods;

  return (
    <FormProvider {...methods}>
      <Box
        component="form"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        display="flex"
        flexDirection="column"
        gap="1.2em"
        maxWidth="100%"
        width="30em"
      >
        <SelectStructure
          control={control}
          name="structureId"
        />
        <SelectTemplate
          fixedExecutionType="stream"
          name="templateId"
          templates={templates}
        />
        <Button
          type="submit"
          variant="contained"
        >
          Visualize
        </Button>

      </Box>
    </FormProvider >
  )
}

export default MonitoringForm