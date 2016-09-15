'use strict';

describe('Filter: getListTitleFromId', function () {

  // load the filter's module
  beforeEach(module('clientApp'));

  // initialize a new instance of the filter before each test
  var getListTitleFromId;
  beforeEach(inject(function ($filter) {
    getListTitleFromId = $filter('getListTitleFromId');
  }));

  /*
  it('should return the input prefixed with "getListTitleFromId filter:"', function () {
    var text = 'angularjs';
    expect(getListTitleFromId(text)).toBe('getListTitleFromId filter: ' + text);
  }); */

});
