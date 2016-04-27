'use strict';

/**
 * @ngdoc function
 * @name visualApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the visualApp
 */




angular.module('visualApp')
  .controller('MainCtrl', function (ChordBox,chart,MusicXml) {
	  var container = $("#container");

	  // Display preset chords (open chords)
	  for (var i = 0; i < chart.chord_chart.length; ++i) {
	    var section_struct = chart.chord_chart[i];
	    var section = chart.createSectionElement(section_struct);

	    for (var j = 0; j < section_struct.chords.length; ++j) {
	      section.append(chart.createChordElement(section_struct.chords[j]));
	    }

	    container.append(section);
	  }

	  // Display shape chords for all keys
	  var keys_E = ["F", "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "C"];
	  var keys_A = ["C#", "Db", "D", "D#", "Eb", "F", "F#", "Gb", "G"];

	  var shapes_E = [
	    "M E", "m E", "7 E", "m7 E", "M7 E", "m7b5 E", "dim E",
	    "sus4 E", "7sus4 E", "13 E"];
	  var shapes_A = [
	    "M A", "m A", "7 A", "m7 A", "M7 A", "m7b5 A", "dim A",
	    "sus2 A", "sus4 A", "7sus4 A", "9 A", "7b9 A", "7#9 A", "13 A"];

	  chart.createShapeChart(keys_E, container, shapes_E, "E");
	  chart.createShapeChart(keys_A, container, shapes_A, "A");

  });
