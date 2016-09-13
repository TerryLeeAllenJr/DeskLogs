/**
 * signup.js: Routing for the /signup/ endpoint.
 * @type {*|exports}
 */

var express = require('express');
var router = express.Router();
var auth = require('../../modules/auth');

// The POST /signup route. This reached out to the modules/auth module to handle all authentication methods.
router.post('/', function(req,res){
    auth.createUser(req.body)
        .then(function(data){ res.status(200).json(data); })
        .catch(function(err){  res.status(500).json(err); });
});

module.exports = router;