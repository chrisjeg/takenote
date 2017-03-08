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

		midiInput.on('message',(delta,message)=>{
			let { ledLowNote, ledHighNote, numLeds } = this.config;
			// Convert the message to an event object
			let event = helper.toEvent(message);
			// In the event of a key
			if(event.id === 'key'){
				// Generate an led index for the key
				let ledIndex = helper.key2Led(event.key, numLeds, ledLowNote, ledHighNote);
				this._keyboardMap[event.key].v = event.velocity;
				let emitEvent = (event.velocity > 0) ? 'keyPress' : 'keyRelease';
				this.emit(emitEvent,{key:event.key,velocity:event.velocity});
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
