import React from 'react'
import { Controller, useFormContext } from "react-hook-form";
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

function RadiosInputType({ disabled, name }) {
  const { control, defaultValues } = useFormContext();
  // const {
  //   field: { onChange, ...inputProps },
  //   fieldState: { error, invalid },
  // } = useController({
  //   control,
  //   name,
  // });
  // const props = register(name);

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValues?.[name]}
      // rules={{ required: true }}
      render={({ field }) => (
        <FormControl component="fieldset" disabled={disabled} sx={{ flexDirection: 'row' }} >
          <FormLabel component="legend">Input type:</FormLabel>
          <RadioGroup
            // aria-label="gender"
            // defaultValue="female"
            // name="radio-buttons-group"
            {...field}
            row
          // {...props}
          // onChange={handleChange}
          // defaultValue={defaultValue}
          // {...register(name)}
          >
            <FormControlLabel
              control={<Radio />}
              label="Measures"
              value="measures"
            />
            <FormControlLabel
              control={<Radio />}
              label="Paths"
              value="paths"
            />
          </RadioGroup>
        </FormControl>
      )}
    />
    // <FormControl component="fieldset">
    //   <FormLabel component="legend">Gender</FormLabel>
    //   <RadioGroup
    //     // aria-label="gender"
    //     // defaultValue="female"
    //     // name="radio-buttons-group"
    //     {...props}
    //     onChange={handleChange}
    //     defaultValue={defaultValue}
    //     // {...register(name)}
    //   >
    //     <FormControlLabel value="female" control={<Radio />} label="Female" />
    //     <FormControlLabel value="male" control={<Radio />} label="Male" />
    //     <FormControlLabel value="other" control={<Radio />} label="Other" />
    //   </RadioGroup>
    // </FormControl>
  )
}

export default RadiosInputType
