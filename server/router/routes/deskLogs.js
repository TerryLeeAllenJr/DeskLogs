/**
 * desklogs.js: Routing for the /deskLogs/ endpoint.
 * @type {*|exports}
 */

var q = require('q');
var express = require('express');
var router = express.Router();
var deskLogs = require('../../modules/deskLogs');
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
router.get('/lists/:date', function (req, res) {
    execute(deskLogs.getLists, req.params.date, res);
});
router.get('/lists/permanent',function(req,res){
    execute(deskLogs.getPermanentLists, null,res);
});
router.post('/lists', function (req, res) {
    execute(deskLogs.createList, req.body, res);
});
router.post('/lists/update', function (req, res) {
    execute(deskLogs.updateList, req.body, res);
});
router.post('/lists/moveLogToList', function (req, res) {
    execute(deskLogs.moveLogToList, req.body, res);
});

router.delete('/lists/:id/:sso', function (req, res) {
    execute(deskLogs.deleteList, {_id:req.params.id, sso: req.params.sso}, res);
});
router.post('/lists/updateOrder',function (req,res){
    execute(deskLogs.updateLogOrder, req.body, res);
});



/* Logs */
router.get('/logs', function (req, res) {
    execute(deskLogs.getAllLogs, {}, res);
});
router.get('/logs/:date', function (req, res) {
    execute(deskLogs.getLogs, req.params.date, res);
});
router.get('/logs/repeating/all',function(req,res){
    execute(deskLogs.getRepeatingLogs,null,res);
});
router.get('/orphans',function(req,res){
    execute(deskLogs.getOrphanedLogs,{},res);
});
router.post('/logs', function (req, res) {
    execute(deskLogs.createLog, req.body, res);
});
router.post('/logs/restore',function(req,res){
    execute(deskLogs.restoreLog,req.body,res);
});
router.post('/logs/repeating',function(req,res){
    execute(deskLogs.createRepeatingLog,req.body,res);
});
router.post('/logs/repeating/update',function(req,res){
    execute(deskLogs.updateRepeatingLog,req.body,res);
})
router.post('/logs/update', function (req, res) {
    execute(deskLogs.updateLog, req.body, res);
});

router.delete('/logs/repeating/:id',function(req,res){

    execute(deskLogs.trashRepeatingLog,req.params.id,res);
});
router.delete('/logs/trash/:id/:sso',function(req,res){
    logger.debug(req.params);
    execute(deskLogs.trashLog,req.params.id,res);
});
router.delete('/logs/:id/:sso/:date', function (req, res) {
    execute(deskLogs.deleteLog, {_id: req.params.id, sso: req.params.sso, date: req.params.date}, res);
});


/* Desks */
router.get('/desks', function (req, res) {
    execute(deskLogs.getDesks, null, res);
});
router.post('/desks/moveLogToDesk', function (req, res) {
    execute(deskLogs.moveLogToDesk, req.body, res);
});

module.exports = router;