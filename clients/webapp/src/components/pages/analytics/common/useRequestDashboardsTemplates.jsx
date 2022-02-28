import { useEffect, useState } from "react";

import { useAnalytics } from "components/contexts/analytics";
import {
  getGrafanaDashboards,
} from "services/analytics";
import { getCategoryItems } from "services/items";

export default function useRequestDashboardsTemplates({ onError, tags }) {
  const { createUpdate } = useAnalytics();
  const [dashboards, setDashboards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const promises = [
      getGrafanaDashboards({ tags })
        .then(setDashboards)
        .catch(onError),
      getCategoryItems({
        category: 'templates',
        createUpdate,
        subdomain: 'analytics'
      }).catch(onError),
    ];

    Promise.all(promises).finally(() => setLoading(false))
  }, []);

  return { dashboards, loading }
}
