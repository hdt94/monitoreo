import * as yup from "yup";

import { defaultAnalysisParams } from "config/analysis";


function validateAsJSON(value) {
  if (value === "") {
    return true;
  }

  try {
    JSON.parse(value);
    return true;
  } catch (err) {
    if (err instanceof SyntaxError) {
      return false;
    }
    throw err;
  }
}


const baseAnalysisExecutionSchema = {
  analysisParams: yup
    .string()
    .required()
    .test("parameters", "Parameters must be JSON-compatible", validateAsJSON),
  analysisType: yup.string().required("Analysis type is required"),
  executionType: yup.string().required("Execution type is required"),
  templateId: yup.string().required("Associated template is required"),
}

function defaultAnalysisExecution() {
  const analysisType = "modal-identification";
  const defaultParams = defaultAnalysisParams({ analysisType });
  const analysisParams = defaultParams === null
    ? ""
    : JSON.stringify(defaultParams, null, 4);
  const defaultValues = {
    analysisType,
    executionType: "",
    analysisParams,
    templateId: "",
    type: analysisType,
  };

  return defaultValues;
}

export const analysisExecution = {
  defaultValues: {
    ...defaultAnalysisExecution(),
    input: "",
    inputType: "measures",
  },
  schema: yup.object().shape({
    ...baseAnalysisExecutionSchema,
    input: yup.string().required("Input is required")
  })
};

export const analysisExecutionJobStream = {
  defaultValues: {
    ...defaultAnalysisExecution(),
    executionType: "stream"
  },
  schema: yup.object().shape(baseAnalysisExecutionSchema)
}
