import React from "react";

import RegistryView from "./RegistryView";
import InstrumentsForm from "components/forms/registry/InstrumentsForm";

function defineColumns() {
  return [
    { field: "id", headerName: "ID" },
    { field: "name", headerName: "Name", width: 180 },
    { field: "manufacturer", headerName: "Manufacturer", width: 180 },
    { field: "type", headerName: "Type", width: 160 },
    {
      field: "createdAt",
      headerName: "Creation date",
      width: 200,
      // type: 'number',
      // width: 90,
    },
    // {
    //   field: 'createdAt',
    //   headerName: 'Creation date',
    //   description: 'This column has a value getter and is not sortable.',
    //   width: 160,
    //   valueGetter: (params) =>
    //     `${params.getValue(params.id, 'firstName') || ''} ${
    //       params.getValue(params.id, 'lastName') || ''
    //     }`,
    // },
  ];
}

export default function Instruments() {
  return (
    <RegistryView
      category="instruments"
      defineTableColumns={defineColumns}
      ItemForm={InstrumentsForm}
    />
  );
}
