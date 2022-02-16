import { useState } from 'react';

import { useConnection } from 'components/contexts/connection';

export default function useSubmit({ category, http, item, onSubmitted }) {
  const { connectionRef } = useConnection();
  const [saving, setSaving] = useState(false);
  const submitFn = (body) => {
    setSaving(true);
    const subdomain = 'registry';
    const connection = connectionRef.current;

    const meta = {
      category,
      context: 'registry',
    };
    const path = `/api/registry/${category}`;
    const request = item
      ? {
          body,
          meta,
          path: `${path}/${item.id}`,
          room: `${category}:${item.id}`,
          type: 'update',
        }
      : {
          body,
          meta,
          path,
          room: `/${subdomain}/${category}`,
          type: 'create',
        };
    const promise = http
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
