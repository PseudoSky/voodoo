#! /usr/bin/env python
import math
import pyaudio
import sys, time
import numpy as np
import wave
from aubio import tempo,source, pitch, freqtomidi, midi2note,miditofreq
import requests
import ly.musicxml
from ly.musicxml import create_musicxml, xml_objs
from numpy import array, ma,diff,median
import threading
# from threading import Thread
from src.util_voodoo import Map
import flask
from flask import Flask, url_for,request
app = flask.Flask(__name__)

from fractions import Fraction
xxx = create_musicxml.CreateMusicXML()
xxx.create_title('Voodoo')
xxx.create_part()
xxx.create_measure(divs=1)
# xxx.create_tempo('',['.',90],'8',3)
xax=xxx.musicxml()
nl=[]
prev=[time.time()]
pitche=[]
note_json=[]
if len(sys.argv) < 2:
    filename = 'music.xml'
else:
    filename = sys.argv[1]
_times=[1./64,1./32,1./16,1./8,1./4,1./2,1.,2.,3.,4]
_time_note=["1/64","1/32","1/16","1/8","1/4","1/2","1","2","3","4"]
def noter(note):
    # note=note.replace('#','/')
    note=note[:-1].lower()+note[-1]
    if(len(nl)>0 and note==nl[-1]): return 1
    if(len(prev)%4==0):xxx.create_measure(divs=1)
    time_now=time.time()
    print(nl)
    if(len(nl)>0):
        dur = _time_note[min(enumerate(_times), key=lambda x: abs(x[1]-(time_now-prev[-1])))[0]]
        xxx.new_note(nl[-1][0],nl[-1][1:], 'whole', time_now-prev[-1],voice=1)
        note_json.append({
            "note":nl[-1][0],
            "octave":nl[-1][1:], 
            "duration":time_now-prev[-1]
            })
        # print Fraction(time_now-prev[-1]).limit_denominator(8)

        # print(note_json)
        nl.append(note)
        prev.append(time_now)
    else:
        nl.append(note)
        prev.append(time_now)
    # xax=xxx.musicxml()
    # xax.write(filename)

def post( data,method=''):

    if(method=='post'):
        print "DATA",data
        r = requests.post("http://127.0.0.1:5432", data=data)
        print r.status_code,r.reason,r.text
        return r.text
    elif len(method)==0:
        e = ly.musicxml.writer()
        e.parse_text(data)
        xml = e.musicxml()
        # print dir(xml.tree.parse()),dir(e)

        pat = ly.musicxml.create_musicxml.MusicXML(xml.tree)
        # pat.new_chord('C', 4, 'whole', 4)
        print pat,e
        return xml.tostring()
    else:
        e = ly.musicxml.writer()
        e.parse_text(data)
        xml = e.musicxml()
        xml.write(filename)
print midi2note



downsample = 1
samplerate = 44100 / downsample
if len( sys.argv ) > 2: samplerate = int(sys.argv[2])

win_s = 4096 #/ downsample # fft size
hop_s = 512  #/ downsample # hop size


T = Map()
T.beats = []
T.win_s = 512                 # fft size
T.hop_s = T.win_s / 2 
T.delay = 4. * T.hop_s
T.tempo = tempo("default", T.win_s, T.hop_s, samplerate)
T.median_win_s = 10

# s = source(filename, samplerate, hop_s)
samplerate = 44100#s.samplerate

tolerance = 0.8


pitch_o = pitch( "yinfft", win_s, hop_s, samplerate)
pitch_o.set_unit("midi")
pitch_o.set_tolerance(tolerance)

pitches = []
confidences = []
pp=[]
# total number of frames read
total_frames = 0

# For posting to ly-server
# st='{"commands":[{"command":"musicxml"},{"command":"mode"}],"data":"relative c {'


def sample(samples):
    


    pitch = pitch_o(samples)[0]
    is_beat= T.tempo(samples)
    # print(pitch)
    if is_beat:
        # print "\nBPMS",is_beat,"\n"
        tb=T.tempo.get_last_s()
        T.beats.append(tb)
        if(len(T.beats)>T.median_win_s):
            bpms = 60./ diff(T.beats)
            T.bpms = median(bpms[-T.median_win_s:])
            print "\nBPMS",bpms,"\n"
        
    pitch = int(round(pitch))
    confidence = pitch_o.get_confidence()
    print confidence
    if confidence < 0.8: pitch = 0.
    if confidence > 0.8:
        n=midi2note(min(pitch,127))
        print confidence,pitch,miditofreq(min(pitch,127)),midi2note(min(pitch,127))
        # st+=' '+midi2note(int(pitch))
        if(n[-1]!='1'):noter(n)

    #print "%f %f %f" % (total_frames / float(samplerate), pitch, confidence)
    
    # pp += [pitch]
    # confidences += [confidence]
    # total_frames += read
    # if read < hop_s: break
    # st+=' }"}'


#print pitches

# from demo_waveform_plot import get_waveform_plot, set_xlabels_sample2time

skip = 1

pitches = array(pitches[skip:])
confidences = array(confidences[skip:])
times = [t * hop_s for t in range(len(pitches))]






#from scipy import signal
RRATE = 16000
WAVE = 15000
sigme = ''.join([chr(int(math.sin(x/((RRATE/WAVE)/math.pi))*127+128)) for x in xrange(RRATE)])



n = 6  # this is how the pitch should change, positive integers increase the frequency, negative integers decrease it.
chunk =2048*2
FORMAT = pyaudio.paInt16
CHANNELS = 2
# RATE = 41500
RATE=44100
RECORD_SECONDS = 30
swidth = 2
DEVICES=[0,2]

