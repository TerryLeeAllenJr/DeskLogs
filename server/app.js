var express = require('express');
var app = express();
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var logger = require('./logger');

//app.use(require('morgan')( 'combined',{"stream": logger.stream} ));

app.use(favicon(path.join(__dirname, 'dist', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.set('view engine', 'ejs');

/* Development Settings */
if (app.get('env') === 'development') {
    logger.debug('Development machine started');
    app.use(express.static(path.join(__dirname, '../client')));
    app.use(express.static(path.join(__dirname, '../client/.tmp')));
    app.use(express.static(path.join(__dirname, '../client/app')));
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

/* Production Settings */
if (app.get('env') === 'production') {
    logger.debug('Production machine started');
    app.use(express.static(path.join(__dirname, '/dist')));
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    });
}

/* Routes */
var router = require('./router')(app);


module.exports = app;