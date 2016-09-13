/**
 * login.js: Routing for the /signup/ endpoint.
 * @type {*|exports}
 */

var express = require('express');
var router = express.Router();
var auth = require('../../modules/auth');
var logger = require('../../logger');

router.post('/createJSONWebToken',function(req,res){
    auth.createJSONWebToken(req.body)
        .then(function(data){
            res.status(200).json({status:true, data:data});
        })
        .catch(function(err){
            res.status(200).json({status:false, data: err});
        });
});

router.post('/verifyJSONWebToken',function(req,res){
    auth.verifyJSONWebToken(req.body)
        .then(function(data){
            res.status(200).json({status:true, data:data});
        })
        .catch(function(err){
            logger.error(status.data);
            res.status(200).json({status:false, data: err});
        });
});

router.post('/getUserData',function(req,res){
    auth.getUserData(req.body.sso)
        .then(function(userData){ res.status(200).json(userData);})
        .catch(function(err){
            res.status(200).json({status:false, data: err});
        });
});

module.exports = router;