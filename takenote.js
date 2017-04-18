const EventEmitter = require('events');
const helper = require('./lib/midiHelpers');
const theory = require('./lib/theoryHelpers');

class TakeNote extends EventEmitter{
	constructor({
		midiInput,
		lowNote = 0,
		highNote = 120,
		ledLowNote,
		ledHighNote,
		numLeds = 30,
		isInverted = false
	}){
		super();
		this.config = {
			lowNote,
			highNote,
			ledLowNote : ledLowNote || lowNote,
			ledHighNote : ledHighNote || highNote,
			numLeds,
			isInverted
		};

		this._keyboardMap = Array(highNote-lowNote).fill(0).map(()=>({velocity:0,chords:[]}));
		this._ledMap = Array(numLeds).fill(0).map(()=>({velocity:0,key:0}));
		this._sustain = true;
		this.activeChords = {};
		this.expectedNext = [];
		this.patternTests = {
			money:[60,72,67,60,55,58,60,63,60],
			singleNote:[100],
			threeNotes:[100,102,103],
			chordExample:[[96,100,103],[98,101,105]]
		};

		this.checkRules = this.checkRules.bind(this);
		let startTime = process.hrtime();
		midiInput.on('message',(delta,message)=>{
			let eventTime = process.hrtime(startTime);
			let { ledLowNote, ledHighNote, numLeds, isInverted } = this.config;
			// Convert the message to an event object
			let event = helper.toEvent(message);

			// In the event of a key
			if(event.id === 'key'){
				let normalisedTime = Math.round((eventTime[0]*1e9 + eventTime[1])*1e-6);

				// Generate an led index for the key
				let ledIndex = helper.key2Led(event.key, numLeds, ledLowNote, ledHighNote, isInverted);
				if(event.velocity > 0){
					this.checkRules(event.key,normalisedTime,this.patternTests);
				}
				// Update the keymap
				this._keyboardMap[event.key].v = event.velocity;

				// Emit the keypress event
				let emitEvent = (event.velocity > 0) ? 'keyPress' : 'keyRelease';
				this.emit(emitEvent,{
					key:event.key,
					velocity:event.velocity,
					time:normalisedTime
				});

				//If the event is a key press, or this keypress is affecting the same light it initiated
				if(event.velocity > 0 || event.key === this._ledMap[ledIndex].key) {
					this._ledMap[ledIndex] = {velocity:event.velocity,key:event.key};
				}
			} else if (event.id === 'sustain'){
				this._sustain = event.active;
				let emitEvent = (event.active) ? 'sustainOn' : 'sustainOff';
				this.emit(emitEvent,{active:event.active});
			}
		});

		//Sets the LEDs to die, even if a key off hasn't been registered (desperately targetting 60fps)
		setInterval(()=>{
			this._ledMap.forEach((led,index,map)=>{
				if(map[index].velocity > 0) map[index].velocity -= 1;
			});
		},16);

	}

	chordCalculator(){

	}

	colouriseKey(key,velocity){
		if(velocity > 0){
			let r,g,b,v;
			v = velocity*2; //velocity is half of brightness
			let n = helper.normalise(key);
			r = helper.calculateBrightness(n,0)*v;
			g = helper.calculateBrightness(n,(2/3))*v;
			b = helper.calculateBrightness(n,(1/3))*v;
			return helper.toBinaryRGB(r,g,b);
		} else {
			return 0;
		}
	}

	checkRules(key,time,patterns){
		//Reverse for loop, otherwise splice will ruin your life
		this.expectedNext = this.expectedNext
			.map(test=>{
				// Give up immediately if rule has timed out
				if(time > test.timeout){
					return null;
				//If the note is an array, then treat as a chord
				} else if (test.note instanceof Array){
					let remainingNotes = test.note.filter(note=>key!==note);
					if(test.note.length !== remainingNotes.length){
						return {
							name: test.name,
							note: (remainingNotes.length > 1) ? remainingNotes : remainingNotes[0],
							nextPosition: test.nextPosition,
							timeout: test.timeout
						};
					}
				// If it's not a chord, check the key is exactly the note required
				} else if (key === test.note) {
					let isLastNote = (test.nextPosition === patterns[test.name].length);

					if(isLastNote){
						this.emit('patternMatch',test.name);
						return null;
					} else {
						return {
							name: test.name,
							note: patterns[test.name][test.nextPosition],
							nextPosition: test.nextPosition + 1,
							timeout: time+1000
						};
					}
				}
				return null;
			})
			.filter(x=>x!==null);

		//Check the existing tests and add any new rules
		Object.keys(patterns).map(name=>{
			let pattern = patterns[name];
			//If the first note is a chord
			if(pattern[0] instanceof Array){
				let remainingNotes = pattern[0].filter(note=>key!==note);
				if (pattern[0].length !== remainingNotes.length){
					this.expectedNext.push({
						name,
						note:(remainingNotes.length > 1) ? remainingNotes : remainingNotes[0],
						nextPosition: (remainingNotes.length > 1) ? 1 : 2,
						timeout: time+300
					});
				}
			//If the first note is a note
			} else {
				if(key===pattern[0]){
					if(pattern.length === 1){
						this.emit('patternMatch',name);
					} else {
						this.expectedNext.push({
							name,
							note:pattern[1],
							nextPosition: 2,
							timeout: time+1000
						});
					}
				}
			}
		});
	}

	static toPitch(key){
		return theory.toPitch(key);
	}

	get map(){
		return this._keyboardMap;
	}

	get chromaMap(){
		return this._ledMap.map((x)=>this.colouriseKey(x.key,x.velocity));
	}

	get sustain(){
		return this._sustain;
	}

}

module.exports = TakeNote;
