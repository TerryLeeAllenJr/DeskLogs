'use strict';
/**
 * @ngdoc overview
 * @name clientApp
 * @description
 * # clientApp
 *
 * Main module of the application.
 */
angular
    .module('clientApp', [
        'angular-web-notification',
        'angular-growl',
        'cfp.hotkeys',
        'ngAnimate',
        'ngAria',
        'ngCookies',
        'ngMessages',
        'ngResource',
        'ngRoute',
        'ngSanitize',
        'ngTouch',
        'ui.bootstrap',
        'wysiwyg.module'
    ])
    .config(function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/main.html',
                controller: 'MainCtrl',
                controllerAs: 'main'
            })
            .when('/login', {
                templateUrl: 'views/login.html',
                controller: 'LoginCtrl',
                controllerAs: 'login'
            })
            .when('/signup', {
                templateUrl: 'views/signup.html',
                controller: 'SignupCtrl',
                controllerAs: 'signup'
            })
            .when('/settings', {
              templateUrl: 'views/settings.html',
              controller: 'SettingsCtrl',
              controllerAs: 'settings'
            })
            .when('/help', {
              templateUrl: 'views/help.html',
              controller: 'HelpCtrl',
              controllerAs: 'help'
            })
            .when('/admin', {
              templateUrl: 'views/admin.html',
              controller: 'AdminCtrl',
              controllerAs: 'admin'
            })
            .otherwise({
                redirectTo: '/'
            });
    })
    .config(['growlProvider', function(growlProvider) {
        growlProvider.globalReversedOrder(true);
        growlProvider.globalTimeToLive(3000);
        growlProvider.globalDisableCountDown(true);
        growlProvider.globalPosition('bottom-right');
    }]);;
