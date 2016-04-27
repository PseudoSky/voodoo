'use strict';

describe('Service: Vex', function () {

  // load the service's module
  beforeEach(module('visualApp'));

  // instantiate service
  var Vex;
  beforeEach(inject(function (_Vex_) {
    Vex = _Vex_;
  }));

  it('should do something', function () {
    expect(!!Vex).toBe(true);
  });

});
