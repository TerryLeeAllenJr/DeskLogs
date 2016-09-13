'use strict';

describe('Filter: nameFromSSO', function () {

  // load the filter's module
  beforeEach(module('clientApp'));

  // initialize a new instance of the filter before each test
  var nameFromSSO;
  beforeEach(inject(function ($filter) {
    nameFromSSO = $filter('nameFromSSO');
  }));

  it('should return the input prefixed with "nameFromSSO filter:"', function () {
    var text = 'angularjs';
    expect(nameFromSSO(text)).toBe('nameFromSSO filter: ' + text);
  });

});
