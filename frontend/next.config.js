require("dotenv").config({ path: "../.env" });
const { PHASE_DEVELOPMENT_SERVER } = require("next/constants");

module.exports = (phase) => {
  return {
    env: {
      backendUrl:
        process.env.BACKEND_URL ||
        process.env.CODESPACES && `https://${process.env.CODESPACE_NAME}-3000.app.github.dev` ||
        (phase === PHASE_DEVELOPMENT_SERVER
          ? "http://localhost:3000"
          : "https://course-tool-backend-2kh6wuzobq-uc.a.run.app"),
    },
  };
}
