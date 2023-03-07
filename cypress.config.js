const { defineConfig } = require("cypress");

const mysql = require("mysql");

function queryTestDb(query, config) {
  const connection = mysql.createConnection(config.env.db);
  connection.connect();
  return new Promise((resolve, reject) => {
    connection.query(query, (error, results) => {
      if (error) reject(error);
      else {
        connection.end();
        return resolve(results);
      }
    });
  });
}

module.exports = defineConfig({
  e2e: {
    projectId: "b4uxft",
    setupNodeEvents(on, config) {
      require("cypress-localstorage-commands/plugin")(on, config);
      return (
        config,
        on("task", {
          queryDb: (query) => {
            return queryTestDb(query, config);
          },
        })
      );
      // implement node event listeners here
    },
    baseUrl: "http://localhost:3000",
    watchForFileChanges: false,
    chromeWebSecurity: false,
    defaultCommandTimeout: 6000,
    responseTimeout: 30000,
    requestTimeout: 30000,
    viewportWidth: 1920,
    viewportHeight: 1080,
  },
  env: {
    MAILSLURP_API_KEY:
      "8b46b120da6f4036071854bc6a3eed8031e612c9ba5a593645d6b6621f1f6291",
    db: {
      host: "localhost",
      user: "root",
      password: "password",
      database: "datamundi",
    },
  },
});
