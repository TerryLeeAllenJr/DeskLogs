'use strict';

describe('Directive: dndDropList', function () {

  // load the directive's module
  beforeEach(module('clientApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));
/*
  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<dnd-drop-list></dnd-drop-list>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the dndDropList directive');
  })); */
});
