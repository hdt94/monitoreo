import { useForm } from "react-hook-form";
import { Box, Button, TextField, Typography } from "@mui/material";

import useErrors from "components/common/useErrors";

import { useAuth } from "components/contexts/auth";

function defineTextFieldCommonProps({ errors, name, register }) {
  const error = Boolean(errors?.[name])

  return {
    ...register(name, { required: true }),
    color: error ? "error" : "",
    error,
    required: true,
    variant: "standard",
  }
}

function LoginWithCredentials({ gap, mtAction, sx }) {
  const [globalErrors, appendGlobalError, _, resetGlobalErrors] = useErrors();
  const { login } = useAuth();
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onBlur",
  })

  const submitFn = async (values) => {
    resetGlobalErrors()
    const { email, pass } = values;
    const { error } = await login({ email, pass });

    if (error) {
      appendGlobalError(error);
    }
  };

  return (
    <>
      <Box
        component="form"
        noValidate
        onSubmit={handleSubmit(submitFn)}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap,
          ...sx
        }}
      >
        {globalErrors.map((error) => (
          <Typography color="error" key={error}>{error}</Typography>
        ))}
        <TextField
          {...defineTextFieldCommonProps({ errors, name: 'email', register })}
          label="Email"
        />
        <TextField
          {...defineTextFieldCommonProps({ errors, name: 'pass', register })}
          label="Password"
          type="password"
        />
        <Button
          disabled={isSubmitting}
          sx={{ mt: mtAction }}
          type="submit"
          variant="contained"
        >
          {isSubmitting ? "Logging in..." : "Log in"}
        </Button>
      </Box>
    </>
  );
}

export default LoginWithCredentials;
