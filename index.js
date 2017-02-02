const midi = require('midi'),
	TakeNote = require('./takenote.js');
var midiInput = new midi.input();
midiInput.openPort(1);

var note = new TakeNote({midiInput});

process.on('SIGINT', function () {
  midiInput.closePort();
  process.nextTick(function () { process.exit(0); });
});
