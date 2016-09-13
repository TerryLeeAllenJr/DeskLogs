'use strict';

describe('Directive: deskLogs', function () {

  // load the directive's module
  beforeEach(module('clientApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

/*
  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<desk-logs></desk-logs>');
    element = $compile(element)(scope);
    console.log('element',element);
    expect(element.test('Yay')).toBe('Yay!');
  }));

  */
});
