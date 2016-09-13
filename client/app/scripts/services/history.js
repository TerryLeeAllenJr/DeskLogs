'use strict';

/**
 * @ngdoc service
 * @name clientApp.history
 * @description
 * # history
 * Service in the clientApp.
 */
angular.module('clientApp')
  .service('history', [

        '$q',
        'api',
        'notifications',function ($q,api,notifications) {

        this.getHistory = function(sso){ return getHistory(sso); };


        function getHistory(sso){
            var defer = $q.defer();
            console.log(sso);
            api.get('/history',(sso) ? [sso] : null)
                .then(function(history) { defer.resolve(history); })
                .catch(function(err){
                    console.error(err);
                    notifications.createErrorPopup({text:err,title:'History Error!'});
                });
            return defer.promise;
        }



  }]);
