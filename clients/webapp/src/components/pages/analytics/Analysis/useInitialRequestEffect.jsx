import { useEffect, useState } from "react";

import { useAnalytics } from "components/contexts/analytics";
import {
  getGrafanaDashboards,
} from "services/analytics";
import { getCategoryItems } from "services/items";

export default function useInitialRequestEffect({ onError, tags }) {
  const { createUpdate } = useAnalytics();
  const [requested, setRequested] = useState(false);
  const [dashboards, setDashboards] = useState([]);

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

    Promise.all(promises).finally(() => setRequested(true))
  }, []);

  return { dashboards, requested }
}