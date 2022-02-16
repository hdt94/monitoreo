import React from 'react';

import { useFormContext, useWatch } from "react-hook-form";

import RadiosInputType from "./RadiosInputType";

import SelectMeasures from "components/forms/common/SelectMeasures"
import SelectStructure from "components/forms/common/SelectStructure";
import TextFieldGoogleStorage from "components/forms/common/TextFieldGoogleStorage"

function AnalysisInput({ disabled }) {
  const {
    clearErrors,
    control,
    setValue
  } = useFormContext();
  const inputType = useWatch({ control, name: "inputType" });
  const structureId = useWatch({ control, name: "structure_id" });

  const handleChangePrevStructure = () => {
    setValue("measures_id", undefined);
    clearErrors("measures_id");
  };

  return (
    <>
      <RadiosInputType
        disabled={disabled}
        name="inputType"
      />
      {inputType === "paths" ? (
        <TextFieldGoogleStorage
          disabled={disabled}
          name="input"
        />
      ) : (
        <>
          <SelectStructure
            control={control}
            disabled={disabled}
            name="structure_id"
            onChangePrev={handleChangePrevStructure}
            sx={{ m: 1, minWidth: 80 }}
          />
          <SelectMeasures
            control={control}
            disabled={disabled}
            name="input"
            structureId={structureId}
          />
        </>
      )}
    </>
  );
}

export default AnalysisInput;
