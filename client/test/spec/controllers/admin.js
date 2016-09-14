'use strict';
describe('Controller: AdminCtrl', function () {

    // load the controller's module
    beforeEach(module('clientApp'));

    var AdminCtrl,
        scope;


    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        AdminCtrl = $controller('AdminCtrl', {
            $scope: scope
            // place here mocked dependencies
        });
    }));

    // Check defaults.
    it('should should default to the dashboard page.', function () {
        expect(scope.currentPage).toBe('dashboard');
    });

    it('should should default to the not loading state', function () {
        expect(scope.loading).toBe(false);
    });

    it('should should default to the menu opened position.', function () {
        expect(scope.menuClosed).toBe(false);
    });

    // Check functionality.
    it('should change the page id when a page is clicked.',function(){
        scope.changePage('test');
        expect(scope.currentPage).toBe('test');
    });
    it('should toggle the menu open when closed',function(){
        scope.menuClosed = true;
        scope.toggleMenu();
        expect(scope.menuClosed).toBe(false);
    });
    it('should toggle the menu closed when open',function(){
        scope.menuClosed = false;
        scope.toggleMenu();
        expect(scope.menuClosed).toBe(true);
    });
});


