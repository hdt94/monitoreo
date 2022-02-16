// import defineActionsGridCol from "components/pages/common/tabulation/actions/defineActionsGridCol"

export default function defineTableColumns({ context }) {
  const getTemplateValue = (params) => {
    const { template: templateId } = params.row;
    const template = context?.templates?.entities[templateId];
    const idText = `ID ${templateId}`

    if (template) {
      return `${template.name} v${template.version} - ${idText}`;
    }

    return idText;
  }

  return [
    {
      field: "id",
      headerName: "Execution ID",
      disableColumnMenu: true,
      sortable: false,
      width: 200,
    },
    {
      field: "requestType",
      headerName: "Request type",
      width: 180
    },
    {
      field: "createdAt",
      headerName: "Created at",
      width: 220
    },
    {
      field: "userId",
      headerName: "Author",
      // disableColumnMenu: true,
      width: 200,
    },
    {
      field: "template",
      headerName: "Template",
      valueGetter: getTemplateValue,
      width: 200,
    },
  ];
}
