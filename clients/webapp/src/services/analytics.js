import connection from './connection';

export function getMonitoringExecutions({ templateId }) {
  return connection.request({
    path: '/api/analytics/executions/',
    queryParams: {
      requestType: 'job',
      templateId,
    },
    type: 'read',
  });
}

export function getGrafanaDashboards({ tags }) {
  return connection.request({
    path: '/api/grafana/search/',
    options: {
      headers: {
        'X-Grafana-Org-Id': 2,
      },
    },
    queryParams: {
      tag: tags,
      type: 'dash-db',
    },
    type: 'read',
  });
}

export function getJobs() {
  return connection.request({
    path: '/api/analytics/jobs',
    type: 'read',
  })
}

export function getTemplates() {
  return connection.request({
    path: '/api/analytics/templates',
    type: 'read',
  })
}

export async function cancelJob({ accessToken, jobId }) {
  const request = {
    meta: {
      category: 'jobs',
      context: 'analytics',
    },
    options: {
      headers: { 'X-Access-Token': accessToken },
    },
    path: `/api/analytics/jobs/${jobId}/cancel`,
    room: `/analytics/jobs/${jobId}`,
    type: 'create',
  };

  const response = await connection.request(request);

  return response;
}

export async function createJob({ accessToken, body }) {
  const request = {
    body,
    meta: {
      category: 'jobs',
      context: 'analytics',
    },
    options: {
      headers: { 'X-Access-Token': accessToken },
    },
    path: '/api/analytics/jobs/',
    room: '/analytics/jobs',
    type: 'create',
  };

  const response = await connection.request(request);

  return response;
}

export async function requestExecution({ accessToken, body }) {
  const request = {
    body,
    meta: {
      category: 'executions',
      context: 'analytics',
    },
    options: {
      headers: { 'X-Access-Token': accessToken },
    },
    path: '/api/analytics/executions',
    room: '/analytics/executions',
    type: 'create',
  };

  const response = await connection.request(request);

  return response;
}
