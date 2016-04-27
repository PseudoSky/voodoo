'use strict';

describe('Controller: ScoreCtrl', function () {

  // load the controller's module
  beforeEach(module('visualApp'));

  var ScoreCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ScoreCtrl = $controller('ScoreCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(ScoreCtrl.awesomeThings.length).toBe(3);
  });
});
