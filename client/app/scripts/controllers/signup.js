'use strict';

angular.module('clientApp') // make sure this is set to whatever it is in your client/scripts/app.js
    .controller('SignupCtrl', [
        '$location',
        '$scope',
        '$http',
        '$cookieStore',
        'authenticate',
        'notifications', function ( $location, $scope, $http, $cookieStore, authenticate, notifications) {

        var user,
            signup;

        $scope.signup = signup = {};
        signup.user = user = {};

        signup.error = {};


        signup.submit = function () {

            signup.error = {
                message: "",
                sso: false,
                pw1: false,
                pw2: false
            };

            // Validate SSO
            var isnum = /^\d+$/.test(user.sso);
            if(!isnum || user.sso.length !== 9){
                signup.error.sso = true;
                notifications.createErrorPopUp({text: 'Please enter a valid SSO!', title: "Validation Error"});
                return false;
            }

            // make sure the passwords match match
            if (user.pw1 !== user.pw2) {
                notifications.createErrorPopUp({text: 'Your passwords do not match!', title: "Validation Error"});
                signup.error.pw1 = signup.error.pw2 = true;
                return false;
            }

            authenticate.signUp(user)
                .then(function(jwt){
                    $cookieStore.put('jwt',{sso: user.sso, token:jwt.data});
                    $location.path('/');
                })
                .catch(function(err){
                    console.error(err);
                    notifications.createErrorPopUp({text: err || 'Internal Error 500', title: 'Verification Error'});
                });

        };

    }]);
