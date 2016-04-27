'use strict';

/**
 * @ngdoc service
 * @name visualApp.MusicXml
 * @description
 * # MusicXml
 * Factory in the visualApp.
 */
angular.module('visualApp')
  .factory('MusicXml', function (Vex) {
    /**
     * VexFlow MusicXML - DOM-based MusicXML backend for VexFlow Documents.
     * @author Daniel Ringwalt (ringw)
     */

    if (! Vex.Flow.Backend) Vex.Flow.Backend = {};

    /** @constructor */
    Vex.Flow.Backend.MusicXML = function() {
      this.partList = new Array();
      this.staveConnectors = new Array();
      // Create timewise array of arrays
      // Measures (zero-indexed) -> array of <measure> elements for each part
      this.measures = new Array();
      // Actual measure number for each measure
      // (Usually starts at 1, or 0 for pickup measure and numbers consecutively)
      this.measureNumbers = new Array();
      // Store number of staves for each part (zero-indexed)
      this.numStaves = new Array();
      // Track every child of any <attributes> element in array
      // (except <staves> which is stored in numStaves)
      // Measures -> parts ->
      //  object where keys are names of child elements ->
      //    data representing the attribute
      this.attributes = new Array();
    }

    Vex.Flow.Backend.MusicXML.appearsValid = function(data) {
      if (typeof data == "string") {
        return data.search(/<score-partwise/i) != -1;
      }
      return (data instanceof Document) &&
             (data.documentElement.nodeName == 'score-partwise');
    }

    Vex.Flow.Backend.MusicXML.prototype.parse = function(data) {
      if (typeof data == "string") {
        // Parse XML string
        if (window.DOMParser && typeof XMLDocument != "undefined") {
          var parser = new window.DOMParser();
          this.document = parser.parseFromString(data, "text/xml");
        }
        else if (window.ActiveXObject
                 && new window.ActiveXObject("Microsoft.XMLDOM")) {
          this.document = new window.ActiveXObject("Microsoft.XMLDOM");
          this.document.async = "false";
          this.document.loadXML(data);
        }
        else throw new Vex.RERR("UnsupportedBrowserError", "No XML parser found");
      }
      else if (data instanceof Document) this.document = data;
      else {
        this.valid = false;
        throw new Vex.RERR("ArgumentError",
                           "MusicXML requires XML string or DOM Document object");
      }
      this.documentElement = this.document.documentElement;
      if (this.documentElement.nodeName != 'score-partwise')
        throw new Vex.RERR("ArgumentError",
                           "VexFlow only supports partwise scores");

      // Go through each part, pushing the measures on the correct sub-array
      var partNum = 0;
      Array.prototype.forEach.call(this.documentElement.childNodes, function(node){
        if (node.nodeName == "part-list") this.parsePartList(node);
        else if (node.nodeName == "part") {
          var measureNum = 0;
          for (var j = 0; j < node.childNodes.length; j++) {
            var measure = node.childNodes[j];
            if (measure.nodeName != "measure") continue;
            if (! (measureNum in this.measures))
              this.measures[measureNum] = new Array();
            if (this.measures[measureNum].length != partNum) {
              // Some part is missing a measure
              Vex.LogFatal("Part missing measure");
              this.valid = false;
              return;
            }
            if (! (measureNum in this.measureNumbers)) {
              var num = parseInt(measure.getAttribute("number"));
              if (! isNaN(num)) this.measureNumbers[measureNum] = num;
            }
            this.measures[measureNum][partNum] = measure;
            var attributes = measure.getElementsByTagName("attributes")[0];
            if (attributes) this.parseAttributes(measureNum, partNum, attributes);
            measureNum++;
          }
          // numStaves defaults to 1 for this part
          if (! (partNum in this.numStaves))
            this.numStaves[partNum] = 1;
          partNum++;
        }
      }, this);

      // Create a brace for each part with multiple staves
      var partNum = 0;
      this.numStaves.forEach(function(staves) {
        if (staves > 1) this.staveConnectors.push({
          type: "brace", parts: [partNum], system_start: true});
        partNum++;
      }, this);

      this.valid = true;
    }

    Vex.Flow.Backend.MusicXML.prototype.parsePartList = function(partListElem) {
      // We only care about stave connectors in part groups
      var partNum = 0;
      var partGroup = null;
      var staveConnectors = null; // array of stave connectors for part group
      Array.prototype.forEach.call(partListElem.childNodes, function(elem) {
        switch (elem.nodeName) {
          case "part-group":
            if (elem.getAttribute("type") == "start") {
              partGroup = [];
              staveConnectors = [];
              Array.prototype.forEach.call(elem.childNodes, function(groupElem) {
                switch (groupElem.nodeName) {
                  case "group-symbol":
                    if (groupElem.textContent == "bracket"
                        || groupElem.textContent == "brace")
                      // Supported connectors
                      staveConnectors.push({type: groupElem.textContent,
                                            system_start: true});
                  case "group-barline":
                    if (groupElem.textContent == "yes")
                      staveConnectors.push({type: "single", measure_start: true,
                                            system_end: true});
                }
              });
            }
            else if (elem.getAttribute("type") == "stop") {
              staveConnectors.forEach(function(connect) {
                connect.parts = partGroup;
                this.staveConnectors.push(connect);
              }, this);
              partGroup = staveConnectors = null;
            }
            break;
          case "score-part":
            if (partGroup) partGroup.push(partNum);
            this.partList.push(partNum);
            partNum++;
            break;
        }
      }, this);
    }

    Vex.Flow.Backend.MusicXML.prototype.isValid = function() { return this.valid; }

    Vex.Flow.Backend.MusicXML.prototype.getNumberOfMeasures = function() {
      return this.measures.length;
    }

    Vex.Flow.Backend.MusicXML.prototype.getMeasureNumber = function(m) {
      var num = this.measureNumbers[m];
      return isNaN(num) ? null : num;
    }

    Vex.Flow.Backend.MusicXML.prototype.getMeasure = function(m) {
      var measure_attrs = this.getAttributes(m, 0);
      var time = measure_attrs.time;
      var measure = new Vex.Flow.Measure({time: time});
      var numParts = this.measures[m].length;
      measure.setNumberOfParts(numParts);
      for (var p = 0; p < numParts; p++) {
        var attrs = this.getAttributes(m, p);
        var partOptions = {time: time};
        if (typeof attrs.clef == "string") partOptions.clef = attrs.clef;
        if (typeof attrs.key  == "string") partOptions.key  = attrs.key;
        measure.setPart(p, partOptions);
        var part = measure.getPart(p);
        part.setNumberOfStaves(this.numStaves[p]);
        if (attrs.clef instanceof Array)
          for (var s = 0; s < this.numStaves[p]; s++)
            part.setStave(s, {clef: attrs.clef[s]});
        var numVoices = 1; // can expand dynamically
        var noteElems = this.measures[m][p].getElementsByTagName("note");
        var voiceObjects = new Array(); // array of arrays
        var lastNote = null; // Hold on to last note in case there is a chord
        for (var i = 0; i < noteElems.length; i++) {
          // FIXME: Chord support
          var noteObj = this.parseNote(noteElems[i], attrs);
          if (noteObj.grace) continue; // grace note requires VexFlow support
          var voiceNum = 0;
          if (typeof noteObj.voice == "number") {
            if (noteObj.voice >=numVoices) part.setNumberOfVoices(noteObj.voice+1);
            voiceNum = noteObj.voice;
          }
          var voice = part.getVoice(voiceNum);
          if (voice.notes.length == 0 && typeof noteObj.stave == "number") {
            // TODO: voice spanning multiple staves (requires VexFlow support)
            voice.stave = noteObj.stave;
          }
          if (noteObj.chord) lastNote.keys.push(noteObj.keys[0]);
          else {
            if (lastNote) part.getVoice(lastNote.voice || 0).addNote(lastNote);
            lastNote = noteObj;
          }
        }
        if (lastNote) part.getVoice(lastNote.voice || 0).addNote(lastNote);
        // Voices appear to not always be consecutive from 0
        // Copy part and number voices correctly
        // FIXME: Figure out why this happens
        var newPart = new Vex.Flow.Measure.Part(part);
        var v = 0; // Correct voice number
        for (var i = 0; i < part.getNumberOfVoices(); i++)
          if (typeof part.getVoice(i) == "object"
              && part.getVoice(i).notes.length > 0) {
            newPart.setVoice(v, part.getVoice(i));
            v++;
          }
        newPart.setNumberOfVoices(v);
        measure.setPart(p, newPart);
      }
      return measure;
    }

    Vex.Flow.Backend.MusicXML.prototype.getStaveConnectors =
      function() { return this.staveConnectors; }

    Vex.Flow.Backend.MusicXML.prototype.parseAttributes =
      function(measureNum, partNum, attributes) {
      var attrs = attributes.childNodes;
      for (var i = 0; i < attrs.length; i++) {
        var attrObject = null;
        var attr = attrs[i];
        switch (attr.nodeName) {
          case "staves":
            // If this is the first measure, we use <staves>
            if (measureNum == 0)
              this.numStaves[partNum] = parseInt(attr.textContent);
            break;
          case "key":
            attrObject = this.fifthsToKey(parseInt(attr.getElementsByTagName(
                                                     "fifths")[0].textContent));
            break;
          case "time":
            attrObject = (attr.getElementsByTagName("senza-misura").length > 0)
                       ? {num_beats: 4, beat_value: 4, soft: true}
                       : {
              num_beats: parseInt(attr.getElementsByTagName("beats")[0]
                                          .textContent),
              beat_value: parseInt(attr.getElementsByTagName(
                                              "beat-type")[0].textContent),
              soft: true // XXX: Should we always have soft voices?
            };
            break;
          case "clef":
            var number = parseInt(attr.getAttribute("number"));
            var sign = attr.getElementsByTagName("sign")[0].textContent;
            var line = parseInt(attr.getElementsByTagName("line")[0].textContent);
            var clef = (sign == "G" && line == "2") ? "treble"
                     : (sign == "C" && line == "3") ? "alto"
                     : (sign == "C" && line == "4") ? "tenor"
                     : (sign == "F" && line == "4") ? "bass"
                     : (sign == "percussion") ? "percussion"
                     : null;
            if (number > 0) {
              if (measureNum in this.attributes
                  && partNum in this.attributes[measureNum]
                  && this.attributes[measureNum][partNum].clef instanceof Array)
                attrObject = this.attributes[measureNum][partNum].clef;
              else attrObject = new Array(this.numStaves[partNum]);
              attrObject[number - 1] = clef;
            }
            else attrObject = clef;
            break;
          case "divisions":
            attrObject = parseInt(attr.textContent);
            break;
          default: continue; // Don't use attribute if we don't know what it is
        }
        if (! (measureNum in this.attributes))
          this.attributes[measureNum] = [];
        if (! (partNum in this.attributes[measureNum]))
          this.attributes[measureNum][partNum] = {};
        this.attributes[measureNum][partNum][attr.nodeName] = attrObject;
      }
      return attrObject;
    }

    Vex.Flow.Backend.MusicXML.prototype.parseNote = function(noteElem, attrs) {
      var noteObj = {rest: false, chord: false};
      noteObj.tickMultiplier = new Vex.Flow.Fraction(1, 1);
      noteObj.tuplet = null;
      Array.prototype.forEach.call(noteElem.childNodes, function(elem) {
        switch (elem.nodeName) {
          case "pitch":
            var step = elem.getElementsByTagName("step")[0].textContent;
            var octave = parseInt(elem.getElementsByTagName("octave")[0]
                                      .textContent);
            var alter = elem.getElementsByTagName("alter")[0];
            if (alter)
              switch (parseInt(alter.textContent)) {
                case 1: step += "#"; break;
                case 2: step += "##"; break;
                case -1: step += "b"; break;
                case -2: step += "bb"; break;
              }
            noteObj.keys = [step + "/" + octave.toString()];
            break;
          case "type":
            var type = elem.textContent;
            // Look up type
            noteObj.duration = {
              maxima: "1/8", long: "1/4", breve: "1/2",
              whole: "1", half: "2", quarter: "4", eighth: "8", "16th": "16",
              "32nd": "32", "64th": "64", "128th": "128", "256th": "256",
              "512th": "512", "1024th": "1024"
            }[type];
            if (noteObj.rest) noteObj.duration += "r";
            break;
          case "dot": // Always follow type; noteObj.duration exists
            var duration = noteObj.duration, rest = duration.indexOf("r");
            if (noteObj.rest) duration = duration.substring(0, rest) + "dr";
            else duration += "d";
            noteObj.duration = duration;
            break;
          case "duration":
            var intrinsicTicks = new Vex.Flow.Fraction(Vex.Flow.RESOLUTION / 4
                                                      * parseInt(elem.textContent),
                                                      attrs.divisions).simplify();
            if (isNaN(intrinsicTicks.numerator)
                || isNaN(intrinsicTicks.denominator))
              throw new Vex.RERR("InvalidMusicXML",
                                 "Error parsing MusicXML duration");
            if (intrinsicTicks.denominator == 1)
              intrinsicTicks = intrinsicTicks.numerator;
            noteObj.intrinsicTicks = intrinsicTicks;
            // TODO: come up with duration string if we don't have a type
            if (! noteObj.duration) noteObj.duration = "4";
            break;
          case "time-modification":
            var num_notes = elem.getElementsByTagName("actual-notes")[0];
            var beats_occupied = elem.getElementsByTagName("normal-notes")[0];
            if (num_notes && beats_occupied) {
              num_notes = parseInt(num_notes.textContent);
              beats_occupied = parseInt(beats_occupied.textContent);
              if (! (num_notes > 0 && beats_occupied > 0)) break;
              noteObj.tickMultiplier = new Vex.Flow.Fraction(beats_occupied, num_notes);
              noteObj.tuplet = {num_notes: num_notes, beats_occupied: beats_occupied};
            }
            break;
          case "rest":
            noteObj.rest = true;
            var step = elem.getElementsByTagName("display-step")[0];
            var octave = elem.getElementsByTagName("display-octave")[0];
            if (step && octave)
              noteObj.keys = [step.textContent + "/" + octave.textContent];
            // FIXME: default length for rest only if length is full measure
            if (! noteObj.duration) noteObj.duration = "1r";
            break;
          case "grace": noteObj.grace = true; break;
          case "chord": noteObj.chord = true; break;
          case "voice":
            var voice = parseInt(elem.textContent);
            if (! isNaN(voice)) noteObj.voice = voice;
            break;
          case "staff":
            var stave = parseInt(elem.textContent);
            if (! isNaN(stave) && stave > 0) noteObj.stave = stave - 1;
            break;
          case "stem":
            if (elem.textContent == "up") noteObj.stem_direction = 1;
            else if (elem.textContent == "down") noteObj.stem_direction = -1;
            break;
          case "beam":
            var beam = elem.textContent;
            if (beam != "begin" && beam != "continue" && beam != "end") break;
            // "continue" overrides begin or end when there are multiple beams
            // TODO: support backward hook/forward hook,
            //       partial beam between groups of notes where needed
            if (noteObj.beam != "continue") noteObj.beam = beam;
            break;
          case "lyric":
            var text = elem.getElementsByTagName("text")[0];
            if (text) text = text.textContent;
            if (text) noteObj.lyric = {text: text};
            break;
          case "notations":
            Array.prototype.forEach.call(elem.childNodes, function(notationElem) {
              switch (notationElem.nodeName) {
                case "tied": // start-start/stop-stop vs begin-continue-end
                  var tie = notationElem.getAttribute("type");
                  switch (tie) {
                    case "start":
                      noteObj.tie = (noteObj.tie == "end") ? "continue" : "begin";
                      break;
                    case "stop":
                      noteObj.tie = (noteObj.tie == "begin") ? "continue" : "end";
                      break;
                    default: Vex.RERR("BadMusicXML", "Bad tie: " + tie.toString());
                  }
                  break;
                // TODO: tuplet
              }
            });
            break;
        }
      });
      // Set default rest position now that we know the stave
      if (noteObj.rest && ! noteObj.keys) {
        var clef = attrs.clef;
        if (clef instanceof Array) clef = clef[noteObj.stave];
        switch (clef) {
          case "bass": noteObj.keys = ["D/3"]; break;
          case "tenor": noteObj.keys = ["A/3"]; break;
          case "alto": noteObj.keys = ["C/4"]; break;
          case "treble": default: noteObj.keys = ["B/4"]; break;
        }
      }
      return noteObj;
    }

    /**
     * Returns complete attributes object for measure m, part p (zero-indexed)
     */
    Vex.Flow.Backend.MusicXML.prototype.getAttributes = function(m, p) {
      var attrs = {};
      // Merge with every previous attributes object in order
      // If value is an array, merge non-null indices only
      for (var i = 0; i <= m; i++) {
        if (! (i in this.attributes)) continue;
        if (! (p in this.attributes[i])) continue;
        var measureAttrs = this.attributes[i][p];
        for (var key in measureAttrs) {
          var val = measureAttrs[key];
          if (val instanceof Array) {
            if (! (attrs[key] && attrs[key] instanceof Array))
              attrs[key] = [];
            for (var ind = 0; ind < val.length; ind++)
              if (typeof attrs[key][ind] == "undefined"
                  || (typeof val[ind] != "undefined" && val[ind] != null))
                attrs[key][ind] = val[ind];
          }
          else attrs[key] = val;
        }
      }

      // Default attributes
      if (! attrs.time) attrs.time = {num_beats: 4, beat_value: 4, soft: true};

      return attrs;
    }

    /**
     * Converts keys as fifths (e.g. -2 for Bb) to the equivalent major key ("Bb").
     * @param {Number} number of fifths from -7 to 7
     * @return {String} string representation of key
     */
    Vex.Flow.Backend.MusicXML.prototype.fifthsToKey = function(fifths) {
      // Find equivalent key in Vex.Flow.keySignature.keySpecs
      for (var i in Vex.Flow.keySignature.keySpecs) {
        var spec = Vex.Flow.keySignature.keySpecs[i];
        if (typeof spec != "object" || ! ("acc" in spec) || ! ("num" in spec))
          continue;
        if (   (fifths < 0 && spec.acc == "b" && spec.num == Math.abs(fifths))
            || (fifths >= 0 && spec.acc != "b" && spec.num == fifths)) return i;
      }
    }

    // Public API here
    

/**
 * DocumentFormatter - format and display a Document
 * @author Daniel Ringwalt (ringw)
 */

/**
 * Accepts document as argument and draws document in discrete blocks
 *
 * @param {Vex.Flow.Document} Document object to retrieve information from
 * @constructor
 */
Vex.Flow.DocumentFormatter = function(document) {
  if (arguments.length > 0) this.init(document);
}

Vex.Flow.DocumentFormatter.prototype.init = function(document) {
  if (typeof document != "object")
    throw new Vex.RERR("ArgumentError",
      "new Vex.Flow.DocumentFormatter() requires Document object argument");
  this.document = document;

  // Groups of measures are contained in blocks (which could correspond to a
  // line or a page of music.)
  // Each block is intended to be drawn on a different canvas.
  // Blocks must be managed by the subclass.
  this.measuresInBlock = []; // block # -> array of measure # in block
  this.blockDimensions = []; // block # -> [width, height]

  // Stave layout managed by subclass
  this.vfStaves = []; // measure # -> stave # -> VexFlow stave

  // Minimum measure widths can be used for formatting by subclasses
  this.minMeasureWidths = [];
  // minMeasureHeights:
  //  this.minMeasureHeights[m][0] is space above measure
  //  this.minMeasureHeights[m][s+1] is minimum height of stave s
  this.minMeasureHeights = [];
}

/**
 * Vex.Flow.DocumentFormatter.prototype.getStaveX: to be defined by subclass
 * Params: m (measure #), s (stave #)
 * Returns: x (number)
 */

/**
 * Calculate vertical position of stave within block
 * @param {Number} Measure number
 * @param {Number} Stave number
 */
Vex.Flow.DocumentFormatter.prototype.getStaveY = function(m, s) {
  // Default behavour: calculate from stave above this one (or 0 for top stave)
  // (Have to make sure not to call getStave on this stave)
  // If s == 0 and we are in a block, use the max extra space above the
  // top stave on any measure in the block
  if (s == 0) {
    var extraSpace = 0;
    // Find block for this measure
    this.measuresInBlock.forEach(function(measures) {
      if (measures.indexOf(m) > -1) {
        var maxExtraSpace = 50 - (new Vex.Flow.Stave(0,0,500).getYForLine(0));
        measures.forEach(function(measure) {
          var extra = this.getMinMeasureHeight(measure)[0];
          if (extra > maxExtraSpace) maxExtraSpace = extra;
        }, this);
        extraSpace = maxExtraSpace;
        return;
      }
    }, this);
    return extraSpace;
  }

  var higherStave = this.getStave(m, s - 1);
  return higherStave.y + higherStave.getHeight();
}

/**
 * Vex.Flow.DocumentFormatter.prototype.getStaveWidth: defined in subclass
 * Params: m (measure #), s (stave #)
 * Returns: width (number) which should be less than the minimum width
 */

/**
 * Create a Vex.Flow.Stave from a Vex.Flow.Measure.Stave.
 * @param {Vex.Flow.Measure.Stave} Original stave object
 * @param {Number} x position
 * @param {Number} y position
 * @param {Number} width of stave
 * @return {Vex.Flow.Stave} Generated stave object
 */
Vex.Flow.DocumentFormatter.prototype.createVexflowStave = function(s, x,y,w) {
  var vfStave = new Vex.Flow.Stave(x, y, w);
  s.modifiers.forEach(function(mod) {
    switch (mod.type) {
      case "clef": vfStave.addClef(mod.clef); break;
      case "key": vfStave.addKeySignature(mod.key); break;
      case "time":
        var time_sig;
        if (typeof mod.time == "string") time_sig = mod.time;
        else time_sig = mod.num_beats.toString() + "/"
                      + mod.beat_value.toString();
        vfStave.addTimeSignature(time_sig);
        break;
    }
  });
  if (typeof s.clef == "string") vfStave.clef = s.clef;
  return vfStave;
}

/**
 * Use getStaveX, getStaveY, getStaveWidth to create a Vex.Flow.Stave from
 * the document and store it in vfStaves.
 * @param {Number} Measure number
 * @param {Number} Stave number
 * @return {Vex.Flow.Stave} Stave for the measure and stave #
 */
Vex.Flow.DocumentFormatter.prototype.getStave = function(m, s) {
  if (m in this.vfStaves && s in this.vfStaves[m])
    return this.vfStaves[m][s];
  if (typeof this.getStaveX != "function"
      || typeof this.getStaveWidth != "function")
    throw new Vex.RERR("MethodNotImplemented",
                "Document formatter must implement getStaveX, getStaveWidth");
  //console.log(m, this.document.getMeasure(m));
  var stave = this.document.getMeasure(m).getStave(s);

  if (! stave) return undefined;
  var vfStave = this.createVexflowStave(stave,
                                        this.getStaveX(m, s),
                                        this.getStaveY(m, s),
                                        this.getStaveWidth(m, s));
  if (! (m in this.vfStaves)) this.vfStaves[m] = [];
  this.vfStaves[m][s] = vfStave;
  return vfStave;
}

/**
 * Create a Vex.Flow.Voice from a Vex.Flow.Measure.Voice.
 * Each note is added to the proper Vex.Flow.Stave in staves
 * (spanning multiple staves in a single voice not currently supported.)
 * @param {Vex.Flow.Measure.Voice} Voice object
 * @param {Array} Vex.Flow.Staves to add the notes to
 * @return {Array} Vex.Flow.Voice, objects to be drawn, optional voice w/lyrics
 */
Vex.Flow.DocumentFormatter.prototype.getVexflowVoice =function(voice, staves){
  var vfVoice = new Vex.Flow.Voice({num_beats: voice.time.num_beats,
                                  beat_value: voice.time.beat_value,
                                  resolution: Vex.Flow.RESOLUTION});
  if (voice.time.soft) vfVoice.setMode(Vex.Flow.Voice.Mode.SOFT);
  // TODO: support spanning multiple staves
  if (typeof voice.stave != "number")
    throw new Vex.RERR("InvalidIRError", "Voice should have stave property");
  vfVoice.setStave(staves[voice.stave]);

  var vexflowObjects = new Array();
  var beamedNotes = null; // array of all vfNotes in beam
  var tiedNote = null; // only last vFNote in tie
  var tupletNotes = null, tupletOpts = null;
  var clef = staves[voice.stave].clef;
  var lyricVoice = null;
  for (var i = 0; i < voice.notes.length; i++) {
    var note = voice.notes[i];
    var vfNote = this.getVexflowNote(voice.notes[i], {clef: clef});
    if (note.beam == "begin") beamedNotes = [vfNote];
    else if (note.beam && beamedNotes) {
      beamedNotes.push(vfNote);
      if (note.beam == "end") {
        vexflowObjects.push(new Vex.Flow.Beam(beamedNotes, true));
        beamedNotes = null;
      }
    }
    if (note.tie == "end" || note.tie == "continue")
      // TODO: Tie only the correct indices
      vexflowObjects.push(new Vex.Flow.StaveTie({
        first_note: tiedNote, last_note: vfNote
      }));
    if (note.tie == "begin" || note.tie == "continue") tiedNote = vfNote;
    if (note.tuplet) {
      if (tupletNotes) tupletNotes.push(vfNote);
      else {
        tupletNotes = [vfNote];
        tupletOpts = note.tuplet;
      }
      if (tupletNotes.length == tupletOpts.num_notes) {
        vexflowObjects.push(new Vex.Flow.Tuplet(tupletNotes, tupletOpts));
        tupletNotes.forEach(function(n) { vfVoice.addTickable(n) });
        tupletNotes = null; tupletOpts = null;
      }
    }
    else vfVoice.addTickable(vfNote);
    if (note.lyric) {
      if (! lyricVoice) {
        lyricVoice = new Vex.Flow.Voice(vfVoice.time);
        if (voice.time.soft) lyricVoice.setMode(Vex.Flow.Voice.Mode.SOFT);
        lyricVoice.setStave(vfVoice.stave);
        // TODO: add padding at start of voice if necessary
      }
      lyricVoice.addTickable(new Vex.Flow.TextNote({
        text: note.lyric.text, duration: note.duration
      }));
    }
    else if (lyricVoice) {
      // Add GhostNote for padding lyric voice
      lyricVoice.addTickable(new Vex.Flow.GhostNote({
        duration: note.duration
      }));
    }
  }
  if (typeof console != "undefined" && console.assert)
      console.assert(vfVoice.stave instanceof Vex.Flow.Stave,
                     "VexFlow voice should have a stave");
  return [vfVoice, vexflowObjects, lyricVoice];
}

/**
 * Create a Vex.Flow.StaveNote from a Vex.Flow.Measure.Note.
 * @param {Vex.Flow.Measure.Note} Note object
 * @param {Object} Options (currently only clef)
 * @return {Vex.Flow.StaveNote} StaveNote object
 */
Vex.Flow.DocumentFormatter.prototype.getVexflowNote = function(note, options) {
  var note_struct = Vex.Merge({}, options);
  note_struct.keys = note.keys;
  note_struct.duration = note.duration;
  if (note.stem_direction) note_struct.stem_direction = note.stem_direction;
  var vfNote = new Vex.Flow.StaveNote(note_struct);
  var i = 0;
  if (note.accidentals instanceof Array)
    note.accidentals.forEach(function(acc) {
      if (acc != null) vfNote.addAccidental(i, new Vex.Flow.Accidental(acc));
      i++;
    });
  var numDots = Vex.Flow.parseNoteDurationString(note.duration).dots;
  for (var i = 0; i < numDots; i++) vfNote.addDotToAll();
  return vfNote;
}

Vex.Flow.DocumentFormatter.prototype.getMinMeasureWidth = function(m) {
  if (! (m in this.minMeasureWidths)) {
    // Calculate the maximum extra width on any stave (due to modifiers)
    var maxExtraWidth = 0;
    var measure = this.document.getMeasure(m);
    var vfStaves = measure.getStaves().map(function(stave) {
      var vfStave = this.createVexflowStave(stave, 0, 0, 500);
      var extraWidth = 500 - (vfStave.getNoteEndX()-vfStave.getNoteStartX());
      if (extraWidth > maxExtraWidth) maxExtraWidth = extraWidth;
      return vfStave;
    }, this);

    // Create dummy canvas to use for formatting (required by TextNote)
    var canvas = document.createElement("canvas");
    var context = Vex.Flow.Renderer.bolsterCanvasContext(
                        canvas.getContext("2d"));

    var allVfVoices = [];
    var startStave = 0; // stave for part to start on
    measure.getParts().forEach(function(part) {
      var numStaves = part.getNumberOfStaves();
      var partStaves = vfStaves.slice(startStave, startStave + numStaves);
      part.getVoices().forEach(function(voice) {
        var vfVoice = this.getVexflowVoice(voice, partStaves)[0];
        allVfVoices.push(vfVoice);
        vfVoice.tickables.forEach(function(t) {
          t.setContext(context)
        });
      }, this);
      startStave += numStaves;
    }, this);
    var formatter = new Vex.Flow.Formatter();
    var noteWidth = formatter.preCalculateMinTotalWidth(allVfVoices);

    // Find max tickables in any voice, add a minimum space between them
    // to get a sane min width
    var maxTickables = 0;
    allVfVoices.forEach(function(v) {
      var numTickables = v.tickables.length;
      if (numTickables > maxTickables) maxTickables = numTickables;
    });
    this.minMeasureWidths[m] = Vex.Max(50,
             maxExtraWidth + noteWidth + maxTickables*10 + 10);

    // Calculate minMeasureHeight by merging bounding boxes from each voice
    // and the bounding box from the stave
    var minHeights = [];
    // Initialize to zero
    for (var i = 0; i < vfStaves.length + 1; i++) minHeights.push(0);

    var i=-1; // allVfVoices consecutive by stave, increment for each new stave
    var lastStave = null;
    var staveY = vfStaves[0].getYForLine(0);
    var staveH = vfStaves[0].getYForLine(4) - staveY;
    var lastBoundingBox = null;
    allVfVoices.forEach(function(v) {
      if (v.stave !== lastStave) {
        if (i >= 0) {
          minHeights[i]  += -lastBoundingBox.getY();
          minHeights[i+1] =  lastBoundingBox.getH()
                            +lastBoundingBox.getY();
        }
        lastBoundingBox = new Vex.Flow.BoundingBox(0, staveY, 500, staveH);
        lastStave = v.stave;
        i++;
      }
      lastBoundingBox.mergeWith(v.getBoundingBox());
    });
    minHeights[i]  += -lastBoundingBox.getY();
    minHeights[i+1] =  lastBoundingBox.getH()
                      +lastBoundingBox.getY();
    this.minMeasureHeights[m] = minHeights;
  }
  return this.minMeasureWidths[m];
};

Vex.Flow.DocumentFormatter.prototype.getMinMeasureHeight = function(m) {
  if (! (m in this.minMeasureHeights)) this.getMinMeasureWidth(m);
  return this.minMeasureHeights[m];
}

// Internal drawing functions
Vex.Flow.DocumentFormatter.prototype.drawPart =
  function(part, vfStaves, context) {
  var staves = part.getStaves();
  var voices = part.getVoices();

  vfStaves.forEach(function(stave) { stave.setContext(context).draw(); });

  var allVfObjects = new Array();
  var vfVoices = new Array();
  voices.forEach(function(voice) {
    var result = this.getVexflowVoice(voice, vfStaves);
    Array.prototype.push.apply(allVfObjects, result[1]);
    var vfVoice = result[0];
    var lyricVoice = result[2];
    vfVoice.tickables.forEach(function(tickable) {
      tickable.setStave(vfVoice.stave); });
    vfVoices.push(vfVoice);
    if (lyricVoice) {
      lyricVoice.tickables.forEach(function(tickable) {
        tickable.setStave(lyricVoice.stave); });
      vfVoices.push(lyricVoice);
    }
  }, this);
  var formatter = new Vex.Flow.Formatter().joinVoices(vfVoices);
  formatter.format(vfVoices, vfStaves[0].getNoteEndX()
                             - vfStaves[0].getNoteStartX() - 10);
  var i = 0;
  vfVoices.forEach(function(vfVoice) {
    vfVoice.draw(context, vfVoice.stave); });
  allVfObjects.forEach(function(obj) {
    obj.setContext(context).draw(); });
}

// Options contains system_start, system_end for measure
Vex.Flow.DocumentFormatter.prototype.drawMeasure =
  function(measure, vfStaves, context, options) {
  var startStave = 0;
  var parts = measure.getParts();
  parts.forEach(function(part) {
    var numStaves = part.getNumberOfStaves();
    var partStaves = vfStaves.slice(startStave, startStave + numStaves);
    this.drawPart(part, partStaves, context);
    startStave += numStaves;
  }, this);

  this.document.getStaveConnectors().forEach(function(connector) {
    if (! ((options.system_start && connector.system_start)
        || (options.system_end && connector.system_end)
        || connector.measure_start)) return;
    var firstPart = connector.parts[0],
        lastPart = connector.parts[connector.parts.length - 1];
    var firstStave, lastStave;
    // Go through each part in measure to find the stave index
    var staveNum = 0, partNum = 0;
    parts.forEach(function(part) {
      if (partNum == firstPart) firstStave = staveNum;
      if (partNum == lastPart)
        lastStave = staveNum + part.getNumberOfStaves() - 1;
      staveNum += part.getNumberOfStaves();
      partNum++;
    });
    if (isNaN(firstStave) || isNaN(lastStave)) return;
    var type = connector.type == "single" ? Vex.Flow.StaveConnector.type.SINGLE
             : connector.type == "double" ? Vex.Flow.StaveConnector.type.DOUBLE
             : connector.type == "brace"  ? Vex.Flow.StaveConnector.type.BRACE
             : connector.type =="bracket"? Vex.Flow.StaveConnector.type.BRACKET
             : null;
    if ((options.system_start && connector.system_start)
        || connector.measure_start) {
      (new Vex.Flow.StaveConnector(vfStaves[firstStave], vfStaves[lastStave])
          ).setType(type).setContext(context).draw();
    }
    if (options.system_end && connector.system_end) {
      var stave1 = vfStaves[firstStave], stave2 = vfStaves[lastStave];
      var dummy1 = new Vex.Flow.Stave(stave1.x + stave1.width,
                                      stave1.y, 100);
      var dummy2 = new Vex.Flow.Stave(stave2.x + stave2.width,
                                      stave2.y, 100);
      (new Vex.Flow.StaveConnector(dummy1, dummy2)
          ).setType(type).setContext(context).draw();
    }
  });
}

Vex.Flow.DocumentFormatter.prototype.drawBlock = function(b, context) {
  this.getBlock(b);
  var measures = this.measuresInBlock[b];

  measures.forEach(function(m) {
    var stave = 0;
    while (this.getStave(m, stave)) stave++;

    this.drawMeasure(this.document.getMeasure(m), this.vfStaves[m], context,
                     {system_start: m == measures[0],
                      system_end: m == measures[measures.length - 1]});
  }, this);
}

/**
 * Vex.Flow.DocumentFormatter.prototype.draw - defined in subclass
 * Render document inside HTML element, creating canvases, etc.
 * Called a second time to update as necessary if the width of the element
 * changes, etc.
 * @param {Node} HTML node to draw inside
 * @param {Object} Subclass-specific options
 */

/**
 * Vex.Flow.DocumentFormatter.Liquid - default liquid formatter
 * Fit measures onto lines with a given width, in blocks of 1 line of music
 *
 * @constructor
 */
Vex.Flow.DocumentFormatter.Liquid = function(document) {
  if (arguments.length > 0) Vex.Flow.DocumentFormatter.call(this, document);
  this.width = 500; // default value
  this.zoom = 0.8;
  this.scale = 1.0;
  if (typeof window.devicePixelRatio == "number"
      && window.devicePixelRatio > 1)
    this.scale = Math.floor(window.devicePixelRatio);
}
Vex.Flow.DocumentFormatter.Liquid.prototype = new Vex.Flow.DocumentFormatter();
Vex.Flow.DocumentFormatter.Liquid.constructor
  = Vex.Flow.DocumentFormatter.Liquid;

Vex.Flow.DocumentFormatter.Liquid.prototype.setWidth = function(width) {
  this.width = width; return this; }

Vex.Flow.DocumentFormatter.Liquid.prototype.getBlock = function(b) {
  if (b in this.blockDimensions) return this.blockDimensions[b];

  var startMeasure = 0;
  if (b > 0) {
    this.getBlock(b - 1);
    var prevMeasures = this.measuresInBlock[b - 1];
    startMeasure = prevMeasures[prevMeasures.length - 1] + 1;
  }
  var numMeasures = this.document.getNumberOfMeasures();
  if (startMeasure >= numMeasures) return null;

  // Update modifiers for first measure
  this.document.getMeasure(startMeasure).getStaves().forEach(function(s) {
    console.log(s);

    if (typeof s.clef == "string" && ! s.getModifier("clef")) {
      s.addModifier({type: "clef", clef: s.clef, automatic: true});
    }
    if (typeof s.key == "string" && ! s.getModifier("key")) {
      s.addModifier({type: "key", key: s.key, automatic: true});
    }

    // Time signature on first measure of piece only
    if (startMeasure == 0 && ! s.getModifier("time")) {
      if (typeof s.time_signature == "string") {
        //console.log(s);
        s.addModifier({type: "time", time: s.time_signature,automatic:true});
      }
      //else if (typeof s.time == "object" && ! s.time.soft)
      else if (typeof s.time == "object")
        s.addModifier(Vex.Merge({type: "time", automatic: true}, s.time));
    }
  });
  
  // Store x, width of staves (y calculated automatically)
  if (! this.measureX) this.measureX = new Array();
  if (! this.measureWidth) this.measureWidth = new Array();

  // Calculate start x (15 if there are braces, 10 otherwise)
  var start_x = 10;
  this.document.getMeasure(startMeasure).getParts().forEach(function(part) {
    if (part.showsBrace()) start_x = 15;
  });

  if (this.getMinMeasureWidth(startMeasure) + start_x + 10 >= this.width) {
    // Use only this measure and the minimum possible width
    var block = [this.getMinMeasureWidth(startMeasure) + start_x + 10, 0];
    this.blockDimensions[b] = block;
    this.measuresInBlock[b] = [startMeasure];
    this.measureX[startMeasure] = start_x;
    this.measureWidth[startMeasure] = block[0] - start_x - 10;
  }
  else {
    var curMeasure = startMeasure;
    var width = start_x + 10;
    while (width < this.width && curMeasure < numMeasures) {
      // Except for first measure, remove automatic modifiers
      // If there were any, invalidate the measure width
      if (curMeasure != startMeasure)
        this.document.getMeasure(curMeasure).getStaves().forEach(function(s) {
          if (s.deleteAutomaticModifiers()
              && this.minMeasureWidths && curMeasure in this.minMeasureWidths)
            delete this.minMeasureWidths[curMeasure];
        });
      width += this.getMinMeasureWidth(curMeasure);
      curMeasure++;
    }
    var endMeasure = curMeasure - 1;
    var measureRange = [];
    for (var m = startMeasure; m <= endMeasure; m++) measureRange.push(m);
    this.measuresInBlock[b] = measureRange;

    // Allocate width to measures
    var remainingWidth = this.width - start_x - 10;
    for (var m = startMeasure; m <= endMeasure; m++) {
      // Set each width to the minimum
      this.measureWidth[m] = Math.ceil(this.getMinMeasureWidth(m));
      remainingWidth -= this.measureWidth[m];
    }
    // Split rest of width evenly
    var extraWidth = Math.floor(remainingWidth / (endMeasure-startMeasure+1));
    for (var m = startMeasure; m <= endMeasure; m++)
      this.measureWidth[m] += extraWidth;
    remainingWidth -= extraWidth * (endMeasure - startMeasure + 1);
    this.measureWidth[startMeasure] += remainingWidth; // Add remainder
    // Calculate x value for each measure
    this.measureX[startMeasure] = start_x;
    for (var m = startMeasure + 1; m <= endMeasure; m++)
      this.measureX[m] = this.measureX[m-1] + this.measureWidth[m-1];
    this.blockDimensions[b] = [this.width, 0];
  }

  // Calculate height of first measure
  var i = 0;
  var lastStave = undefined;
  var stave = this.getStave(startMeasure, 0);
  while (stave) {
    lastStave = stave;
    i++;
    stave = this.getStave(startMeasure, i);
  }
  var height = this.getStaveY(startMeasure, i-1);
  // Add max extra space for last stave on any measure in this block
  var maxExtraHeight = 90; // default: height of stave
  for (var i = startMeasure; i <= endMeasure; i++) {
    var minHeights = this.getMinMeasureHeight(i);
    var extraHeight = minHeights[minHeights.length - 1];
    if (extraHeight > maxExtraHeight) maxExtraHeight = extraHeight;
  }
  height += maxExtraHeight;
  this.blockDimensions[b][1] = height;

  return this.blockDimensions[b];
}

Vex.Flow.DocumentFormatter.Liquid.prototype.getStaveX = function(m, s) {
  if (! (m in this.measureX))
    throw new Vex.RERR("FormattingError",
                "Creating stave for measure which does not belong to a block");
  return this.measureX[m];
}

Vex.Flow.DocumentFormatter.Liquid.prototype.getStaveWidth = function(m, s) {
  if (! (m in this.measureWidth))
    throw new Vex.RERR("FormattingError",
                "Creating stave for measure which does not belong to a block");
  return this.measureWidth[m];
}

Vex.Flow.DocumentFormatter.Liquid.prototype.draw = function(elem, options) {
  if (this._htmlElem != elem) {
    this._htmlElem = elem;
    elem.innerHTML = "";
    this.canvases = [];
  }

  //var canvasWidth = $(elem).width() - 10; // TODO: remove jQuery dependency
  var canvasWidth = elem.offsetWidth - 10; 

  var renderWidth = Math.floor(canvasWidth / this.zoom);

  // Invalidate all blocks/staves/voices
  this.minMeasureWidths = []; // heights don't change with stave modifiers
  this.measuresInBlock = [];
  this.blockDimensions = [];
  this.vfStaves = [];
  this.measureX = [];
  this.measureWidth = [];
  this.setWidth(renderWidth);

  // Remove all non-canvas child nodes of elem using jQuery
  $(elem).children(":not(canvas)").remove();

  var b = 0;
  while (this.getBlock(b)) {
    var canvas, context;
    var dims = this.blockDimensions[b];
    var width = Math.ceil(dims[0] * this.zoom);
    var height = Math.ceil(dims[1] * this.zoom);

    if (! this.canvases[b]) {
      canvas = document.createElement('canvas');
      canvas.width = width * this.scale;
      canvas.height = height * this.scale;
      if (this.scale > 1) {
        canvas.style.width = width.toString() + "px";
        canvas.style.height = height.toString() + "px";
      }
      canvas.id = elem.id + "_canvas" + b.toString();
      // If a canvas exists after this one, insert before that canvas
      for (var a = b + 1; this.getBlock(a); a++)
        if (typeof this.canvases[a] == "object") {
          elem.insertBefore(canvas, this.canvases[a]);
          break;
        }
      if (! canvas.parentNode)
        elem.appendChild(canvas); // Insert at the end of elem
      this.canvases[b] = canvas;
      context = Vex.Flow.Renderer.bolsterCanvasContext(canvas.getContext("2d"));
    }
    else {
      canvas = this.canvases[b];
      canvas.style.display = "inherit";
      canvas.width = width * this.scale;
      canvas.height = height * this.scale;
      if (this.scale > 1) {
        canvas.style.width = width.toString() + "px";
        canvas.style.height = height.toString() + "px";
      }
      context = Vex.Flow.Renderer.bolsterCanvasContext(canvas.getContext("2d"));
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
    // TODO: Figure out why setFont method is called
    if (typeof context.setFont != "function") {
      context.setFont = function(font) { this.font = font; return this; };
    }
    context.scale(this.zoom * this.scale, this.zoom * this.scale);

    this.drawBlock(b, context);
    // Add anchor elements before canvas
    var lineAnchor = document.createElement("a");
    lineAnchor.id = elem.id + "_line" + (b+1).toString();
    elem.insertBefore(lineAnchor, canvas);
    this.measuresInBlock[b].forEach(function(m) {
      var anchor = elem.id + "_m" +
                   this.document.getMeasureNumber(m).toString();
      var anchorElem = document.createElement("a");
      anchorElem.id = anchor;
      elem.insertBefore(anchorElem, canvas);
    }, this);
    b++;
  }
  while (typeof this.canvases[b] == "object") {
    // Remove canvases beyond the last one we are using
    elem.removeChild(this.canvases[b]);
    delete this.canvases[b];
    b++;
  }
}
/**
 * Measure - intermediate representation of measures of a Vex.Flow.Document
 * @author Daniel Ringwalt (ringw)
 */

/** @constructor */
Vex.Flow.Measure = function(object) {
  if (typeof object != "object")
    throw new Vex.RERR("ArgumentError","Invalid argument to Vex.Flow.Measure");
  if (! object.time || ! object.time.num_beats || ! object.time.beat_value)
    throw new Vex.RERR("ArgumentError",
          "Measure must be initialized with nonzero num_beats and beat_value");
  this.time = Vex.Merge({}, object.time);

  this.attributes = {};
  if (typeof object.attributes == "object")
    Vex.Merge(this.attributes, object.attributes);
  this.parts = new Array(1); // default to 1 part
  if (typeof object.getParts == "function")
    this.parts = object.getParts(); // Copy parts from first-class object
  else if (object.parts instanceof Array) {
    this.parts.length = object.parts.length;
    for (var i = 0; i < object.parts.length; i++)
      this.parts[i] = new Vex.Flow.Measure.Part(object.parts[i]);
  }

  this.type = "measure";
}

Vex.Flow.Measure.prototype.setAttributes = function(attributes) {
  Vex.Merge(this.attributes, attributes);
}

Vex.Flow.Measure.prototype.getNumberOfParts = function(numParts) {
  return this.parts.length;
}
Vex.Flow.Measure.prototype.setNumberOfParts = function(numParts) {
  this.parts.length = numParts;
}

Vex.Flow.Measure.prototype.getPart = function(partNum) {
  if (! this.parts[partNum]) {
    // Create empty part
    this.parts[partNum] = new Vex.Flow.Measure.Part({time: this.time});
  }
  return this.parts[partNum];
}
Vex.Flow.Measure.prototype.setPart = function(partNum, part) {
  if (this.parts.length <= partNum)
    throw new Vex.RERR("ArgumentError",
                       "Set number of parts before adding part");
  this.parts[partNum] = new Vex.Flow.Measure.Part(part);
}
Vex.Flow.Measure.prototype.getParts = function() {
  for (var i = 0; i < this.parts.length; i++) this.getPart(i);
  return this.parts.slice(0); // copy array
}

Vex.Flow.Measure.prototype.getNumberOfStaves = function() {
  // Sum number of staves from each part
  var totalStaves = 0;
  for (var i = 0; i < this.getNumberOfParts(); i++)
    totalStaves += this.getPart(i).getNumberOfStaves();
  return totalStaves;
}
Vex.Flow.Measure.prototype.getStave = function(staveNum) {
  var firstStaveForPart = 0;
  for (var i = 0; i < this.getNumberOfParts(); i++) {
    var part = this.getPart(i);
    if (firstStaveForPart + part.getNumberOfStaves() > staveNum)
      return part.getStave(staveNum - firstStaveForPart);
    firstStaveForPart += part.getNumberOfStaves();
  }
  return undefined;
}
Vex.Flow.Measure.prototype.getStaves = function() {
  var numStaves = this.getNumberOfStaves();
  var staves = new Array();
  for (var i = 0; i < numStaves; i++) staves.push(this.getStave(i));
  return staves;
}

/**
 * Add a note to the end of the voice.
 * This is a convenience method that only works when there is one part and
 * one voice. If there is no room for the note, a Vex.RuntimeError is thrown.
 * @param {Object} Note object
 */
Vex.Flow.Measure.prototype.addNote = function(note) {
  if (this.getNumberOfParts() != 1)
    throw new Vex.RERR("ArgumentError","Measure.addNote requires single part");
  this.getPart(0).addNote(note);
}

/**
 * Vex.Flow.Measure.Part - a single part (may include multiple staves/voices)
 * @constructor
 */
Vex.Flow.Measure.Part = function(object) {
  if (typeof object != "object")
    throw new Vex.RERR("ArgumentError", "Invalid argument to constructor");
  if (! object.time || ! object.time.num_beats || ! object.time.beat_value)
    throw new Vex.RERR("ArgumentError",
              "Constructor requires nonzero num_beats and beat_value");
  this.time = Vex.Merge({}, object.time);

  // Convenience options which can be set on a part instead of a stave/voice
  this.options = {time: this.time};
  if (typeof object.clef == "string") this.options.clef = object.clef;
  if (typeof object.key == "string") this.options.key = object.key;
  if (typeof object.time_signature == "string") {
    this.options.time_signature = object.time_signature;
  }
  if (typeof object.options == "object")
    Vex.Merge(this.options, object.options);

  if (typeof object.getVoices == "function") this.voices = object.getVoices();
  else if (object.voices instanceof Array) {
    var voiceOptions = this.options;
    this.voices = object.voices.map(function(voice) {
      // Copy voiceOptions and overwrite with options from argument
      return new Vex.Flow.Measure.Voice(
        Vex.Merge(Vex.Merge({}, voiceOptions), voice));
    });
  }
  else this.voices = new Array(1); // Default to single voice

  if (typeof object.getStaves == "function") this.staves = object.getStaves();
  else if (object.staves instanceof Array) {
    var staveOptions = this.options;
    this.staves = object.staves.map(function(stave) {
      var staveObj;
      if (typeof stave == "string") // interpret stave as clef value
        staveObj = Vex.Merge({clef: stave}, staveOptions);
      // Copy staveOptions and overwrite with options from argument
      else staveObj = Vex.Merge(Vex.Merge({}, staveOptions), stave);
      return new Vex.Flow.Measure.Stave(staveObj);
    });
  }
  else {
    if (typeof object.staves == "number")
      this.staves = new Array(object.staves);
    else this.staves = new Array(1);
  }

  this.type = "part";
}

Vex.Flow.Measure.Part.prototype.getNumberOfVoices = function(numVoices) {
  return this.voices.length;
}
Vex.Flow.Measure.Part.prototype.setNumberOfVoices = function(numVoices) {
  this.voices.length = numVoices;
}
Vex.Flow.Measure.Part.prototype.getVoice = function(voiceNum) {
  if (! this.voices[voiceNum])
    // Create empty voice
    this.voices[voiceNum] = new Vex.Flow.Measure.Voice(
                              Vex.Merge({time: this.time}, this.options));
  return this.voices[voiceNum];
}
Vex.Flow.Measure.Part.prototype.setVoice = function(voiceNum, voice) {
  if (this.voices.length <= voiceNum)
    throw new Vex.RERR("ArgumentError",
                       "Set number of voices before adding voice");
  this.voices[voiceNum] = new Vex.Flow.Measure.Voice(voice);
}
Vex.Flow.Measure.Part.prototype.getVoices = function() {
  for (var i = 0; i < this.getNumberOfVoices(); i++) this.getVoice(i);
  return this.voices.slice(0);
}

Vex.Flow.Measure.Part.prototype.getNumberOfStaves = function(numStaves) {
  return this.staves.length;
}
Vex.Flow.Measure.Part.prototype.setNumberOfStaves = function(numStaves) {
  this.staves.length = numStaves;
}
Vex.Flow.Measure.Part.prototype.getStave = function(staveNum) {
  if (! this.staves[staveNum]) {
    // Create empty stave
    this.staves[staveNum] = new Vex.Flow.Measure.Stave(
                              Vex.Merge({time: this.time}, this.options));
  }
  return this.staves[staveNum];
}
Vex.Flow.Measure.Part.prototype.setStave = function(staveNum, stave) {
  if (this.staves.length <= staveNum)
    throw new Vex.RERR("ArgumentError",
                       "Set number of staves before adding stave");
  this.staves[staveNum] = new Vex.Flow.Measure.Stave(
                            Vex.Merge(Vex.Merge({}, this.options), stave));
}
Vex.Flow.Measure.Part.prototype.getStaves = function() {
  for (var i = 0; i < this.getNumberOfStaves(); i++) this.getStave(i);
  return this.staves.slice(0);
}

/* True if there should be a brace at the start of every line for this part. */
Vex.Flow.Measure.Part.prototype.showsBrace = function() {
  return (this.staves.length > 1);
}

/**
 * Add a note to the end of the voice.
 * This is a convenience method that only works when the part only has
 * one voice. If there is no room for the note, a Vex.RuntimeError is thrown.
 * @param {Object} Note object
 */
Vex.Flow.Measure.Part.prototype.addNote = function(note) {
  if (this.getNumberOfVoices() != 1)
    throw new Vex.RERR("ArgumentError","Measure.addNote requires single part");
  this.getVoice(0).addNote(note);
}

/**
 * Vex.Flow.Measure.Voice - a voice which contains notes, etc
 * @constructor
 */
Vex.Flow.Measure.Voice = function(object) {
  if (typeof object != "object")
    throw new Vex.RERR("ArgumentError", "Invalid argument to constructor");
  if (! object.time || ! object.time.num_beats || ! object.time.beat_value)
    throw new Vex.RERR("ArgumentError",
              "Constructor requires nonzero num_beats and beat_value");
  this.time = Vex.Merge({}, object.time);
  this.key = (typeof object.key == "string") ? object.key : null;
  this.notes = new Array();
  if (object.notes instanceof Array)
    object.notes.forEach(function(note) {
      this.addNote(new Vex.Flow.Measure.Note(note)); }, this);
  else this.notes = new Array();

  // Voice must currently be on a single stave
  if (typeof object.stave == "number") this.stave = object.stave;
  else this.stave = 0;

  this.type = "voice";
}

Vex.Flow.Measure.Voice.keyAccidentals = function(key) {
  var acc = {C:null, D:null, E:null, F:null, G:null, A:null, B:null};
  var acc_order = {"b": ["B","E","A","D","G","C","F"],
                   "#": ["F","C","G","D","A","E","B"]};
  var key_acc = Vex.Flow.keySignature.keySpecs[key];
  var key_acctype = key_acc.acc, num_acc = key_acc.num;
  for (var i = 0; i < num_acc; i++)
    acc[acc_order[key_acctype][i]] = key_acctype;
  return acc;
}

/**
 * Add a note to the end of the voice.
 * If there is no room for the note, a Vex.RuntimeError is thrown.
 * @param {Object} Note object
 */
Vex.Flow.Measure.Voice.prototype.addNote = function(note) {
  // TODO: Check total ticks in voice
  var noteObj = new Vex.Flow.Measure.Note(note); // copy note
  if (!note.rest && this.key && note.accidentals == null) {
    // Generate accidentals automatically
    // Track accidentals used previously in measure
    if (! this._accidentals)
      this._accidentals = Vex.Flow.Measure.Voice.keyAccidentals(this.key);
    var accidentals = this._accidentals;
    var i = 0;
    noteObj.accidentals = noteObj.keys.map(function(key) {
      var acc = Vex.Flow.Measure.Note.Key.GetAccidental(key);
      if (acc == "n") {
        // Force natural
        accidentals[key] = null;
      }
      else {
        var key = note.keys[i][0].toUpperCase(); // letter name of key
        if (accidentals[key] == acc) acc = null;
        else {
          accidentals[key] = acc;
          if (acc == null) acc = "n";
        }
      }
      i++;
      return acc;
    });
  }
  this.notes.push(new Vex.Flow.Measure.Note(noteObj));
}

/**
 * Vex.Flow.Measure.Stave - represent one "stave" for one measure
 * (corresponds to a Vex.Flow.Stave)
 * @constructor
 */
Vex.Flow.Measure.Stave = function(object) {
  if (typeof object != "object")
    throw new Vex.RERR("ArgumentError", "Invalid argument to constructor");
  if (! object.time || ! object.time.num_beats || ! object.time.beat_value)
    throw new Vex.RERR("ArgumentError",
              "Constructor requires nonzero num_beats and beat_value");
  this.time = Vex.Merge({}, object.time);
  if (typeof object.clef != "string")
    throw new Vex.RERR("InvalidIRError",
              "Stave object requires clef property");
  this.clef = object.clef;
  this.key = (typeof object.key == "string") ? object.key : null;
  this.modifiers = new Array();
  if (object.modifiers instanceof Array) {
    for (var i = 0; i < object.modifiers.length; i++)
      this.addModifier(object.modifiers[i]);  
  }

  this.type = "stave";
}

/**
 * Adds a modifier (clef, etc.), which is just a plain object with a type
 * and other properties.
 */
Vex.Flow.Measure.Stave.prototype.addModifier = function(modifier) {
  // Type is required for modifiers
  if (typeof modifier != "object" || typeof modifier.type != "string")
    throw new Vex.RERR("InvalidIRError",
                       "Stave modifier requires type string property");
  // Copy modifier
  // Automatic modifier: created by formatter, can be deleted
  var newModifier = {type: modifier.type,
                     automatic: !!(modifier.automatic) // Force true/false
                     };
  switch (modifier.type) {
    case "clef":
      if (typeof modifier.clef != "string")
        throw new Vex.RERR("InvalidIRError",
                           "Clef modifier requires clef string");
      newModifier.clef = modifier.clef;
      break;
    case "key":
      if (typeof modifier.key != "string")
        throw new Vex.RERR("InvalidIRError",
                           "Key modifier requires key string");
      newModifier.key = modifier.key;
      break;
    case "time":
      if (! modifier.num_beats || ! modifier.beat_value)
        throw new Vex.RERR("InvalidIRError",
                    "Time modifier requires nonzero num_beats and beat_value");
      newModifier.num_beats = modifier.num_beats;
      newModifier.beat_value = modifier.beat_value;
      break;
    default:
      throw new Vex.RERR("InvalidIRError", "Modifier not recognized");
  }
  this.modifiers.push(newModifier);
}

/**
 * Find the modifier with the given type, or return null.
 */
Vex.Flow.Measure.Stave.prototype.getModifier = function(type) {
  var mod = null;
  this.modifiers.forEach(function(m) { if (m.type == type) mod = m; });
  return mod;
}

/**
 * Delete modifier(s) which have the given type.
 *
 * @param {String} Type of modifier
 */
Vex.Flow.Measure.Stave.prototype.deleteModifier = function(modifier) {
  if (typeof modifier != "string")
    throw new Vex.RERR("ArgumentError",
                       "deleteModifier requires string argument");
  // Create new modifier array with non-matching modifiers
  var newModifiers = new Array();
  this.modifiers.forEach(function(mod) {
    if (mod.type != modifier) newModifiers.push(mod);
  });
  this.modifiers = newModifiers;
}

/**
 * Delete all automatic modifiers (used by formatter when a measure is no
 * longer at the beginning of a system.)
 * @return {Boolean} Whether any modifiers were deleted
 */
Vex.Flow.Measure.Stave.prototype.deleteAutomaticModifiers = function() {
  // Create new modifier array with modifiers that remain
  var anyDeleted = false;
  var newModifiers = new Array();
  this.modifiers.forEach(function(mod) {
    if (mod.automatic) anyDeleted = true;
    else newModifiers.push(mod);
  });
  this.modifiers = newModifiers;
  return anyDeleted;
}

/**
 * Vex.Flow.Measure.Note - a single note (includes chords, rests, etc.)
 * @constructor
 */
Vex.Flow.Measure.Note = function(object) {
  if (typeof object != "object")
    throw new Vex.RERR("ArgumentError", "Invalid argument to constructor");
  if (object.keys instanceof Array)
    // Copy keys array, converting each key value to the standard
    this.keys = object.keys.map(Vex.Flow.Measure.Note.Key);
  else this.keys = new Array();
  if (object.accidentals instanceof Array) {
    if (object.accidentals.length != this.keys.length)
      throw new Vex.RERR("InvalidIRError",
                         "accidentals and keys must have same length");
    this.accidentals = object.accidentals.slice(0);
  }
  else this.accidentals = null; // default accidentals
  // Note: accidentals set by voice if this.accidentals == null
  //       no accidentals           if this.accidentals == [null, ...]
  this.duration = object.duration;
  this.rest = !!(object.rest); // force true or false
  this.intrinsicTicks = (object.intrinsicTicks > 0)
                      ? object.intrinsicTicks : null;
  this.tickMultiplier = (typeof object.tickMultiplier == "object"
                         && object.tickMultiplier)
                      ? new Vex.Flow.Fraction(object.tickMultiplier.numerator,
                              object.tickMultiplier.denominator)
                      : this.intrinsicTicks
                      ? new Vex.Flow.Fraction(1, 1) : null;
  this.tuplet = (typeof object.tuplet == "object" && object.tuplet)
              ? {num_notes: object.tuplet.num_notes,
                 beats_occupied: object.tuplet.beats_occupied}
              : null;
  this.stem_direction = (typeof object.stem_direction == "number")
                      ? object.stem_direction : null;
  this.beam = (typeof object.beam == "string")
            ? object.beam : null;
  this.tie = (typeof object.tie == "string")
           ? object.tie : null;
  this.lyric = (typeof object.lyric == "object" && object.lyric)
             ? {text: object.lyric.text}
             : null;

  this.type = "note";
}

/* Standardize a key string, returning the result */
Vex.Flow.Measure.Note.Key = function(key) {
  // Remove natural, get properties
  var keyProperties = Vex.Flow.keyProperties(key.replace(/n/i, ""), "treble");
  return keyProperties.key + "/" + keyProperties.octave.toString();
}
/* Default accidental value from key */
Vex.Flow.Measure.Note.Key.GetAccidental = function(key) {
  // Keep natural, return accidental from properties
  return Vex.Flow.keyProperties(key, "treble").accidental;
}
        /**
     * Document - generic document object to be formatted and displayed
     * @author Daniel Ringwalt (ringw)
     */

    if (! Vex.Flow.Backend) Vex.Flow.Backend = {};

    /**
     * Vex.Flow.Backend.IR - return measures from intermediate JSON representation
     * @constructor
     */
    Vex.Flow.Backend.IR = function() {
      this.documentObject = null;
    }

    /**
     * "Parse" an existing IR document object (not necessarily a Document instance)
     * @param object The original document object
     */
    Vex.Flow.Backend.IR.prototype.parse = function(object) {
      if (! Vex.Flow.Backend.IR.appearsValid(object))
        throw new Vex.RERR("InvalidArgument",
                           "IR object must be a valid document");
      
      // Force a first-class document object to get all measures
      if (typeof object.getNumberOfMeasures == "function"
          && typeof object.getMeasure == "function") {
        var numMeasures = object.getNumberOfMeasures();
        for (var i = 0; i < numMeasures; i++) object.getMeasure(i);
      }
      this.documentObject = object;
      this.valid = true;
    }

    /**
     * Returns true if the passed-in code parsed without errors.
     *
     * @return {Boolean} True if code is error-free.
     */
    Vex.Flow.Backend.IR.prototype.isValid = function() { return this.valid; }

    /**
     * Class method.
     * Returns true if the argument appears to a valid document object.
     * Used when automatically detecting VexFlow IR.
     *
     * @return {Boolean} True if object looks like a valid document.
     */
    Vex.Flow.Backend.IR.appearsValid = function(object) {
      return typeof object == "object" && object.type == "document";
    }

    /**
     * Number of measures in the document
     *
     * @return {Number} Total number of measures
     */
    Vex.Flow.Backend.IR.prototype.getNumberOfMeasures = function() {  
      return this.documentObject.measures.length;
    }

    /**
     * Create the ith measure from this.measures[i]
     *
     * @return {Vex.Flow.Measure} ith measure as a Measure object
     */
    Vex.Flow.Backend.IR.prototype.getMeasure = function(i) {
      return new Vex.Flow.Measure(this.documentObject.measures[i]);
    }

    /**
     * @return {Array} Stave connectors
     * Each stave connector has a type, array of parts, and one or more true
     * out of system_start, measure_start, and system_end.
     */
    Vex.Flow.Backend.IR.prototype.getStaveConnectors = function() {
      if (typeof this.documentObject.getStaveConnectors == "function")
        return this.documentObject.getStaveConnectors();
      return [];
    }

    /**
     * Vex.Flow.Document - generic container of measures generated by a backend
     * @constructor
     */
    Vex.Flow.Document = function(data, options) {
      if (arguments.length > 0) this.init(data, options);
    }

    Vex.Flow.Document.backends = [Vex.Flow.Backend.IR, Vex.Flow.Backend.MusicXML];

    Vex.Flow.Document.prototype.init = function(data, options) {
      this.options = {};
      Vex.Merge(this.options, options);
      this.measures = new Array();
      if (! data) {
        this.backend = null;
        return;
      }

      // Optionally pass constructor function for backend
      var backends = (typeof this.options.backend == "function")
                     ? [this.options.backend] : Vex.Flow.Document.backends;

      // find a valid backend for the data passed
      for (var i = 0; i < backends.length; i++) {
        var Backend = backends[i];
        if (Backend.appearsValid(data)) {
          this.backend = new Backend();
          this.backend.parse(data);
          if (! this.backend.isValid()) {
            throw new Vex.RERR("ParseError", "Could not parse document data");
          }
        }
      }
      if (! this.backend) {
        throw new Vex.RERR("ParseError", "Data in document is not supported");
      }

      this.type = "document";
    }

    /**
     * Create a formatter with a copy of the document
     * (formatter may add clefs, etc. when formatting document)
     * @param {Function} Class of formatter
     * @return {Vex.Flow.DocumentFormatter} Document formatter with document copy
     */
    Vex.Flow.Document.prototype.getFormatter = function(formatterClass) {
      var Formatter = formatterClass;
      if (typeof formatterClass != "function")
        Formatter = Vex.Flow.DocumentFormatter.Liquid; // default class
      return new Formatter(new Vex.Flow.Document(this));
    }

    /**
     * Number of measures in the document
     * @return {Number} Total number of measures
     */
    Vex.Flow.Document.prototype.getNumberOfMeasures = function() {
      return this.backend.getNumberOfMeasures();
    }

    /**
     * @param {Number} Zero-indexed measure number
     * @return {Number} Actual measure number (default: add 1 to argument)
     */
    Vex.Flow.Document.prototype.getMeasureNumber = function(m) {
      return (typeof this.backend.getMeasureNumber == "function")
             ? this.backend.getMeasureNumber(m) : m + 1;
    }

    /**
     * Retrieve the ith measure (zero-indexed).
     * @param {Number} The zero-indexed measure to access.
     * @return {Vex.Flow.Measure} Measure object for corresponding measure
     */
    Vex.Flow.Document.prototype.getMeasure = function(m) {
      if (m in this.measures) return this.measures[m];
      var measure = this.backend.getMeasure(m);
      if (typeof console != "undefined" && console.assert)
          console.assert(measure instanceof Vex.Flow.Measure,
                         "Backend must return valid Vex.Flow.Measure");
      this.measures[m] = measure;
      return measure;
    }

    Vex.Flow.Document.prototype.getNumberOfParts = function() {
      return this.getMeasure(0).getNumberOfParts(); }

    /**
     * Connector options from backend
     * Single connectors are automatically added at the start of the system
     * and for barlines within a single part.
     * @return {Array} array of objects with properties:
     *    type (bracket, brace, single, etc), parts (array of part numbers),
     *    system_start/system_end/measure_start (true/false)
     */
    Vex.Flow.Document.prototype.getStaveConnectors = function() {
      if (typeof this.staveConnectors != "object") {
        this.staveConnectors = this.backend.getStaveConnectors().slice(0);
        var haveSingleSystemStart = false; // add if necessary
        var numParts = this.getNumberOfParts();
        var lastPart = numParts - 1;
        this.staveConnectors.forEach(function(connector) {
          if (connector.type == "single" && connector.parts[0] == 0
              && connector.parts[connector.parts.length - 1] == lastPart
              && (connector.system_start || connector.measure_start))
            haveSingleSystemStart = true;
        });
        if (! haveSingleSystemStart)
          this.staveConnectors.push({
            type: "single", system_start: true, parts: [0, lastPart]});

        // Add barlines to each part if necessary
        var partsHaveBarlines = [];
        this.staveConnectors.forEach(function(connector) {
          if (connector.type == "single" && connector.parts.length == 1
              && connector.measure_start && connector.system_end)
            partsHaveBarlines[connector.parts[0]] = true;
        });
        for (var i = 0; i < numParts; i++)
          if (! partsHaveBarlines[i])
            this.staveConnectors.push({
              type: "single", parts: [i], measure_start: true, system_end: true
            });
      }
      return this.staveConnectors;
    }
    return Vex;
  });
