import { format } from "date-fns";
import React from "react";

import RegistryView from "./RegistryView";
import ReportForm from "components/forms/registry/ReportForm";

function defineColumns({ selectRelationalField }) {
  const formatDate = ({ row }) => format(new Date(row.date), "yyyy-MM-dd");
  const getStructureName = (params) => {
    const sid = params.row.structure_id;
    const idText = `ID ${sid}`;
    const value = selectRelationalField('structures', sid, 'name');
    
    return value ? `${value} - ${idText}`: idText
  };

  return [
    {
      field: "id",
      headerName: "Report ID",
      align: "center",
      disableColumnMenu: true,
      sortable: false,
      width: 100,
    },
    { field: "type", headerName: "Type", width: 120 },
    {
      field: "structure",
      headerName: "Structure",
      valueGetter: getStructureName,
      width: 200,
    },
    {
      field: "date",
      headerName: "Date",
      type: "date",
      valueFormatter: formatDate,
      width: 140,
    },
    { field: "title", headerName: "Title", width: 200 },
    {
      field: "description",
      headerName: "Description",
      disableColumnMenu: true,
      sortable: false,
      width: 250,
    },
  ];
}

export default function Reports() {
  return (
    <RegistryView
      category="reports"
      defineTableColumns={defineColumns}
      ItemForm={ReportForm}
    />
  );
}
