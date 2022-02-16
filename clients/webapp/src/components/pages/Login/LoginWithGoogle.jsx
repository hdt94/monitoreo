import { Button, Typography } from "@mui/material";

import useErrors from "components/common/useErrors";

import { useAuth } from "components/contexts/auth";


function LoginWithGoogle({ sx }) {
  const [globalErrors, appendGlobalError, _, resetGlobalErrors] = useErrors();
  const { authWithGoogle, } = useAuth();

  const handleGoogleLogin = async () => {
    resetGlobalErrors();
    const { error } = await authWithGoogle();

    if (error) {
      appendGlobalError(error);
    }
  };

  return (
    <>

      {globalErrors.map((error) => (
        <Typography color="error" key={error}>{error}</Typography>
      ))}
      <Button
        type="button"
        onClick={handleGoogleLogin}
        sx={sx}
        variant="contained"
      >
        Log in with Google
      </Button>
    </>
  );
}

export default LoginWithGoogle;
