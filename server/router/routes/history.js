/**
 * history.js: Routing for the /deskLogs/ endpoint.
 * @type {*|exports}
 */

var q = require('q');
var express = require('express');
var router = express.Router();
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


router.get('/',function(req,res){
});
router.get('/:sso',function(req,res){
});

/* Remove these once complete. Here to have copypasta abilities.
router.post('/lists', function (req, res) {
    execute(deskLogs.createList, req.body, res);
});


router.delete('/lists/:id/:sso', function (req, res) {
    execute(deskLogs.deleteList, {_id:req.params.id, sso: req.params.sso}, res);
});
*/

module.exports = router;