/**
 * users.js: Routing for the /users/ endpoint.
 * @type {*|exports}
 */

var express = require('express');
var router = express.Router();
var auth = require('../../modules/auth');
var users = require('../../modules/users');
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


router.post('/',function(req,res){
    execute(auth.updateUser, req.body, res); // TODO: move to users module.
});

router.post('/preferences',function(req,res){
    execute(auth.updatePreferences, req.body, res); // TODO: move to users.
});

router.get('/',function(req,res){
    execute(users.findUsers, null, res);
});

module.exports = router;