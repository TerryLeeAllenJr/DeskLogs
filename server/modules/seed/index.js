var request = require('request');
var q = require('q');
var db = require('../../database');
var Desks = db.desks;
var Users = db.users;
var Lists = db.lists;
var Logs = db.logs;
var color = require('cli-color');
var logger = require('../../logger');


var Seed = {
    initApplication: function(){
        var defer = q.defer();
        console.log(color.blue('Initializing application data...'));
        clearDesks()
            .then(function(msg){
                console.log(color.yellow(msg));
                return clearLists();
            })
            .then(function(msg){
                console.log(color.yellow(msg));
                return clearLogs();
            })
            .then(function(msg){
                console.log(color.yellow(msg));
                return seedDesks();
            })
            .then(function(data){
                console.log(color.yellow(data.msg));
                return seedLists(data.desks);
            })
            .then(function(data){
                console.log(color.yellow(data.msg));
                defer.resolve('Application successfully initiated!');
            })
            .catch(function(err){ defer.reject(err); });
        return defer.promise;
    },
    fakeLogs: function(){
        var defer = q.defer();
        console.log(color.blue('Seeding Application with fake log data...'));
        clearLogs()
            .then(function(msg){
                console.log(color.yellow(msg));
                return removeAllLogsFromLists();
            })
            .then(function(msg){
                console.log(color.yellow(msg));
                return buildFakeLogs();
            })
            .then(function(msg){
                console.log(color.yellow(msg));
                return spreadLogsOverMultipleDays();
            })
            .then(function(msg){
                console.log(color.yellow(msg));
                defer.resolve('Application has been successfully seeded with fake data.');
            })
            .catch(function(err){ console.log(color.red(err)); });
        return defer.promise;
    },
    populateDailyLogs: function(group){ return populateDailyLogs(group);},
    backFillDates: function() { return backFillDates(); },
    convertNames: function(){ return convertNames(); },
    addDates: function() { return addDateToExistingLogs(); }
};



function addDateToExistingLogs(){
    var defer = q.defer();
    getAllLogs()
        .then(function(doc){
            logger.debug(doc.length);
            return q.all(doc.map(function(log){
                return updateLogDate(log);
            }));
        })
        .then(function(doc){
            logger.debug(doc.length + ' files updated')
            defer.resolve(doc);
        })
        .catch(function(err){logger.error(err); defer.reject(doc);});
    return defer.promise;
}

function getAllLogs(){
    var defer = q.defer();
    Logs.find({},function(err,doc){
        if(err){ defer.reject(err);}
        else{ defer.resolve(doc);}
    });
    return defer.promise;
}

function updateLogDate(log){
    var defer = q.defer();
    logger.debug('Updating: ' + log._id);
    Logs.findOneAndUpdate(
        { _id: log._id},
        {activeDate: log.createdAt},
        {upsert: false, new: true},
        function(err,doc){
            if(err) { defer.reject(err); }
            else{ defer.resolve(doc);}
        }
    );
    return defer.promise;
}

function convertNames(){
    var defer = q.defer();
    getLogs()
        .then(function(doc){
            return q.all(doc.map(function(log){ return findAndReplaceWithSSO(log); }))
        })
        .then(function(doc){ defer.resolve(doc); })
        .catch(function(err){ logger.error(err);});
    return defer.promise;
}


function findAndReplaceWithSSO(log){
    var defer = q.defer();
    var split = log.createdBy.split(" ");
    Users.findOne({first: split[0],last:split[1]},function(err,doc){
        if(err) { defer.reject(err); }
        else {
            Logs.findOneAndUpdate({_id: log._id},{createdBy: doc.sso},{new:true, upsert:false},function(err,doc){
                if(err) { defer.reject(err);}
                else { defer.resolve(doc);}
            });
        }
    });
    return defer.promise;
}


/**
 * Clears the Desks collection.
 * @returns {Promise.promise|*}
 */
