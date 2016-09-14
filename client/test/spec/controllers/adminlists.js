'use strict';
describe('Controller: AdminlistsCtrl', function () {

    // load the controller's module
    beforeEach(module('clientApp'));
    var AdminlistsCtrl,
        scope;

    // Initialize the controller and a mock scope

    beforeEach(angular.mock.module('deskLogsMock'));
    beforeEach(
        inject(
            function ($controller, $rootScope) {
                scope = $rootScope.$new();
                AdminlistsCtrl = $controller( 'AdminlistsCtrl', {
                    $scope: scope
                    // place here mocked dependencies
                });
            }
        )
    );



    it('should create a default date',function(){
        expect(scope.currentDate instanceof Date).toBe(true);
    });

    it('should perform a bootstrap and define $scope.desks and $scope.lists',function(){
        scope.$apply();
        expect(scope.desks).toBeDefined();
        expect(scope.lists).toBeDefined();
    });


});





/*

'use strict';

describe('Controller: AdminlistsCtrl', function () {

    // load the controller's module
    beforeEach(module('clientApp'));
    //beforeEach(module('deskLogs'));
    //beforeEach(module(angular.mock.module('deskLogsMock')));

    var AdminlistsCtrl,
        scope;

    // Initialize the controller and a mock scope

    beforeEach(inject(function ($controller, $rootScope, $deskLogsServiceMock) {
        scope = $rootScope.$new();
        deskLogsServiceMock = $deskLogsServiceMock;
        AdminlistsCtrl = $controller('AdminlistsCtrl', {
            $scope: scope,
            deskLogs: deskLogsServiceMock
        });
    }));



    it('should default lists to an empty object',function (){

        expect(test).toBe('test');
    });
});
*/