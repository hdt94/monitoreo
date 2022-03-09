import connection from './connection';

export function deleteOneItem({ accessToken, category, id, subdomain }) {
  const meta = {
    category,
    context: subdomain,
  };
  const room = `/${subdomain}/${category}/${id}`;
  const path = `/api${room}`;
  const options = {
    headers: { 'X-Access-Token': accessToken },
  };

  return connection.request({ meta, type: 'delete', options, path, room });
}

export function getCategoryItems({ category, createUpdate, subdomain, }) {
  return connection
    .request({
      path: `/api/${subdomain}/${category}`,
      type: 'read',
    })
    .then((response) => {
      if (typeof response === 'undefined') {
        throw new Error(
          `Invalid successful items response with no data`);
      }

      const data = response?.data || response;
      const items = Array.isArray(data) ? data : [data];

      if (createUpdate) {
        createUpdate({ meta: { category }, payload: items });
      }

      return Promise.resolve(items);
    })
    .catch((response) => {
      const error = response?.error || response;

      return Promise.reject(error);
    })
}

export function writeOneItem({ accessToken, body, category, http, id, subdomain }) {
  const updating = Boolean(id);

  const options = {
    headers: { 'X-Access-Token': accessToken },
  };
  const meta = {
    category,
    context: subdomain,
  };
  const path = `/api/${subdomain}/${category}`;
  const request = {
    body,
    meta,
    options,
    ...(updating
      ? {
        path: `${path}/${id}`,
        room: `/${subdomain}/${category}/${id}`,
        type: 'update',
      }
      : {
        path,
        room: `/${subdomain}/${category}`,
        type: 'create',
      })
  };

  const promise = http && updating === false
    ? connection.requestWithHttp(request)
    : connection.request(request);

  return promise;
}
