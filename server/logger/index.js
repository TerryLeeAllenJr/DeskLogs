var winston = require('winston');

winston.emitErrs = true;

var tsFormat = function(){return (new Date()).toLocaleTimeString()};
var logDir = 'logs';
var env = process.env.NODE_ENV || 'development';


var Logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            timestamp: tsFormat,
            handleExceptions: true,
            humanReadableUnhandledException: true,
            colorize: true,
            prettyPrint: true,
            level: 'debug'
        }),
        new (winston.transports.File)({
            level: 'warning',
            filename: logDir + '/all-logs.log',
            handleExceptions: true,
            humanReadableUnhandledException: true,
            json: true,
            maxsize: 5242880,
            maxFiles: 5,
            colorize: false
        })
    ]
});
Logger.stream = {
    write: function(message,encoding){
        logger.info(message);
    }
};

module.exports = Logger;