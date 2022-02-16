import React from "react";

import RegistryView from "./RegistryView";
import StructureForm from "components/forms/registry/StructureForm";

function defineColumns() {
  return [
    {
      field: "id",
      disableColumnMenu: true,
      headerName: "Structure ID",
      headerAlign: "left",
      sortable: false,
      width: 130,
    },
    { field: "name", headerName: "Name", width: 200 },
    { field: "type", headerName: "Type", width: 200 },
    {
      field: "materials",
      headerName: "Materials",
      valueFormatter: ({ value }) =>
        value?.length > 0 ? value.join(", ") : "",
      width: 280,
    },
  ];
}

export default function Structures() {
  return (
    <RegistryView
      category="structures"
      defineTableColumns={defineColumns}
      ItemForm={StructureForm}
    />
  );
}
