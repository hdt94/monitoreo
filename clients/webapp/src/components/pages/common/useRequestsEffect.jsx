import { useEffect } from 'react';

import { getCategoryItems } from "services/items";

export default function useRequestsEffect({
  categories,
  createUpdate,
  onError,
  subdomain
}) {
  useEffect(() => {
    const promises = categories.map(category =>
      getCategoryItems({ category, createUpdate, subdomain, })
        .catch((error) => {
          onError(error, `loading "${category}"`)
          return Promise.resolve();
        })
    );
    (async () => await Promise.all(promises))();
  }, []);
}
