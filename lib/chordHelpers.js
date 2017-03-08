const chordNames = {
	"3,6" : "dim",
	"3,7" : 'min',
	"4,7" : 'Maj',
	"4,8" : 'aug',
	"4,7,9" : 'Maj6',
	"3,7,9" : 'min6',
	"4,7,10" : 'dom7',
	"4,7,11" : 'Maj7',
	"3,7,10" : 'min7',
	"4,8,10" : 'aug7',
	"3,6,9" : 'dim7',
	"3,7,11" : 'min/Maj7'
};

const calculateActiveChords = function(keyboardMap,key,velocity){
	keyboardMap[key] = velocity;
	//let mapChord = (velocity,chordStart,relativeKey,chord) => (velocity && chord.push())
	for(let k = 0; k < keyboardMap.length; k++){
		let chord = [];
		if(keyboardMap[k] > 0){
			chord.push(k);
			let chordOptions = keyboardMap.slice(k+1,k+12);
			chordOptions.map((v,n) => (v && chord.push(n+1)));
			if(chord.length >= 3 && chordNames.hasOwnProperty(chord.slice(1))){
				let msg = noteName[chord[0] % 12] + ' ' +  chordNames[chord.slice(1)];
				console.log(msg);
				k += 11;
			}
		} else {
			continue;
		}
	}
};

module.exports = {
	calculateActiveChords
};
