
import defineActionsGridCol from "components/pages/common/tabulation/actions/defineActionsGridCol"
import getterRelationalField from "components/pages/common/tabulation/getterRelationalField";


// function defineTableColumns({ context }) {
export default function defineTableColumns({ RowActions }) {
  return [
    defineActionsGridCol({ RowActions }),
    {
      field: "id",
      headerName: "Job ID",
      disableColumnMenu: true,
      sortable: false,
      width: 200,
    },
    { field: "name", headerName: "Name", width: 220 },
    {
      field: "currentState",
      headerName: "Current state",
      // disableColumnMenu: true,
      width: 200,
    },
    {
      field: "executionId",
      headerName: "Execution",
      disableColumnMenu: true,
      sortable: false,
      width: 200,
    },

    // {
    //   headerName: "Execution ID",
    //   valueGetter: getterRelationalField({
    //     context,
    //     ownIdField: "execution_id",
    //     relation: { category: "executions", field: "user_id" }
    //   }),
    //   width: 180,
    // },
  ];
}
