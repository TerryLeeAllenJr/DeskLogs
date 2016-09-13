'use strict';

describe('Filter: removeHTML', function () {

  // load the filter's module
  beforeEach(module('clientApp'));

  // initialize a new instance of the filter before each test
  var removeHTML;
  beforeEach(inject(function ($filter) {
    removeHTML = $filter('removeHTML');
  }));

  it('should remove HTML from a string...', function () {
    var text = '<p>Test</p>';
    expect(removeHTML(text)).toBe('Test');
  });

});
