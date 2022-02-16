import connection from './connection';
import { __fetch, __get } from './http';


export function deleteOneItem(resources, id) {
  const url = `/api/registry/${resources}/${id}`;

  return __fetch(url, { method: 'DELETE' });
}

export function getOneItem(resources, id) {
  const url = `/api/registry/${resources}/${id}`;

  return __fetch(url);
}

export function getItems(resources, options = {}) {
  const path = `/api/registry/${resources}`;

  return __get({
    path,
    queryParams: options?.queryParams,
  });
}

export function getMeasures({ createUpdate, structureId }) {
  const category = 'measures'

  return connection
    .request({
      path: `/api/registry/${category}/`,
      queryParams: { structure_id: structureId },
      type: 'read',
    }).then(items => {
      if (createUpdate && items.length > 0) {
        createUpdate({ meta: { category }, payload: items });
      }

      return Promise.resolve(items);
    });
}
