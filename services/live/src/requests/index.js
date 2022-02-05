const HTTPRequestError = require('./errors/HTTPRequestError');
const httpRequests = require('./httpRequests');

const httpFnMap = {
  create: httpRequests.__post,
  read: httpRequests.__get,
  update: httpRequests.__put,
  delete: httpRequests.__delete,
};

function request({ type, ...args }) {
  if (type in httpFnMap) {
    const httpFn = httpFnMap[type];
    const httpPromise = httpFn(args);

    return httpPromise;
  }

  return Promise.reject(new HTTPRequestError(`Unknown request type "${type}"`));
}

module.exports = {
  request,
};
