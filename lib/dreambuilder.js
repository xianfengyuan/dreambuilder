var express = require('express');
var path = require('path');
var http = require('http');
var hbs = require('express-handlebars');

var config = require('../config');

exports.startEndpoint = function() {
  var app = express();

  app.use("/", express.static(__dirname + "/public/"));
  app.set('port', config.dreambuilder.port);
  app.engine('html', hbs({
    defaultLayout: 'layout',
    layoutsDir: 'views',
    extname: '.html'
  }));
  app.set('view engine', 'html');
  app.disable('etag');

  app.all('/', this.index);
  app.all('/physics', this.physics);
  
  var server = http.createServer(app).listen(app.get('port'), function() {
    console.log('Dreambuilder Webhook server listening on port ' + app.get('port'));
  });
}

exports.index = function(req, res) {
    res.render('shareyourstory', {title: 'Share Your Story', layout: 'shareyourstory'});
}

exports.physics = function(req, res) {
    res.json({message: 'dreambuilder is ready.'});
}
