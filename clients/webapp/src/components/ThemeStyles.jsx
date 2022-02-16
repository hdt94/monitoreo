import React from "react";
import { CssBaseline } from '@mui/material';
import { createTheme, ThemeProvider } from "@mui/material/styles";
// import { purple } from "@mui/material/colors";

// import { css } from "@emotion/react";

const theme = createTheme()
// const theme = createTheme({
//   palette: {
//     primary: {
//       main: "#f0f",
//     },
//     secondary: purple,
//   },
// });

export default function ThemeStyles({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
