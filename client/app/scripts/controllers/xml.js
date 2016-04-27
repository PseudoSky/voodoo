'use strict';

/**
 * @ngdoc function
 * @name visualApp.controller:XmlCtrl
 * @description
 * # XmlCtrl
 * Controller of the visualApp
 */
angular.module('visualApp')
  .controller('XmlCtrl', function (MusicXml) {
    var VexDocument = null;
    var VexFormatter = null;
    $.ajax({
      url: "beethoven_moonlight_m1.xml",
      success: function(data) {
        var start = new Date().getTime(); // time execution
        VexDocument = new MusicXml.Flow.Document(data);
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
  });
