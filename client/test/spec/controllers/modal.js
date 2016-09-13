'use strict';

describe('Controller: ModalCtrl', function () {

  // load the controller's module
  beforeEach(module('clientApp'));

  var ModalCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ModalCtrl = $controller('ModalCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

});
