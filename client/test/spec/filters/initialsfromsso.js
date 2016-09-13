'use strict';

describe('Filter: initialsFromSSO', function () {

  // load the filter's module
  beforeEach(module('clientApp'));

  // initialize a new instance of the filter before each test
  var initialsFromSSO;
  beforeEach(inject(function ($filter) {
    initialsFromSSO = $filter('initialsFromSSO');
  }));

    // TODO: Remove.
  /*it('should return a users name based on SSO:"', function () {
    var text = '206452688';
    expect(initialsFromSSO(text)).toBe('Terry Allen');
  });*/

});
