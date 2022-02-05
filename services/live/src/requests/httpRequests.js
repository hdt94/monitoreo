const { URL } = require('url');

const fetch = require('node-fetch');

const HTTPResponseError = require('./errors/HTTPResponseError');

function __fetch(path, options = {}) {
  const api = new URL(path, process.env.GATEWAY_HOST);

  return fetch(api, options)
    .then((res) => {
      if (res.ok) {
        return res.json();
      }

      throw new HTTPResponseError(res);
    })
    .catch((err) => {
      // TODO parse `err instanceof TypeError`
      throw err;
    });
}

function __get({ options = null, path, queryParams = null }) {
  // `options` should be used for any other than `method`
  if (options === null && queryParams == null) {
    return __fetch(path);
  }

  if (queryParams === null) {
    return __fetch(path, options);
  }

  const params = new URLSearchParams();
  Object.entries(queryParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v));
    } else {
      params.append(key, value);
    }
  });

  return __fetch(`${path}?${params.toString()}`, options || {});
}

function __delete({ path }) {
  return __fetch(path, { method: 'DELETE' });
}

function __post({ path, body }) {
  return __fetch(path, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

function __put({ path, body }) {
  return __fetch(path, {
    method: 'PUT',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

module.exports = {
  __delete,
  __get,
  __post,
  __put,
};
