import React from "react";
import { Box, Modal } from "@mui/material";

export default function ContainerModalForm({ children, onClose }) {
  const sx = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    maxHeight: "100vh",
    maxWidth: "100vw",
    overflow: "auto",
    width: 600,
    //   width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  };

  return (
    <Modal open={true} onClose={onClose}>
      <Box sx={sx}>{children}</Box>
    </Modal>
  );
}
