var fs = require('fs');
  
// jira credentials and project key
exports.jira = {
    host: "jira.sheermount.com",
    port: "80",
    username: "dreambuilder",
    password: "dream123",
    projectKey: exports.isRunningInProd ? "SIM": "DSIM"
};
