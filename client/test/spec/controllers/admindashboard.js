'use strict';

describe('Controller: AdmindashboardCtrl', function () {

  // load the controller's module
  beforeEach(module('clientApp'));

  var AdmindashboardCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AdmindashboardCtrl = $controller('AdmindashboardCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

    /*
  it('should attach a list of awesomeThings to the scope', function () {
    expect(AdmindashboardCtrl.awesomeThings.length).toBe(3);
  }); */
});
