'use strict';

describe('Controller: AdminmonitorCtrl', function () {

  // load the controller's module
  beforeEach(module('clientApp'));

  var AdminmonitorCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AdminmonitorCtrl = $controller('AdminmonitorCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  /*
  it('should attach a list of awesomeThings to the scope', function () {
    expect(AdminmonitorCtrl.awesomeThings.length).toBe(3);
  }); */
});
