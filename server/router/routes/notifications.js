/**
 * desklogs.js: Routing for the /deskLogs/ endpoint.
 * @type {*|exports}
 */

var q = require('q');
var express = require('express');
var router = express.Router();
var deskLogs = require('../../modules/deskLogs');
var logger = require('../../logger');
var notifications = require('../../modules/notifications');

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



router.post('/global',function (req,res){
    execute(notifications.sendGlobalNotification, req.body, res);
});






module.exports = router;