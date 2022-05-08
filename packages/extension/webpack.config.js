const path = require('path');
module.exports = {
  entry: './scripts/service-worker.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'service-worker.bundle.js',
  },
};