p = pyaudio.PyAudio()

stream = p.open(format = FORMAT,
                channels = 1,
                rate = RATE,
                input = True,
                output = True,
                frames_per_buffer = chunk#,
                # output_device_index=2,
                )

# out = p.open(format = FORMAT,
#                 channels = CHANNELS,
#                 rate = RATE,
#                 output = True,
#                 frames_per_buffer = chunk,
#                 output_device_index=1
#                 )

count = p.get_device_count()

devices = []

for i in range(count):
    devices.append(p.get_device_info_by_index(i))

for i, dev in enumerate(devices):
    print "%d - %s" % (i, dev['name'])
print devices
print "Starting\n\n"
start = time.time()

def shutdown_server():
    func = request.environ.get('werkzeug.server.shutdown')
    if func is None:
        raise RuntimeError('Not running with the Werkzeug Server')
    func()

global recording
recording=False

def get_rec():
    global recording
    return str(recording)

def set_rec(r):
    global recording
    if(r):
        if(r=='true'):
            recording=True
        else: 
            recording=False
    else:
        recording=not(recording)
    return str(recording)

def record():
    global recording
    rec=get_rec()
    while True: #(time.time()-start < RECORD_SECONDS):
      # print recording
      # print "Chunk"
      if( recording ):
          try:
            data = stream.read(chunk)
            data = np.array(wave.struct.unpack("%dh"%(len(data)/swidth), data),dtype="f")
            sample(data/127)

          except IOError as ex:
            if ex[1] != pyaudio.paInputOverflowed:
                raise
            # print "err"
            # data = '\x00' * chunk
            # xax=xxx.musicxml()
            # print(xax.tostring())
            # print nl
            # self.inStream.stop_stream()
            # self.inStream.close()
            # p.terminate()
            # print("* Killed Process")
            # quit()
          # except IOError as ex:
          #   print ex
          #   if ex[1] != pyaudio.paInputOverflowed:
          #       print "overflow"
                  #raise
          except KeyboardInterrupt:
            # st+=' }'
            # st=st.replace('#','').lower()
            # print st
            # post(st)
            xax=xxx.musicxml()
            print(xax.tostring())
            print nl
            self.inStream.stop_stream()
            self.inStream.close()
            p.terminate()
            print("* Killed Process")
            quit()
      else:
        time.sleep(.3)







from datetime import timedelta
from flask import make_response, request, current_app
from functools import update_wrapper
from flask import jsonify

def crossdomain(origin=None, methods=None, headers=None,max_age=21600, attach_to_all=True,automatic_options=True):
    if methods is not None:
        methods = ', '.join(sorted(x.upper() for x in methods))
    if headers is not None and not isinstance(headers, basestring):
        headers = ', '.join(x.upper() for x in headers)
    if not isinstance(origin, basestring):
        origin = ', '.join(origin)
    if isinstance(max_age, timedelta):
        max_age = max_age.total_seconds()

    def get_methods():
        if methods is not None:
            return methods

        options_resp = current_app.make_default_options_response()
        return options_resp.headers['allow']

    def decorator(f):
        def wrapped_function(*args, **kwargs):
            if automatic_options and request.method == 'OPTIONS':
                resp = current_app.make_default_options_response()
            else:
                resp = make_response(f(*args, **kwargs))
            if not attach_to_all and request.method != 'OPTIONS':
                return resp

            h = resp.headers

            h['Access-Control-Allow-Origin'] = origin
            h['Access-Control-Allow-Methods'] = get_methods()
            h['Access-Control-Max-Age'] = str(max_age)
            if headers is not None:
                h['Access-Control-Allow-Headers'] = headers
            return resp

        f.provide_automatic_options = False
        return update_wrapper(wrapped_function, f)
    return decorator


@app.route('/info')
@crossdomain(origin='*')
def info():
    global nl,recording
    return jsonify(r=recording,notes=nl)

@app.route('/info/<int:since>')
@crossdomain(origin='*')
def info_since(since):
    global nl,recording
    return jsonify(r=recording,notes=nl[since:])


@app.route('/poll')
@crossdomain(origin='*')
def poll():
    global nl,recording
    return jsonify(l=len(nl),
                   r=recording)

@app.route('/toggle/<rec>')
@crossdomain(origin='*')
def toggle(rec):
    global recording
    return set_rec(rec)

@app.route('/reset')
@crossdomain(origin='*')
def reset():
    global xxx,xax,nl,prev,pitche
    xxx = create_musicxml.CreateMusicXML()
    xxx.create_title('Voodoo')
    xxx.create_part()
    xxx.create_measure(divs=1)
    # xxx.create_tempo('',['.',90],'8',3)
    xax=xxx.musicxml()
    nl=[]
    prev=[time.time()]
    pitche=[]
    return "ok"

@app.route('/music.xml')
@crossdomain(origin='*')
def api_music():
    resp = flask.Response(xxx.musicxml().tostring())
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp




if __name__ == '__main__':

    run_event = threading.Event()
    run_event.set()
    t1 = threading.Thread(target=record)
    # t2 = threading.Thread(target=)
    t1.start()
    # t2.start()
    app.quiet = True
    app.run(host='0.0.0.0')
    try:
        while 1:
            time.sleep(.1)
    except KeyboardInterrupt:
        print "attempting to close threads. Max wait =",max(3,4)
        # run_event.clear()
        t1.join()
        # app.stop()
        shutdown_server()
        # t2.join(timeout=3)
        print "threads successfully closed"
        # return 1
        raise "end"
