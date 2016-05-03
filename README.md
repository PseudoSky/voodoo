# VooDoo

A system that generates sheet music from recorded audio in hopefully real time... hopefully

### Server

A directory for the audio recording system and note detection api.

#### Setup

From `server/aubio` run the following

pip install sndfile samplerate jack libavcodec libavformat libavutil libavsample txt2man doxygen

```
chmod +x waf
./waf configure
./waf build
sudo ./waf install
```

#### Run Aubio Demo

```
python python/demos/demo_pitch.py
```

### Client 

A directory for the web based visualization.




### Lilipond
Install

```
# or something
brew install lillypond
```

Run
`ly-server`


```
curl -H "Content-Type: application/json" -X POST -d '{"commands":[{"command":"transpose","args":"c d"},{"command":"highlight","variables":{"full-html":"false"}},{"command":"musicxml"},{"command":"mode"}],"options":{"language":"deutsch"},"data":"\\relative c { c4 ( d e ) }"}' localhost:4000
```

```
curl -H "Content-Type: application/json" -X POST -d '{"commands":[{"command":"musicxml"},{"command":"mode"}],"data":"\\relative c { c4 ( d e ) }"}' localhost:4000
```