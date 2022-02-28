import { useEffect, useMemo, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import SelectAnalysisType from "./SelectAnalysisType";
import SelectExecutionType from "./SelectExecutionType"
import SelectTemplateMatch from "./SelectTemplateMatch"

function matchTemplates({ analysisType, executionType, templates }) {
  if (analysisType && executionType) {
    return templates.filter(t => (
      t.type === executionType
      // t.analysisType === analysisType
      // && t.executionType === executionType
    ))
  }

  if (analysisType) {
    // return templates

  }
  if (executionType) {

  }

  return templates;
}

function SelectTemplate({
  fixedExecutionType = null,
  disabled,
  name,
  templates
}) {
  const { control, formState: { errors }, setValue } = useFormContext();
  const analysisType = useWatch({ control, name: "analysisType" });
  const executionType = useWatch({ control, name: "executionType" });
  const templateId = useWatch({ control, name });

  const templateMatches = useMemo(
    () => matchTemplates({ analysisType, executionType, templates }),
    [analysisType, executionType, templates]
  );

  const clearTemplateId = () => {
    setValue(name, "");
  }

  useEffect(() => {
    if (templateMatches.length !== 1) {
      setValue(name, "");
      return;
    }

    const { id } = templateMatches[0];
    if (templateId !== id) {
      setValue(name, id);
    }
  }, [analysisType, executionType, templateMatches]);

  return (
    <>
      <SelectAnalysisType
        control={control}
        disabled={disabled}
        name="analysisType"
      />
      {fixedExecutionType === null && (
        <SelectExecutionType
          control={control}
          disabled={disabled}
          errors={errors}
          fixedExecutionType={fixedExecutionType}
          name="executionType"
          onChangeBefore={clearTemplateId}
          templates={templates}
        />
      )}
      <SelectTemplateMatch
        control={control}
        disabled={disabled}
        errors={errors}
        name={name}
        templates={templateMatches}
      />
    </>
  );
}

export default SelectTemplate;
