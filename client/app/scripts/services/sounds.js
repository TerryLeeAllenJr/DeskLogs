'use strict';

/**
 * @ngdoc service
 * @name clientApp.sounds
 * @description
 * # sounds
 * Factory in the clientApp.
 */
angular.module('clientApp')
    .factory('sounds', ['$rootScope',function ($rootScope) {

        var soundUrls = {
            success: '../../sounds/filling-your-inbox.mp3',
            info: '../../sounds/you-wouldnt-believe.mp3',
            warning: '../../sounds/demonstrative.mp3',
            error: '../../sounds/capisci.mp3',
            urgent: '../../sounds/solemn',
            click: '../../sounds/all-eyes-on-me.mp4',
            disabled: '../../sounds/your-turn.mp4'
        };
        // Public API here
        return {
            playSound: function (type) {
                var audio = new Audio(soundUrls[type]);
                if($rootScope.hasOwnProperty('user') && $rootScope.user.preferences.sound){
                    audio.play();
                }
            }
        };
    }]);
