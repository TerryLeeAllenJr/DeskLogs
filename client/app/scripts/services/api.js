'use strict';

/**
 * @ngdoc service
 * @name clientApp.api
 * @description
 * # api
 * Factory in the clientApp.
 */
angular.module('clientApp')
  .factory('api', [
        '$q',
        '$http',
        function ($q,$http) {
            /**
             * Performs a GET request to the specified URL.
             * @param url
             * @returns {*}
             */
            function get(url, data) {

                console.info('api.get()',url,data);
                var defer = $q.defer();
                if (data) {
                    angular.forEach(data, function (value, key) {
                        url += ('/' + value);
                    });
                }
                console.info(url);
                var request = $http.get(url);
                request.success(function (res) {
                    defer.resolve(res);
                });
                request.error(function (err) {
                    defer.reject(err);
                });
                return defer.promise;
            }
            /**
             * Performs a POST request to the specified URL with provided var data.
             * @param url
             * @param data
             * @returns {*}
             */
            function post(url, data) {
                var defer = $q.defer();
                var request = $http.post(url, data);
                request.success(function (res) {
                    defer.resolve(res);
                });
                request.error(function (err) {
                    console.error('ERROR:', err);
                    defer.reject(err);
                });
                return defer.promise;
            }
            /**
             * Performs a DELETE request to the specified url. Attaches [data] to the url string.
             * @param url
             * @param data
             * @returns {*}
             */
            function del(url, data) {
                angular.forEach(data, function (value, key) {
                    url += ('/' + value);
                });
                var defer = $q.defer();
                var request = $http.delete(url, data);
                request.success(function (res) {
                    defer.resolve(res);
                });
                request.error(function (err) {
                    console.error('ERROR:', err);
                    defer.reject(err);
                });
                return defer.promise;
            }

            return {
                get: function(url,data){ return get(url,data); },
                post: function(url,data){ return post(url,data); },
                del: function(url,data){ return del(url,data); }
            };
  }]);
