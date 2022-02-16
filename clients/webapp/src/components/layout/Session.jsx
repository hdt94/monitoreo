import { useNavigate } from "react-router-dom";
import { Button, Stack, Typography } from "@mui/material";

import { useAuth } from "components/contexts/auth";

function Session() {
  const auth = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.logout();
    navigate("/");
  };

  return (
    <>
      <Stack alignItems="center" direction="row">
        <Stack alignItems="center" marginRight="1.5em" direction="row">
          <Typography>{auth.userName}</Typography>
        </Stack>
        <Button
          color="secondary"
          onClick={handleLogout}
          type="button"
          variant="outlined"
        >
          Log out
        </Button>
      </Stack>
    </>
  );
}

export default Session;
