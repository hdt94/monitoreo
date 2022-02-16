import React from "react";
import { NavLink as RouterLink, useLocation } from "react-router-dom";
import {
  Box,
  List,
  ListItem,
  // ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import { routes } from "../routes";

const StRouterLink = styled(RouterLink)({
  color: "inherit",
  flex: 1,
  paddingTop: "0.5em",
  paddingBottom: "0.5em",
  paddingLeft: "1.5em",
  paddingRight: "2.5em",
});

function NavMenu({ onRouteClick }) {
  const location = useLocation();
  const paths = ["/registry", "/analytics"];
  const linksMap = routes.reduce(
    (all, r) =>
      paths.includes(r.path) ? Object.assign(all, { [r.path]: r }) : all,
    {}
  );

  return (
    <nav>
      {paths.map((path) => (
        <Box key={path} marginTop="1em" paddingLeft="0.5em">
          <Typography>{linksMap[path].name}</Typography>
          {
            <List>
              {linksMap[path].children.map((link) => {
                const to = `${path}/${link.path}`
                  .replaceAll("//", "/")
                  .replace(/\/$/, "");

                return (
                  <ListItem
                    button
                    component="li"
                    key={to}
                    onClick={onRouteClick}
                    selected={location.pathname.startsWith(to)}
                    sx={{ p: 0 }}
                    // sx={{ display: "inline-block", padding: 0 }}
                  >
                    <StRouterLink to={to}>
                      {/* <ListItemIcon>{link.icon}</ListItemIcon> */}
                      <ListItemText primary={link.name} />
                      {/* {link.text} */}
                    </StRouterLink>
                  </ListItem>
                );
              })}
            </List>
          }
        </Box>
      ))}
    </nav>
  );
}

export default NavMenu;
