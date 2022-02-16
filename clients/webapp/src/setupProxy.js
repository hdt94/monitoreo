const { createProxyMiddleware } = require('http-proxy-middleware');

const { PROXY } = process.env;
const middleware = createProxyMiddleware({
  target: PROXY,
  changeOrigin: true,
});

module.exports = function (app) {
  app.use('/api', middleware);
  app.use('/grafana', middleware);
};