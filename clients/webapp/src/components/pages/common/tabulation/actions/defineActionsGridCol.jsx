export default function defineActionsGridCol({ RowActions, width = 220 }) {
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
    width,
  };
}
