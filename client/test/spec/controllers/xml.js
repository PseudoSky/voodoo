'use strict';

describe('Controller: XmlCtrl', function () {

  // load the controller's module
  beforeEach(module('visualApp'));

  var XmlCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    XmlCtrl = $controller('XmlCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(XmlCtrl.awesomeThings.length).toBe(3);
  });
});
