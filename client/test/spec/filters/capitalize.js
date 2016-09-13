'use strict';

describe('Filter: capitalize', function () {

  // load the filter's module
  beforeEach(module('clientApp'));

  // initialize a new instance of the filter before each test
  var capitalize;
  beforeEach(inject(function ($filter) {
    capitalize = $filter('capitalize');
  }));

  it('should return a string with the first letter capitalized...', function () {
    var text = 'lee';
    expect(capitalize(text)).toBe('Lee');
  });

});
