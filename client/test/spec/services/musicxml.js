'use strict';

describe('Service: MusicXml', function () {

  // load the service's module
  beforeEach(module('visualApp'));

  // instantiate service
  var MusicXml;
  beforeEach(inject(function (_MusicXml_) {
    MusicXml = _MusicXml_;
  }));

  it('should do something', function () {
    expect(!!MusicXml).toBe(true);
  });

});
