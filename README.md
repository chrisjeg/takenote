# TakeNote.js:musical_note:

## What is TakeNote?
TakeNote:musical_note: is a layer that sits on top of a MIDI connection in order to provide an
abstraction that is musically comprehensible and allows for interfacing with
other devices.

TakeNote consumes a MIDI input, modelled around
[justinlatimer's midi package](https://www.npmjs.com/package/midi) on
npm, and provides requestable abstractions and emits musically significant events.

It's quick too! I'm running all this code off a Raspberry Pi 1 Model B.

Basically, if you want to play "Hungry like the Wolf" on your piano to get your
fridge to order more bacon, then this is a good place to start :thumbsup:

It's also worth noting:musical_note: that **this project is under active development.
 I plan on breaking things for the greater good**, just so you know...

![The greater good](https://media.giphy.com/media/I6Ze1u9AwbWb6/giphy.gif)

## Installation

Currently available on npm:

```bash
npm install takenote
```


## Quick Setup with midi

Like I mentioned earlier, technically you can use any input with a similar output
structure to the midi package, if you really wanted you could use FFT to use real
audio as an input... but for now the easiest way to interface with a device is MIDI.

```javascript
// Require TakeNote
const TakeNote = require('./takenote.js');
// Require midi and open a port
const midi = require('midi');
const midiInput = new midi.input();
midiInput.openPort(1);
// Start TakeNote with that midi input
const note = new TakeNote({midiInput:midiInput});
```

## Features

### LED Remapping

TakeNote will remap your MIDI input into an array of binary colours to map to an
LED array. This is entirely pointless, but it looks cool. There are some cool
features available here:
- Chromesthesia - Colours are based on the circle of 5ths, this means that
**different key signatures have unique chromatic palettes**. I'm particularly proud of this one.
- LED brightness is based on velocity, light decay is based on note sustain
- LED sustain brightness if the sustain pedal is used
- LED's do not need to be a one to one relationship to the keys, TakeNote can remap
	your keyboard to a smaller LED array and even deal with if your strip is physically
	shorter than your keyboard!

```javascript
const note_config = {
	midiInput,
	//The lowest and highest midi notes on your midi instrument
	lowNote: 0,
	highNote: 120,
	// Useful if your strip is shorter than your instrument
	ledLowNote: 29,
	ledHighNote: 103,
	//The number of LEDs on your strip
	numLeds: 30,
	// If your strip is mounted backwards
	isInverted: true
};

const ledStrip = require('rpi-ws281x-native');
const note = new TakeNote(note_config);

ledStrip.init(note_config.numLeds);

/// We do this every 16ms to get close to 60FPS, not had any issues on the Pi
var renderSequence = setInterval(()=>{
  ledStrip.render(piano.chromaMap);
},16);
```

### Static Functions

TakeNote.toPitch
Returns an object with a "name" property representing the key's name (D#)
and an "spn" property representing the key's [Scientific Pitch Notation](https://en.wikipedia.org/wiki/Scientific_pitch_notation)

```javascript
note.on('keyRelease',(e)=>console.log(`Key ${TakeNote.toPitch(e.key).spn} was released`));
```

### Events

TakeNote is an event emitter, with some default events and an interface to feed
"rules".

#### Default events

Below are a set of example events:

```javascript
note.on('keyPress',(e)=>console.log(`Key ${e.key} was pressed with velocity ${e.velocity}`));
note.on('keyRelease',(e)=>console.log(`Key ${TakeNote.toPitch(e.key).spn} was released`));
note.on('sustainOn',()=>console.log(`Sustain pedal was pressed`));
note.on('sustainOff',()=>console.log(`Sustain pedal was released`));
```

### The pattern matcher

TakeNote listens for patterns of notes, this can be an order of notes or chords.
If TakeNote recognises one of these rules it will emit an event, so you can kick
off a callback based on your favourite tunes. Can do some really cool IoT things
with this.

```javascript
note.addRule('PinkFloydMoney',[60,72,67,60,55,58,60,63,60]);
note.addRule('singleNote',[100]);
note.addRule('threeNotes',[100,102,103]);
note.addRule('chordExample',[[96,100,103],[98,101,105]]);
note.on('patternMatch',x=>console.log('\x1b[36m',`Rule ${x} was matched`,'\x1b[0m'));
```

## Planned Features

- The pattern matcher will understand relative rhythm one day, it will be a good day
- Need to add Babel to the build, currently running loose with ES6 syntax meaning
	you'll need Node 6.something or higher
- I need to add tests, I know, I'm a bad person.
