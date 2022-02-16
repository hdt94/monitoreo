function ResponseError(res, payload) {
  this.status = res.status;
  this.message = res.statusText;
  this.type = 'response';

  if (payload?.message) {
    this.message += `: ${payload.message}`;
  }
}

function encodeAsFormData(body) {
  const formdata = new FormData();

  Object.entries(body).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => formdata.append(key, v));
    } else {
      formdata.append(key, value);
    }
  });

  return formdata;
}

async function getResponseErrorPayload(res) {
  const contentType = res.headers.get('content-type');
  if (contentType === null || contentType?.length === 0) {
    return {}
  }

  if (contentType.startsWith('application/json')) {
    const payload = await res.json();
    return payload;
  }

  if (contentType.startsWith('text/html')) {
    const text = await res.text();
    const results = /<pre>(?<pre>.*)<\/pre>|<h1>(?<h1>.*)<\/h1>/.exec(text);
    if (!results) return {}

    const { groups } = results;
    const message = groups?.pre || groups?.h1;
    if (message) {
      return { message }
    }

    // Unknown text content
    return {}
  }

  // Unknown content type
  return {}
}

export async function __fetch(url, options = {}) {
  try {
    const res = await fetch(url, options);
    if (res.ok) {
      const payload = await res.json();
      if (payload?.error) {
        throw new ResponseError(res, payload);
      }
      return payload;
    }

    const payload = await getResponseErrorPayload(res);
    throw new ResponseError(res, payload);
  } catch (err) {
    if (err instanceof TypeError) {
      err.message = `TypeError: ${err.message}`;
    }

    throw err;
  }
}


export function __get({ options = null, path, queryParams = null }) {
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

export function __delete({ path }) {
  return __fetch(path, { method: 'DELETE' });
}

export function __post({ path, body }) {
  const method = 'POST';

  if (body?.files?.length > 0) {
    return __fetch(path, {
      method,
      body: encodeAsFormData(body),
    });
  }

  return __fetch(path, {
    method,
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

export function __put({ path, body }) {
  return __fetch(path, {
    method: 'PUT',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}
