'use strict';

describe('Controller: AdminreportsCtrl', function () {

  // load the controller's module
  beforeEach(module('clientApp'));

  var AdminreportsCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AdminreportsCtrl = $controller('AdminreportsCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(AdminreportsCtrl.awesomeThings.length).toBe(3);
  });
});
