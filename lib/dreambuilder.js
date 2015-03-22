var express = require('express');
var path = require('path');
var http = require('http');
var JiraApi = require('jira').JiraApi;

var config = require('../config');

var jiraIssueType = "Incident Report";
var regionsSelected = [ 'use', 'usw' ];

exports.startEndpoint = function() {
    var app = express();

    // all environments
    app.set('port', 5432); // TODO: 5432 should come from a config file
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'html');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.methodOverride());
    app.use(express.cookieParser('your secret here'));
    app.use(express.session());
    app.use(app.router);
    //app.use(require('less-middleware')({ src: path.join(__dirname, 'public') }));
    app.use(express.static(path.join(__dirname, 'public')));

    // development only
    if ('development' == app.get('env')) {
        app.use(express.errorHandler());
    }

    app.all('/', this.index);
    app.all('/physics', this.physics);
    
    app.post('/webhook', this.webhook); // TODO: path should come from a config file
    var server = http.createServer(app).listen(app.get('port'), function() {
        console.log('Dreambuilder Webhook server listening on port ' + app.get('port'));
    });
}

/**
 * This function takes an object, and returns a stringify version of it, in a jira markup code block.
 */ 
function jiraFormattedJson(data) {
    return "{code:javascript|borderStyle=solid|title=JSON received from Dreambuilder}\n" + 
            JSON.stringify(data, null, 2) + "\n{code}\n";
}

exports.index = function(req, res) {
    res.json('');
}

exports.physics = function(req, res) {
    res.json({message: 'dreambuilder is ready.'});
}

exports.webhook = function(req, res) {
    var resMsg = "post processed";
    var messages = req.body.messages;
    var summary;
    var emailAssignee = null;
    
    console.log(JSON.stringify(req.body, null, 2));
    
    if (messages) {
        for (var i = 0; i < messages.length; i++) {
            var message = messages[i];
            if (message.type == 'incident.resolve') {
                console.log(message.data);
                if (message.data.incident.resolved_by_user) {
                    console.log('Event is resolved by a user')
                } else {
                  var pageId = message.data.incident.incident_number;
                  incident_message = 'Incident Number:' + pageId +'has been resolved by Sensu API';
                  updateJiraById(pageId, incident_message, function(err, data) {
                      var msg = err ? err : 'issue ' + data.id + ',' + data.d;
                      console.log('post jira issue update: incident, ' + pageId + ', ' + msg);
                  });
                }
            } else {
                console.log('this not not a resolve event');
            }
            if (message.type == 'incident.trigger') {
                // open JIRA ticket
                if (message.data && message.data.incident.assigned_to_user) {
                    emailAssignee = message.data.incident.assigned_to_user.email;
                    console.log("Email assignee is: " + emailAssignee);
                } else {
                    console.log("Could not determine email of incident assignee");
                }
                if (message.data && message.data.incident) {
                    description = "\nIncident Number : " + message.data.incident.incident_number + 
                                "\nTrigged on: " + message.data.incident.created_on + 
                                "\nDetailed Dreambuilder URL: " + message.data.incident.trigger_details_html_url + 
                                "\nAssigned to: " + message.data.incident.assigned_to_user.email + 
                                "\n" + jiraFormattedJson(message) + "\n";
                    summary = message.data.incident.service.name + ": ";
                    if (message.data.incident.service.name.indexOf ("Vinnie") > -1) {
                        summary +=  message.data.incident.trigger_summary_data.description;
                    } else {
                        if (message.data.incident.trigger_summary_data.SERVICEDESC) {
                            summary = message.data.incident.trigger_summary_data.SERVICEDESC;
                        } else {
                            summary += message.data.incident.incident_key;   
                        }
                    }
                } else {
                    summary = "Dreambuilder Alert";
                    // TODO: not sure here why we are both pre-prending and appending the description
                    description += "Incident triggered by Dreambuilder\n----" + description;
                }
                createJIRA(emailAssignee, summary, description);
                console.log("Service not matched: ");
            } // trigger 
        }
    } else {
        console.log("No messages received", req.body);
        resMsg = "Didn't receive messages";
    }

    res.send(resMsg);
}

function createJIRA(emailAssignee, summary, description) {
    console.log("Opening JIRA incident (" + config.jira.projectKey + ")");
    var jira = new JiraApi('http', config.jira.host, config.jira.port, config.jira.username, config.jira.password,'2',true);
    // In the following field list customfield_11406 represents "Incident Type" field which is required for a SIM ticket
    var fields = {
        "fields": {
            "project": {
                "key": config.jira.projectKey
            },
            "summary": summary,
            "description": description,
            "components": [
            {
                "name":"Undefined"
            }
            ],
            "customfield_11406": [
            {
                "value":"Unknown"
            }
            ],
            "issuetype":{
                "name":jiraIssueType
            }
        }
    };

    // insert the assignee if email specified
    if (emailAssignee)  {
        var jirausername = config.jira.username;
        jira.searchUsers(emailAssignee,0,1,true,false,function(error,result){
            if (!error) {
                var jirausersearchresults = result;
                console.log('jira user search results');
                console.log(jirausersearchresults);
                if (jirausersearchresults.length > 0 && jirausersearchresults[0].name) {
                    jirausername = jirausersearchresults[0].name;
                    console.log("Jira Username to Assign To : ",jirausername);
                }
                fields.fields.assignee = {name: jirausername, emailAddress: emailAssignee};
            } else {
                console.log("Error occured while searching for users :",error);
            }
            console.log(JSON.stringify(fields));
            CreateJiraTicket(jira,fields);
        });
    } else {
        fields.fields.assignee = {name: config.jira.username};
        console.log(JSON.stringify(jira,fields));
        CreateJiraTicket(jira,fields);
    }
}

function CreateJiraTicket(jira,fields)
{
    //console.log("CreateJiraTickets: fields are:" + JSON.stringify(fields, null, 2));
    jira.addNewIssue(fields, function(error, response) {
        if (error) {
            console.log(error);
        } else {
            console.log('Status: ' + JSON.stringify(response, null, 2));
        }
    });
}

function addGraphsToJira(jira) {


}

function updateJiraById(number, comment, callback) {
    console.log('Updating JIRA incident ' + number);
    var jira = new JiraApi('http', config.jira.host, config.jira.port, config.jira.username, config.jira.password,'2',true);
    var jql = 'description ~ "Incident Number : ' + number + '"';
    jira.searchJira(jql, {}, function(err, data) {
        if (err) {
            callback(err);
            return;
        }
        
        if (!data.issues.length) {
            callback('no issue found: ' + number);
            return;
        }
 
        var issue = data.issues[0];
        jira.addComment(issue.id, comment, function(err, data) {
            if (err) {
                callback(err);
            } else {
                callback(null, {'id': issue.id, 'd': data});
            }
        });
    });
}

