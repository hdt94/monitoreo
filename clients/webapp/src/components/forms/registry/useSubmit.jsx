import { useState } from 'react';

import { useConnection } from 'components/contexts/connection';

export default function useSubmit({ category, http, item, onSubmitted }) {
  const { connectionRef } = useConnection();
  const [saving, setSaving] = useState(false);
  const submitFn = (body) => {
    setSaving(true);
    const subdomain = 'registry';
    const connection = connectionRef.current;
    const updating = Boolean(item);

    const meta = {
      category,
      context: 'registry',
    };
    const path = `/api/${subdomain}/${category}`;
    const request = updating
      ? {
          body,
          meta,
          path: `${path}/${item.id}`,
          room: `/${subdomain}/${category}/${item.id}`,
          type: 'update',
        }
      : {
          body,
          meta,
          path,
          room: `/${subdomain}/${category}`,
          type: 'create',
        };
    const promise = http && updating === false
      ? connection.requestWithHttp(request)
      : connection.request(request);

    // request
    // Error
    // const request = http ? connector.requestWithHttp : connector.request;
    // request({
    //   body: body,
    //   path: `/api/registry/${category}`,
    //   type: item ? "update" : "create"
    // })
    promise
      .then((data) => {
        setSaving(false);
        onSubmitted({ data });
      })
      .catch((error) => {
        setSaving(false);
        onSubmitted({ error });
      });
  };

  return { saving, submitFn };
}
