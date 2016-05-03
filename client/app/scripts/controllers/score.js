'use strict';

/**
 * @ngdoc function
 * @name visualApp.controller:ScoreCtrl
 * @description
 * # ScoreCtrl
 * Controller of the visualApp
 */
angular.module('visualApp')
  .controller('ScoreCtrl', function (MusicXml) {
	  var canvas = $("#score canvas")[0];
	  var renderer = new Vex.Flow.Renderer(canvas,
	    Vex.Flow.Renderer.Backends.CANVAS);
	  var ctx = renderer.getContext();
	  ctx.setFont("Arial", 10, "").setBackgroundFillStyle("#eed");

	  // Create and draw the tablature stave
	  var tabstave = new Vex.Flow.TabStave(10, 0, 500);
	  tabstave.addTabGlyph();
	  tabstave.setContext(ctx).draw();

	  // Create some notes
	  var notes = [
	    // A single note
	    new Vex.Flow.TabNote({
	      positions: [{str: 3, fret: 7}],
	      duration: "q"}),

	    // A chord with the note on the 3rd string bent
	    new Vex.Flow.TabNote({
	      positions: [{str: 2, fret: 10},
	                  {str: 3, fret: 9}],
	      duration: "q"}).
	    addModifier(new Vex.Flow.Bend("Full"), 1),

	    // A single note with a harsh vibrato
	    new Vex.Flow.TabNote({
	      positions: [{str: 2, fret: 5}],
	      duration: "h"}).
	    addModifier(new Vex.Flow.Vibrato().setHarsh(true).setVibratoWidth(70), 0)
	  ];

	  Vex.Flow.Formatter.FormatAndDraw(ctx, tabstave, notes);
  });
