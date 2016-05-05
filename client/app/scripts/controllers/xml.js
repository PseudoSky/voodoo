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
    var address="localhost:5000";
    var VexDocument = null;
    var VexFormatter = null;
    var current_data='';
    $scope.recording=false;
    $scope.notes=[];
    $http.get('http://'+address+'/toggle/'+$scope.recording)

    function stream(){
      $http.get("http://"+address+"/poll/"+$scope.notes.length).then(function(d){
        // console.log('DAT',d);
        _(d.nl).each($scope.notes.push);
        // $scope.notes=_.concat($scope.notes,d.nl)
      }).catch(function(err){
        console.log('Net Probs',err);
        $scope.recording=false;
      })
      if($scope.recording){
        _.delay(stream,500);

      }


    }
    function relay(){
      $http.get("http://"+address+"/music.xml").then(function(data) {
          console.log('D',data);
          data=data.data
          if(data==current_data) return 0;
          current_data=data;
          var start = new Date().getTime(); // time execution
          VexDocument = new MusicXml.Flow.Document(data);
          // console.log('D',VexDocument,data);
          // window.dat={data:data,vd:VexDocument}
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
        });
      
      if($scope.recording){
        _.delay(relay,500);

      }
    }
    relay()
    $scope.start=function(){
      $scope.recording=true;
      $http.get("http://"+address+"/toggle/"+$scope.recording)
      if($scope.recording){
        relay();
      }
    }
    $scope.stop=function(){
      $scope.recording=false;
      $http.get("http://"+address+"/toggle/"+$scope.recording)
    }

    $scope.reset=function(){
      $scope.notes=[];
      $http.get("http://"+address+"/reset")
      relay()
      // $scope.recording=false
    }

  });
