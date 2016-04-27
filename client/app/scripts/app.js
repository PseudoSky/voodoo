'use strict';

/**
 * @ngdoc overview
 * @name visualApp
 * @description
 * # visualApp
 *
 * Main module of the application.
 */
angular
  .module('visualApp', [
    'ngAnimate',
    'ngAria',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl',
        controllerAs: 'about'
      })
      .when('/score', {
        templateUrl: 'views/score.html',
        controller: 'ScoreCtrl',
        controllerAs: 'score'
      })
      .when('/xml', {
        templateUrl: 'views/xml.html',
        controller: 'XmlCtrl',
        controllerAs: 'xml'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
