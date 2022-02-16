import React from "react";
import { useNavigate } from "react-router-dom";

import RegistryView from "./RegistryView";

function defineTableColumns({ selectRelationalField }) {
  const createGetter = (fieldId, relationCategory, relationField) => (params) => {
    const id = params.row[fieldId];
    const idText = `ID ${id}`;
    const value = selectRelationalField(relationCategory, id, relationField);
    
    return value ? `${value} - ${idText}`: idText
  };

  return [
    {
      field: "id",
      headerName: "Analysis ID",
      disableColumnMenu: true,
      sortable: false,
      width: 130,
    },
    { field: "title", headerName: "Title", width: 200 },
    {
      field: "measures_id",
      headerName: "Measures",
      valueGetter: createGetter("measures_id", "measures", "title"),
      width: 220,
    },
    { field: "type", headerName: "Type", width: 200 },
    {
      field: "params",
      headerName: "Parameters",
      valueFormatter: ({ row }) =>
        row.params instanceof String ? row.params : JSON.stringify(row.params),
      width: 300,
    },
  ];
}

function Analyses() {
  const navigate = useNavigate();

  const onCreate = () => {
    navigate("/analytics/analysis");
  };
  const onEdit = (id) => {
    navigate(`/analytics/analysis/${id}`);
  };

  return (
    <RegistryView
      category="analyses"
      {...{ defineTableColumns, onCreate, onEdit }}
    />
  );
}

export default Analyses;
