'use strict';

describe('Service: monitor', function () {

  // load the service's module
  beforeEach(module('serverApp'));

  // instantiate service
  var monitor;
  beforeEach(inject(function (_monitor_) {
    monitor = _monitor_;
  }));

  it('should do something', function () {
    expect(!!monitor).toBe(true);
  });

});
