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

function __delete({ options, path }) {
  return __fetch(path, { ...options, method: 'DELETE' });
}

function __write({ body, method, options = {}, path }) {
  const headers = {
    ...(options.headers || {}),
    'Content-Type': 'application/json',
  };

  return __fetch(path, {
    ...options,
    body: JSON.stringify(body),
    headers,
    method,
  });
}

function __post(args) {
  return __write({ method: 'POST', ...args });
}

function __put(args) {
  return __write({ method: 'PUT', ...args });
}

module.exports = {
  __delete,
  __get,
  __post,
  __put,
};
