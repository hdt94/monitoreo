import React, { useContext, useEffect, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { Add } from "@mui/icons-material";

import DataTableView from "./DataTableView";
import FormView from "./FormView";
import ContainerModalForm from "../../../layout/ContainerModalForm";

function RegistryView({
  category,
  defineTableColumns,
  ItemForm,
  onCreate,
  onEdit,
}) {
  const [editingId, setEditingId] = useState(null);
  const [open, setOpen] = useState(false);

  const handleModalClose = () => {
    setOpen(false);
    setEditingId(null);
  };
  const handleModalCreate = () => {
    setOpen(true);
    setEditingId(null);
  };
  const handleModalEdit = (itemId) => {
    setEditingId(itemId);
    setOpen(true);
  };

  const title =
    category.slice(0, 1).toUpperCase() + category.slice(1);

  return (
    <>
      <Box display="flex" flexDirection="column" height="100%">
        <Box aligntItems="center" display="flex" mb={2} px={1}>
          <Typography component="h2" variant="h5">
            {title}
          </Typography>
          <Button
            color="primary"
            endIcon={<Add />}
            onClick={onCreate || handleModalCreate}
            sx={{ ml: 3 }}
            type="button"
            variant="contained"
          >
            Create new
          </Button>
        </Box>
        <Box flex="1">
          <DataTableView
            {...{ category, defineTableColumns }}
            onEdit={onEdit || handleModalEdit}
          />
        </Box>
      </Box>
      {open && Boolean(ItemForm) && (
        <ContainerModalForm open onClose={handleModalClose}>
          <FormView
            itemId={editingId}
            onDone={handleModalClose}
            {...{
              category,
              ItemForm,
            }}
          />
        </ContainerModalForm>
      )}
    </>
  );
}

export default RegistryView;
