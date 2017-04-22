class NoteGroup {
	constructor({pitches,length,bar,beatsPerBar,beatNumber}){
		this.pitches = pitches;
		this.length = length;
		this.bar = bar;
		this.beatsPerBar = beatsPerBar;
		this.beatNumber = beatNumber;
	}

	get barPosition() {
		return (this.bar - 1) + ((this.beatNumber - 1)/this.beatsPerBar);
	}
}

module.exports = NoteGroup;
