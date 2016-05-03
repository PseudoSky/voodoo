'use strict';

/**
 * @ngdoc function
 * @name visualApp.controller:XmlCtrl
 * @description
 * # XmlCtrl
 * Controller of the visualApp
 */
angular.module('visualApp')
  .controller('XmlCtrl', function ($scope,$http,MusicXml) {
    var VexDocument = null;
    var VexFormatter = null;
    $scope.recording=false;

    function relay(){
      $http.get("http://localhost:5000/info").then(function(d){
        console.log('DAT',d);
      })
      $.ajax({
        url: "http://localhost:5000/music.xml",
        // url: "beethoven_moonlight_m1.xml",
        success: function(data) {
          var start = new Date().getTime(); // time execution
          VexDocument = new MusicXml.Flow.Document(data);
          console.log('D',VexDocument,data);
          window.dat={data:data,vd:VexDocument}
          var content = $(".content")[0];
          if (VexDocument) {
            VexFormatter = VexDocument.getFormatter();
            VexFormatter.draw(content);
          }
          var elapsed = (new Date().getTime() - start)/1000;
          var debouncedResize = null;
          $(window).resize(function() {
            if (! debouncedResize)
              debouncedResize = setTimeout(function() {
                VexFormatter.draw(content);
                debouncedResize = null;
              }, 500);
          });
        }
      });
      if($scope.recording){
        _.delay(relay,500);

      }


    }
    relay()
    $scope.toggle=function(){
      $scope.recording=!$scope.recording;
      $http.get('http://localhost:5000/toggle/'+$scope.recording)
      if($scope.recording){
        relay();
      }
    }
    $scope.reset=function(){
      $http.get('http://localhost:5000/reset')
      $scope.recording=false
    }

  });
