'use strict';

describe('Service: ChordBox', function () {

  // load the service's module
  beforeEach(module('visualApp'));

  // instantiate service
  var ChordBox;
  beforeEach(inject(function (_ChordBox_) {
    ChordBox = _ChordBox_;
  }));

  it('should do something', function () {
    expect(!!ChordBox).toBe(true);
  });

});
