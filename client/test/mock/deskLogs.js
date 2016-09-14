/*
var deskLogsServiceMock = {
    getDesks: function(){
        return ['incoming','national','regional']
    }
};
*/

angular.module('deskLogsMock', [])
    .service('deskLogs', function($q) {
        return {
            getDesks: function(){
                var defer = $q.defer();
                defer.resolve({status: true, data: ['incoming','national','regional']});
                return defer.promise;
            },
            getLists: function(){
                var defer = $q.defer();
                defer.resolve({status: true, data: ['pending','national','regional']});
                return defer.promise;
            },
            organizeLists: function(lists){ return lists; }
        };

    });