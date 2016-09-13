'use strict';

describe('Filter: displayDays', function () {

  // load the filter's module
  beforeEach(module('clientApp'));

  // initialize a new instance of the filter before each test
  var displayDays;
  beforeEach(inject(function ($filter) {
    displayDays = $filter('displayDays');
  }));

  it('should take an object of days and return a comma delineated list.', function () {
    var days = {
        mon: true,
        tues: true,
        wed: true
    };
    expect(displayDays(days)).toBe('mon,tues,wed');
  });

});
