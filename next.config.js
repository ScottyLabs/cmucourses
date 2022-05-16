const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');
const withTM = require('next-transpile-modules')(['passlink']);

module.exports = (phase, { defaultConfig }) => withTM( {});
