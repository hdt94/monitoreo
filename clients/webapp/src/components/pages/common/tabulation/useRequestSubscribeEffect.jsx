import { useEffect } from 'react';

import { useConnection } from "components/contexts/connection";
import { getCategoryItems } from "services/items";

export default function useRequestSubscribeEffect({
  category,
  createUpdate,
  onError,
  subdomain
}) {
  const { connectionRef } = useConnection();

  useEffect(() => {
    const connection = connectionRef.current;
    const rootRoom = `/${subdomain}/${category}`;
    const rooms = [rootRoom];

    getCategoryItems({ category, createUpdate, subdomain, })
      .then((items) => {
        items.forEach((i) => rooms.push(`${rootRoom}/${i.id}`));
        connection.subscribe({ rooms });
      })
      .catch((error) => {
        onError(error, 'loading resources')
      });

    return () => {
      connection.unsubscribe({ rooms });
    };
  }, []);
}
