/**
 * feedback.js: Routing for the /feedback/ endpoint.
 * @type {*|exports}
 */

var express = require('express');
var router = express.Router();
var feedback = require('../../modules/feedback');

router.post('/',function(req,res){

    feedback.createFeedback(req.body)
        .then(function(data){ res.status(200).json({status: true, data:data }); })
        .catch(function(err){ res.status(200).json({status: false, data:err }); });

});



module.exports = router;