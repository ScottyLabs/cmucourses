const withTM = require('next-transpile-modules')(['passlink']);

module.exports = withTM({
  env: {
    backendUrl: 'https://beta.course.apis.scottylabs.org'
  },
});
