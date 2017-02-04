const EventEmitter = require('events');
const helper = require('./lib/midiHelpers');

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
		this.lowNote = lowNote;
		this.ledLowNote = ledLowNote || lowNote;
		this.highNote = highNote;
		this.ledHighNote = ledHighNote || highNote;
		this.numLeds = numLeds;
		this.isInverted = isInverted;
		this.colours = 12;

		this._keyboardMap = Array(highNote-lowNote).fill(0).map(()=>({v:0,chords:[]}));
		this._ledMap = Array(numLeds).fill(0).map(()=>({velocity:0,key:0}));
		this.activeChords = {};

		midiInput.on('message',(delta,message)=>{
			let event = helper.toEvent(message);
			if(event.id === 'key'){
				this._keyboardMap[event.key].v = event.velocity;
				this._ledMap[helper.key2Led(
					event.key,
					this.numLeds,
					this.ledLowNote,
					this.ledHighNote)] = {velocity:event.velocity,key:event.key};
				this.emit('keyPress',{key:event.key,velocity:event.velocity});
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
		let r,g,b,v;
		v = velocity*2; //velocity is half of brightness
		let n = helper.normalise(key);
		r = helper.calculateBrightness(n,0)*v;
		g = helper.calculateBrightness(n,(2/3))*v;
		b = helper.calculateBrightness(n,(1/3))*v;
		return helper.toBinaryRGB(r,g,b);
	}

	get map(){
		return this._keyboardMap;
	}

	get chromaMap(){
		return this._ledMap.map((x)=>this.colouriseKey(x.key,x.velocity));
	}

}

module.exports = TakeNote;
