'use strict';

describe('Filter: capitalize', function () {

  // load the filter's module
  beforeEach(module('clientApp'));

  // initialize a new instance of the filter before each test
  var capitalize;
  beforeEach(inject(function ($filter) {
    capitalize = $filter('capitalize');
  }));

  it('Take an array of days and return it ', function () {
    var text = 'lee';
    expect(capitalize(text)).toBe('Lee');
  });

});
