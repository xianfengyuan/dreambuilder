var express = require('express');
var path = require('path');
var http = require('http');
var hbs = require('hbs');

var config = require('../config');

exports.startEndpoint = function() {
    var app = express();

    // all environments
    app.set('port', config.dreambuilder.port); // TODO: 80 should come from a config file
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'html');
    app.engine('html', hbs.__express);

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
