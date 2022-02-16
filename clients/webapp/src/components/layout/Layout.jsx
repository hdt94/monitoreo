import React, { useEffect, useState } from "react";
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  Stack,
  Toolbar,
  Tooltip,
} from "@mui/material";
import { Menu, MenuOpen } from "@mui/icons-material";
import { styled, useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import NavMenu from "./NavMenu";
import Session from "./Session";

const StContainerMenuToggle = styled("div")(({ theme }) => ({
  margin: 1,
  // zIndex: theme.zIndex.drawer + 1,
  [theme.breakpoints.up("md")]: {
    visibility: "hidden",
  },
}));

const StDrawer = styled(Drawer)(({ theme }) => ({
  flexShrink: 0,
  [`& .MuiDrawer-paper`]: {
    position: "relative",
  },
  [theme.breakpoints.down("md")]: {
    [`& .MuiDrawer-paper`]: {
      // paddingTop: theme.spacing(6),
      position: "fixed",
    },
  },
}));

export default function Layout({ children }) {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("md"));

  // Don't show drawer unexpectedly if changing to down("md")
  useEffect(() => {
    if (open && !matches) {
      setOpen(false);
    }
  }, [matches, open]);

  const handleToggle = () => setOpen((prevValue) => !prevValue);
  const toogleTitle = open ? "Hide menu" : "Show menu";

  const drawerProps = matches
    ? {
        open,
        onClose: () => setOpen(false),
        variant: "temporary",
        ModalProps: {
          keepMounted: true,
        },
      }
    : { open: true, variant: "permanent" };

  return (
    <>
      <AppBar
        color="inherit"
        // elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            flex: "1",
            justifyContent: "space-between",
            pb: "0.5em",
          }}
        >
          <StContainerMenuToggle>
            <Tooltip title={toogleTitle} placement="right-start">
              <IconButton
                elevation={2}
                onClick={handleToggle}
                alt={toogleTitle}
              >
                {open ? <MenuOpen /> : <Menu />}
              </IconButton>
            </Tooltip>
          </StContainerMenuToggle>
          <Box>
            <Session />
          </Box>
        </Toolbar>
      </AppBar>
      <Stack direction="row" justifyContent="space-between">
        <StDrawer anchor="left" {...drawerProps}>
          {/* Empty Toolbar only for spacing */}
          <Toolbar />
          <NavMenu onRouteClick={open ? () => setOpen(false) : null} />
        </StDrawer>
        <Box
          component="main"
          flex="1"
          bgcolor="#f1f1f1"
          minHeight="100vh"
          paddingTop={3}
          display="flex"
          flexDirection="column"
        >
          {/* Empty Toolbar only for spacing */}
          <Toolbar />
          <Box flex="1">{children}</Box>
        </Box>
      </Stack>
    </>
  );
}
