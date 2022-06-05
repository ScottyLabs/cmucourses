const withTM = require('next-transpile-modules')(['passlink']);
const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');

module.exports = (phase, defaultConfig) => withTM({
  env: {
    backendUrl: phase === PHASE_DEVELOPMENT_SERVER ? 'http://localhost:3000' : 'https://beta.course.apis.scottylabs.org'
  },
});
