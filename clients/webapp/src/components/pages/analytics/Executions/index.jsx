import { useState } from "react";

import defineTableColumns from './defineTableColumns';

import { useAnalytics } from 'components/contexts/analytics';

import useErrors from "components/pages/common/useErrors";

import TabulationView from "components/pages/common/tabulation/TabulationView";
import useRequestSubscribeEffect from "components/pages/common/tabulation/useRequestSubscribeEffect";


export default function Executions() {
  const category = 'executions';
  const subdomain = 'analytics';

  const context = useAnalytics();
  const { errors, appendError } = useErrors();

  const { createUpdate, executions } = context;

  useRequestSubscribeEffect({
    category,
    createUpdate,
    onError: appendError,
    subdomain
  });


  const columns = defineTableColumns({ context });
  const rows = executions.items;

  return (
    <TabulationView
      category={category}
      columns={columns}
      errors={errors}
      rows={rows}
    />
  );
}
