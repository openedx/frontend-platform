const path = require('path');

// Resolve ~tilda paths used in paragon to
// node_modules. This is used to reference
// bootstrap specifically.
module.exports = {
  includePaths: [
    path.resolve(__dirname, '../node_modules'),
  ],
};
