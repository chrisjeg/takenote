const EventEmitter = require('events');
const helper = require('./lib/midiHelpers');

class TakeNote extends EventEmitter{
	constructor({midiInput, lowNote = 0, highNote = 120}){
		super();
		this.lowNote = lowNote;
		this.firstLedNote = firstLedNote;
		this.highNote = highNote;
		this.lastLedNote = lastLedNote;
		this.numLeds = numLeds;
		this.isInverted = isInverted;

		this.keyboardMap = Array(highNote-lowNote).fill(0).map(()=>({v:0,chords:[]}));
		console.log(this.keyboardMap[91]);
		this.activeChords = {};

		var input = midiInput;
		input.on('message',(delta,message)=>{
			let event = helper.toEvent(message);
			if(event.id === 'key'){
				this.keyboardMap[event.key].v = event.velocity;
			}
			console.log(event);
		});

		setInterval(()=>{
			this.keyboardMap.forEach((key,index,map)=>{	
				if(map[index].v > 0) map[index].v -= 1;
			});
		},15);
	}

	chordCalculator(){

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