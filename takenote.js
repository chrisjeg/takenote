const EventEmitter = require('events');
const helper = require('./lib/midiHelpers');

class TakeNote extends EventEmitter{
	constructor({
		midiInput,
		lowNote = 0,
		highNote = 120,
		firstLedNote,
		lastLedNote,
		numLeds = 30,
		isInverted = false
	}){
		super();
		this.lowNote = lowNote;
		this.firstLedNote = firstLedNote;
		this.highNote = highNote;
		this.lastLedNote = lastLedNote;
		this.numLeds = numLeds;
		this.isInverted = isInverted;
		this.colours = 12;

		this.keyboardMap = Array(highNote-lowNote).fill(0).map(()=>({v:0,chords:[]}));
		this.activeChords = {};

		midiInput.on('message',(delta,message)=>{
			let event = helper.toEvent(message);
			if(event.id === 'key'){
				this.keyboardMap[event.key].v = event.velocity;
			}
		});

		//Sets the LEDs to die, even if a key off hasn't been registered
		setInterval(()=>{
			this.keyboardMap.forEach((key,index,map)=>{
				if(map[index].v > 0) map[index].v -= 1;
			});
		},15);

	}

	chordCalculator(){

	}

	colouriseKey(key,velocity){
		let r,g,b,v;
		v = velocity*2; //velocity is half of brightness
		let n = helper.normalise(key);
		r = helper.calculateBrightness(n,0)*v;
		g = helper.calculateBrightness(n,(2/3))*v;
		b = helper.calculateBrightness(n,(1/3))*v;
		return helper.toBinaryRGB(r,g,b);
	}

	get map(){
		return this.keyboardMap;
	}

	get chromaMap(){
		return this.keyboardMap.map((x,i)=>{
			return {
		    r: x.v * 2,
		    g: x.v * 2,
		    b: x.v * 2,
		    n: i,
		    v: x.v * 2
		  	};
	  });
	}

}

module.exports = TakeNote;
