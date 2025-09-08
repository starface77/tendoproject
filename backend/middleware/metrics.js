const client = require('prom-client');

/**
 * 📈 Prometheus Metrics Middleware
 */
client.collectDefaultMetrics();

const httpRequestHistogram = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5]
});

const metricsMiddleware = (req, res, next) => {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1e9; // seconds
    const route = req.route && req.route.path ? req.route.path : req.originalUrl.split('?')[0];
    httpRequestHistogram
      .labels(req.method, route, String(res.statusCode))
      .observe(duration);
  });
  next();
};

const metricsHandler = async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
};

module.exports = { metricsMiddleware, metricsHandler };


