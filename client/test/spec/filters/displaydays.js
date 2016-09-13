'use strict';

describe('Filter: displayDays', function () {

  // load the filter's module
  beforeEach(module('clientApp'));

  // initialize a new instance of the filter before each test
  var displayDays;
  beforeEach(inject(function ($filter) {
    displayDays = $filter('displayDays');
  }));

  it('should return the input prefixed with "displayDays filter:"', function () {
    var text = 'angularjs';
    expect(displayDays(text)).toBe('displayDays filter: ' + text);
  });

});
