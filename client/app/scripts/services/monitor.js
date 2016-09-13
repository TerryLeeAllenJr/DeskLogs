'use strict';

/**
 * @ngdoc service
 * @name clientApp.monitor
 * @description
 * # monitor
 * Service in the clientApp.
 */
angular.module('clientApp')
  .service('monitor', ['$q', '$http', function ($q, $http) {


        this.getCurrentStatus = function() { return getCurrentStatus(); };

        function getCurrentStatus(){
            var defer = $q.defer();
            var request = $http.get('/monitor');
            request.success(function (res) {
                defer.resolve(res);
            });
            request.error(function (err) {
                console.error(err);
                defer.reject(err);
            });
            return defer.promise;
        }


  }]);
