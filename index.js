const midi = require('midi'),
	TakeNote = require('./takenote.js');
var midiInput = new midi.input();
midiInput.openPort(1);

var note = new TakeNote({midiInput});
setTimeout(()=>console.log(note.map),1000);
setTimeout(()=>console.log(note.chromaMap),1000);

process.on('SIGINT', function () {
  midiInput.closePort();
  process.nextTick(function () { process.exit(0); });
});