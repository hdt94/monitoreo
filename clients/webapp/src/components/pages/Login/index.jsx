import { Box, Typography, useTheme } from "@mui/material";

import LoginWithCredentials from "./LoginWithCredentials";
import LoginWithGoogle from "./LoginWithGoogle";

import AppTitle from "components/common/AppTitle";

function Login() {
  const theme = useTheme();

  return (
    <Box
      alignContent="center"
      display="flex"
      flexDirection="column"
      height="100vh"
      justifyContent="center"
      m="auto"
      maxWidth="100vw"
      p="2em"
      width="28em"
    >
      <AppTitle sx={{ mb: theme.spacing(6) }} />
      <LoginWithGoogle sx={{ mb: theme.spacing(5) }} />
      <Typography mb={theme.spacing(2)} textAlign="center" >
        Or log in with credentials:
      </Typography>
      <LoginWithCredentials gap={theme.spacing(1)} mtAction={theme.spacing(3)} />
    </Box>
  );
}

export default Login;
