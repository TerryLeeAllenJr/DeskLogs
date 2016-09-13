'use strict';

/**
 * @ngdoc service
 * @name clientApp.authenticate
 * @description
 * # authenticate
 * Service in the clientApp.
 */
angular.module('clientApp')
    .service('authenticate', function ($q, $rootScope,$cookieStore, $location, $http, socket) {

        this.hasPermission = function(user,permissionLevel){ return hasPermission(user,permissionLevel);};
        this.logOut = function(){ return logOut(); };
        this.createJSONWebToken = function(login) { return createJSONWebToken(login); }
        this.requireLogin = function() { return requireLogin(); };
        this.signUp = function(user) { return signUp(user); };

        /**
         * Reaches out ot the server at /login/createJSONWebToken to log the user in and create a token.
         * @param login
         * @returns {*}
         */
        function createJSONWebToken(login){
            var defer = $q.defer();
            var request = $http.post('/login/createJSONWebToken', login );
            request.success(function (res) { defer.resolve(res); });
            request.error(function (err) { defer.reject(err); });
            return defer.promise;
        }
        /**
         * Verifies that a user has proper permissions in their account.
         * @param user
         * @param permissionLevel
         * @returns {userSchema.permissions|*|permissions|Query.permissions|Stats.permissions|boolean}
         */
        function hasPermission(user,permissionLevel){
            return ( typeof(user.permissions) !== 'undefined' &&
                     ( user.permissions.indexOf('sudo') !== -1 || user.permissions.indexOf(permissionLevel) !== -1)
            );
        }

        /**
         * Logs a user out of the system.
         */
        function logOut() {
            var jwt =  $cookieStore.get('jwt');
            $rootScope.$emit('loggedOut',true);

            if ( jwt ) {
                console.info('User is logged in... logging them out...',jwt);
                $cookieStore.remove('jwt');
                socket.emit('setUserOffline',jwt.sso);
            }
        }
        /**
         * Checks if the user has a valid JWT, then returns the users data.
         * @returns {*}
         */
        function requireLogin(){
            var defer = $q.defer();
            var jwt = $cookieStore.get('jwt');
            if(!jwt) { defer.reject({status: false, data: 'JWT not set'}); }
            verifyJSONWebToken(jwt)
                .then(function(hasValidToken){
                    if(!hasValidToken) { defer.reject('No valid token.'); }
                    else{ return getUserData(jwt); }
                })
                .then(function(userData){ defer.resolve(userData); })
                .catch(function(err){ defer.reject(err); });
            return defer.promise;
        }
        /**
         * Checks the value stored in the users cookie against the value stored in redis. Returns promise - bool.
         * @param jwt
         * @returns {*}
         */
        function verifyJSONWebToken(jwt) {
            var defer = $q.defer();
            var request = $http.post('/login/verifyJSONWebToken',jwt);
            request.success(function(res){ defer.resolve(res.data); });
            request.error(function(err){ defer.reject(err); });
            return defer.promise;
        }
        /**
         * Retrieves user data from the server based on JWT.
         * @param jwt
         * @returns {*}
         */
        function getUserData(jwt){
            var defer = $q.defer();
            var request = $http.post('/login/getUserData',jwt);
            request.success(function(res){
                if(!res.status){ defer.reject(res.data); }
                defer.resolve(res.data);
            });
            request.error(function(error){defer.reject(error);});
            return defer.promise;
        }
        /**
         * Creates the user and returns a JWT string.
         * @param user
         * @returns {*}
         */
        function signUp(user){
            var defer = $q.defer();
            user.preferences = {sound:false};
            var request = $http.post('/signup', user);
            request.success(function (res) {
                if(!res.status){ defer.reject(res.data); }
                else{
                    createJSONWebToken({sso: user.sso, pw: user.pw1})
                        .then(function(jwt){ defer.resolve(jwt); })
                        .catch(function(err){ defer.reject(err); });
                }
            });
            request.error(function (err) {
                console.error(err);
                defer.reject('There was an internal error on the server. Please contact support!');
            });

            return defer.promise;
        }
    });
