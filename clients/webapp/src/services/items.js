import connection from './connection';

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