function clearDesks(){
    var defer = q.defer();
    Desks.remove({}, function (err) {
        if (err) { defer.reject(err); }
        defer.resolve('--> Cleared the Desks collection.');
    });
    return defer.promise;
}
/**
 * Clears the Lists collection.
 * @returns {Promise.promise|*}
 */
function clearLists(){
    var defer = q.defer();
    Lists.remove({}, function(err){
        if(err) { defer.reject(err);}
        defer.resolve('--> Cleared the Lists collection.');
    });
    return defer.promise;
}
/**
 * Deletes all current logs from the Logs collection.
 * @returns {Promise.promise|*}
 */
function clearLogs(){
    var defer = q.defer();
    Logs.remove({},function(err){
        if(err) { defer.reject(err); }
        defer.resolve('--> Cleared the Logs collection.');
    });
    return defer.promise;
}
/**
 * Gets all logs from the Logs collection.
 * @returns {Promise.promise|*}
 */
function getLogs(){
    var defer = q.defer();
    Logs.find({},function(err,logs){
        if(err) { defer.reject(err); }
        defer.resolve(logs);
    });
    return defer.promise;
}
/**
 * Gets all lists in from the Lists collection
 * @returns {Promise.promise|*}
 */
function getLists(){
    var defer = q.defer();
    Lists.find({},function(err,lists){
        if(err){ defer.reject(err); }
        defer.resolve(lists);
    });
    return defer.promise;
}
/**
 * Seeds the desk collection from data/coreData.json desks object.
 * @returns {Promise.promise|*}
 */
function seedDesks(){
    var defer = q.defer();
    var data = require('./data/coreData.json');
    q.all(data.desks.map(function(desk){ return saveDesk(desk); }))
        .then(function(desks){ defer.resolve({msg:"--> Desks collection has been seeded.", desks:desks}); })
        .catch(function(err){ defer.reject(err); });
    return defer.promise;
}
/**
 * Saves a desk to the Desks collection.
 * @param desk
 * @returns {Promise.promise|*}
 */
function saveDesk(desk){
    var defer = q.defer();
    var doc = new Desks({title:desk});
    doc.save(function(err, doc){
        if(err) { defer.reject(err); }
        defer.resolve(doc);
    });
    return defer.promise;
}
/**
 * Saves a list to the Lists collection.
 * @param list
 * @returns {Promise.promise|*}
 */
function saveList(list){
    var defer = q.defer();
    list.save(function(err){
        if(err){defer.reject(err);}
        defer.resolve(true);
    });
    return defer.promise;
}
/**
 * Seeds the List collection.
 * @param desks
 * @returns {Promise.promise|*}
 */
function seedLists(desks){
    var defer = q.defer();
    q.all(desks.map(function(desk){ return createListsForDesk(desk); }))
        .then(function(lists){ defer.resolve( {msg:"--> Lists collection has been seeded.",lists:lists} );})
        .catch(function(err){ defer.reject(err); });
    return defer.promise;
}
/**
 * Builds out each list for the provided desk based on the data/coreData.json file.
 * @param desk
 * @returns {Promise.promise|*}
 */
function createListsForDesk(desk){
    var defer = q.defer();
    // Get the configured permanent lists for each desk.
    var data = require('./data/coreData.json');
    var defaultLists = data.lists[desk.title];
    // Set the default list.
    var lists = [{
        desk: desk.title,
        title: desk.title,
        order: 1,
        permanent: 1,
        defaultList: 1
    }];
    // Loop through each of configured permanent lists and add them to the array.
    var order = 2;
    defaultLists.forEach(function(list){
        lists.push({
            desk:  desk.title,
            title: list.title,
            order: order,
            permanent: 1,
            defaultList: 0,
            rotating: list.rotating
        });
        order ++;
    });
    // Loop through the build array and save each list type.
    q.all(lists.map(function(list){ return saveList(new Lists(list)); }))
        .then(function(docs){ defer.resolve({msg: "--> Lists collection has been seeded.", lists: docs});})
        .catch(function(err){ defer.reject(err); });
    return defer.promise;
}
/**
 * Removes all log _ids from the .logs object in all Lists entries.
 * @returns {Promise.promise|*}
 */
