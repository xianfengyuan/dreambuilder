var fs = require('fs');
  
function detectRunningProd() {
    return fs.existsSync("/etc/motd") && fs.readFileSync("/etc/motd", "utf8").indexOf("OpsWorks Stack: moshpit-prod") > 1;
}

// we export the value, not the function: no need to evaluate it more than once
exports.isRunningInProd = detectRunningProd(); 

// jira credentials and project key
exports.jira = {
    host: "jira.sheermount.com",
    port: "80",
    username: "dreambuilder",
    password: "dream123",
    projectKey: exports.isRunningInProd ? "SIM": "DSIM"
};
