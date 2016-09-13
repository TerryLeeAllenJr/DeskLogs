/**
 * desklogs.js: Routing for the /deskLogs/ endpoint.
 * @type {*|exports}
 */

var q = require('q');
var express = require('express');
var router = express.Router();
var monitor = require('../../modules/monitor');
var logger = require('../../logger');



/**
 * Used to parse the server requests using promises.
 * @param func
 * @param data
 * @param res
 */
var execute = function (func, data, res) {
    func(data)
        .then(function (data) { res.status(200).json({status: true, data: data}); })
        .catch(function (err) {
            logger.error(err);
            res.status(200).json({status: false, data: err});
        });
};

/* Lists */
router.get('/', function (req, res) {
    //execute(monitor.getCurrentStatus, null, res);
    res.status(200).json({test:'test'});
});

module.exports = router;