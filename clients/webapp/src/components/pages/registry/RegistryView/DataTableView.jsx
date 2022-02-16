import React, { useContext, useEffect, useMemo, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

import { deleteOneItem, getItems } from "../../../../services/registry";
import { useRegistry } from "../../../../state/registry";
import { useConnection } from "../../../contexts/connection";

function createRowActions({ editRowFn, deleteRowFn, deletingIds }) {
  return function RowActions(props) {
    const deleting = deletingIds.includes(props.id);
    const minWidth = "7em";

    return (
      <>
        <Button
          disabled={deleting}
          onClick={() => editRowFn(props.id)}
          size="small"
          sx={{ minWidth }}
          type="button"
          variant="contained"
        >
          Edit
        </Button>
        <Button
          color="warning"
          disabled={deleting}
          onClick={() => deleteRowFn(props.id)}
          size="small"
          sx={{ ml: 4, minWidth }}
          type="button"
          variant="outlined"
        >
          {deleting ? "Deleting..." : "Delete"}
        </Button>
      </>
    );
  };
}

function defineActionsGridCol(RowActions) {
  return {
    field: "actions",
    align: "center",
    disableColumnMenu: true,
    disableReorder: true,
    filterable: false,
    headerAlign: "center",
    headerName: "Actions",
    renderCell: RowActions,
    sortable: false,
    width: 220,
  };
}

function DataTableView({ category, defineTableColumns, enableActions = true, onEdit }) {
  const [errors, setErrors] = useState([]);
  const [deletingIds, setDeletingIds] = useState([]);

  const { connectionRef } = useConnection();
  const connection = connectionRef.current;

  const registry = useRegistry();
  const { createUpdate, delete_ } = registry;
  const { items } = registry[category];

  const appendError = (err, action) => {
    let error = `Error ${action}`;
    if (err.status) {
      error += `: status ${err.status}`;
    }
    if (err.message) {
      error += `: ${err.message}`;
    }
    setErrors([error, ...errors]);
  };

  useEffect(() => {
    // const namespace = "registry";
    const rooms = [];
    // getItems(category)
    connection
      .request({
        path: `/api/registry/${category}`,
        type: "read",
      })
      .then((items) => {
        createUpdate({ meta: { category }, payload: items });

        // rooms.push(connection.nameRoom({context, category, id}))
        items.forEach((i) => rooms.push(`${category}:${i.id}`));

        connection.subscribe({
          category,
          context: "registry",
          // namespace,
          rooms,
          // onCreateUpdate: createUpdate,
          // onDelete: delete_,
        });
      })
      .catch((err) => {
        appendError(err, "loading resources");
      });

    return () => {
      connection.unsubscribe({
        // namespace,
        rooms,
      });
    };
  }, []);



  // Table columns
  const selectRelationalField = (relationCategory, id, field) =>
    registry?.[relationCategory]?.itemsMap[id]?.[field]
  const columns = defineTableColumns({ selectRelationalField });

  if (enableActions) {
    const editRowFn = onEdit;
    const deleteRowFn = (rowId) => {
      if (!(rowId in deletingIds)) {
        setDeletingIds([...deletingIds, rowId]);
      }

      deleteOneItem(category, rowId)
        // io.request({
        //   method: 'delete',
        //   path: `/api/registry/${category}/${rowId}`,
        // })
        .then(() => delete_({ meta: { category }, payload: rowId }))
        .catch((err) => appendError(err, `deleting ID ${rowId}`))
        .finally(() => setDeletingIds(deletingIds.filter((id) => id !== rowId)));
    };
    const RowActions = createRowActions({
      editRowFn,
      deleteRowFn,
      deletingIds,
    });
    columns.unshift(defineActionsGridCol(RowActions));
  }

  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Box display="flex" justifyContent="space-between" px={1}>
        {errors.length === 0 ? (
          <Typography sx={{ mb: 1 }}>
            Number of {category}: {items.length}
          </Typography>
        ) : (
          <Typography color="error" sx={{ mb: 1 }}>
            {errors[0]}
            {/* {errors.length > 1 && (
              <Box component="span" ml={4}>
                | Total errors: {errors.length}
              </Box>
            )} */}
          </Typography>
        )}
      </Box>
      <Box flex="1" minHeight="15rem">
        <DataGrid columns={columns} rows={items} />
      </Box>
    </Box>
  );
}

export default DataTableView;
