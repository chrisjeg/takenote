//The lowest and highest midi notes on your midi instrument
const LOW_NOTE = 0, HIGH_NOTE = 120;
// Useful if your strip is shorter than your instrument
const LED_LOW_NOTE = 29, LED_HIGH_NOTE = 103;
//The number of LEDs on your strip
const NUM_LEDS = 30;
// If your strip is backwards...not by accident I swear
const STRIP_INVERTED = true;

const TakeNote = require('./takenote.js');
// const	midimock = require('./test/testMidiEmitter.js');
const midi = require('midi');

// You must provide TakeNote with a MIDI emitter, for real time midi then the
// "midi" package by justinlatimer is perfect. (npm install midi)
const midiInput = new midi.input();
// const midiInput = new midimock();
midiInput.openPort(1);

const note_config = {
	midiInput,
	lowNote: LOW_NOTE,
	highNote: HIGH_NOTE,
	ledLowNote: LED_LOW_NOTE,
	ledHighNote: LED_HIGH_NOTE,
	numLeds: NUM_LEDS,
	isInverted: STRIP_INVERTED
};

const note = new TakeNote(note_config);
note.addRule('money',[60,72,67,60,55,58,60,63,60]);
note.addRule('singleNote',[100]);
note.addRule('threeNotes',[100,102,103]);
note.addRule('chordExample',[[96,100,103],[98,101,105]]);
// note.on('keyPress',(e)=>console.log(`Key ${e.key} was pressed with velocity ${e.velocity}`));
// note.on('keyRelease',(e)=>console.log(`Key ${TakeNote.toPitch(e.key).spn} was released`));
note.on('sustainOn',(e)=>console.log(`Sustain pedal was pressed`));
note.on('sustainOff',(e)=>console.log(`Sustain pedal was released`));
note.on('patternMatch',x=>console.log('\x1b[36m',`Rule ${x} was matched`,'\x1b[0m'));

process.on('SIGINT', function () {
	// midiInput.closePort();
	process.nextTick(function () { process.exit(0); });
});
