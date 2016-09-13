/**
 * api.js: Routing for the /api/ endpoint.
 * @type {*|exports}
 */

var express = require('express');
var router = express.Router();
var intake = require('../../modules/intake');

router.post('/validUsers',function(req,res){
    intake.initValidUsers()
        .then(function(data){ res.status(200).json(data); })
        .catch(function(err){ res.status(200).json(data); });
});
module.exports = router;