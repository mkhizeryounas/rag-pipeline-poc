const path = require('path');
const { Interval } = require('@interval/sdk');
const { INTERVAL_API_KEY } = require('./config');

const interval = new Interval({
  apiKey: INTERVAL_API_KEY,
  routesDirectory: path.resolve(__dirname, 'routes'),
});

interval.listen();
