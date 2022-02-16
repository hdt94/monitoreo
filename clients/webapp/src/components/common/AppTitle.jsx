import { Typography } from "@mui/material";

function AppTitle({ sx = {}, ...props }) {
  return (
    <Typography
      component="h1"
      {...props}
      sx={{
        fontFamily: "Lato, sans-serif",
        fontSize: "2.5rem",
        fontWeight: "700",
        lineHeight: "1.2",
        textAlign: "center",
        ...sx,
      }}
    >
      {/* monitoreo&nbsp;webapp */}
      monitoreo webapp
    </Typography>
  );
}

export default AppTitle;
