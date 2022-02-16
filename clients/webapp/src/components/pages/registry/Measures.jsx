import React from "react";

import RegistryView from "./RegistryView";
import MeasuresForm from "components/forms/registry/MeasuresForm";

function defineColumns({ selectRelationalField }) {
  const dataSourceGetter = (key) => (params) => {
    return "data_source" in params.row ? params.row.data_source[key] : undefined;
  };
  const relationGetter = (fieldId, relationCategory, relationField) => (params) => {
    const id = params.row[fieldId];
    if (!id) {
      return null;
    }

    const idText = `ID ${id}`;
    const value = selectRelationalField(relationCategory, id, relationField);

    return value ? `${value} - ${idText}` : idText
  };

  return [
    {
      field: "id",
      headerName: "Measures ID",
      disableColumnMenu: true,
      sortable: false,
      width: 200,
    },
    { field: "title", headerName: "Title", width: 200 },
    {
      field: "structures",
      headerName: "Structure",
      valueGetter: relationGetter("structure_id", "structures", "name"),
      width: 180,
    },
    {
      field: "instruments",
      headerName: "Instruments",
      valueGetter: relationGetter("instruments_id", "instruments", "name"),
      width: 200,
    },
    { field: "data_source_type", headerName: "Source type", width: 200 },
    {
      field: 'data_source_type2',
      valueGetter: dataSourceGetter("type"),
      headerName: "Source type 2",
      width: 200,
    },
    {
      field: "time_start",
      headerName: "Time start",
      width: 240,
    },
    {
      field: "time_end",
      headerName: "Time end",
      width: 240,
    },
    // {
    //   field: "time_duration_in_seconds",
    //   headerName: "Duration [seconds]",
    //   width: 240,
    // },
    // {
    //   field: "report_id",
    //   headerName: "Report",
    //   valueGetter: relationGetter("report_id", "reports", "title"),
    //   width: 180,
    // },
  ];
}

export default function Measures() {
  return (
    <RegistryView
      category="measures"
      defineTableColumns={defineColumns}
      ItemForm={MeasuresForm}
    />
  );
}
