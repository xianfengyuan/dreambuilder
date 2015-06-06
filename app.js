var express = require('express'),
    path = require('path'),
    http = require('http'),
    hbs = require('express-handlebars'),
    story = require('./react/story'),
    config = require('./config').story;

var app = express();

app.set('port', process.env.PORT || 8089);
app.engine('html', hbs({
  defaultLayout: 'layout',
  layoutsDir: 'views',
  extname: '.html'
}));
app.set('view engine', 'html');
app.disable('etag');
app.use("/", express.static(__dirname + "/public/"));

app.all('/', story.index);
['physics', 'events', 'donate', 'welcome'].forEach(function(e) {
  app.get('/'+e, story[e]);
});

var server = http.createServer(app).listen(app.get('port'), function() {
  console.log('Dreambuilder Webhook server listening on port ' + app.get('port'));
});