function removeAllLogsFromLists(){
    var defer = q.defer();
    console.log(color.yellow('Removing logs from lists...'));
    Lists.update({},{logs: [] },{multi: true}, function(err,doc){
        if(err){defer.reject(err);}
        defer.resolve('--> All existing logs _ids have been removed from the Lists collection...');
    });
    return defer.promise;
}
/**
 * Takes the large MOCK_DATA.json file and generates the Logs collection.
 * @returns {Promise.promise|*}
 */
function buildFakeLogs(){
    var defer = q.defer();
    var fakeData = require('./data/MOCK_DATA.json');
    fakeData.forEach(function(log){
        var newLog = new Logs(log);
        newLog.save(function(err,doc){
            if(err) { defer.reject(doc);}
        });
    });
    assignLogsToLists()
        .then(function(){})
        .catch(function(err){ defer.reject(err); });
    defer.resolve('--> Fake logs have been added to the Logs collection.');
    return defer.promise;
}
/**
 * Takes all logs from the Logs collection and randomly assigns them to a list.
 * @returns {Promise.promise|*}
 */
function assignLogsToLists(){
    var defer = q.defer();
    var lists, logs;
    getLogs()
        .then(function(doc){
            logs = doc;
            return getLists();
        })
        .then(function(doc){
            lists = doc;
            logs.forEach(function(log, key){
                lists[Math.floor(Math.random() * lists.length)].logs.push(log._id);
            });
            q.all(lists.map(function(thisList){ return saveList(thisList); }))
                .then(function(){ defer.resolve("-->"+lists.length+" Fake logs have been assigned to random lists.");})
                .catch(function(err){defer.reject(err);});
        })
        .catch(function(err){ defer.reject(err); });
    return defer.promise;
}
/**
 * Takes all logs in the system and loops through each to change the createdAt time.
 * @returns {Promise.promise|*}
 */
function spreadLogsOverMultipleDays(){
    var defer = q.defer();
    getLogs()
        .then(function(logs){
            return q.all(logs.map(function(thisLog){ return changeLogToRandomDay(thisLog); }));
        })
        .then(function(){ defer.resolve("--> Fake logs have been spread over multiple days."); })
        .catch(function(err){ defer.reject(err); });
    return defer.promise;
}
/**
 * Updates the createdAt date of a specific log. Used to mock data into the system. Called by
 * @param log
 * @returns {Promise.promise|*}
 */
function changeLogToRandomDay(log, numDays){
    var defer = q.defer();
    numDays = numDays || 30;
    var dayToSubtract = Math.floor(Math.random() * numDays);
    var date = new Date(log.createdAt);
    date.setDate(date.getDate()-dayToSubtract);
    Logs.findOneAndUpdate({_id: log._id},{createdAt: date},{new: true},function(err, doc){
        if(err){ defer.reject(err);}
        defer.resolve(doc.createdAt);
    });
    return defer.promise;
}

function saveLog(log){
    var defer = q.defer();
    var newLog = new Logs(log);
    newLog.save(function(err,doc){
        if(err) { defer.reject(err);}
        else { defer.resolve(dov); }
    });
    return defer.promise;
}

function backFillDates(){
    var defer = q.defer();
    q.all(function(){
        for( var i=0; i<1000; i++){ return saveLog({"itemno":"FILLER","createdBy": "Lee Allen"})}
    })
        .then(function(){ return assignLogsToLists(); })
        .then(function(){ return spreadLogsOverMultipleDays(); })
        .then(function(){ defer.resolve('--> The log has been backfilled with filler.'); })
        .catch(function(err){ logger.err(err); defer.reject(err); });
    return defer.promise;
}


module.exports = Seed;