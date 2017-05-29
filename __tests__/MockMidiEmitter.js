const EventEmitter = require('events');
const fourChords = [[72,76,79],[71,74,79],[69,76,81],[69,77,81]];

//Variables used for the self mocking emitter
const sequence = fourChords.map((v) => v.concat(v,v,v)).reduce((a,b)=>a.concat(b));

class MockMidiEmitter extends EventEmitter{

	constructor(isSelfMocking = false){
		super();
		this.isSelfMocking = !!isSelfMocking;
		this._isPortOpen = false;
		this.pos = 0
		this.interval = null;
	}

	openPort(){
		this._isPortOpen = true;
		clearInterval(this.interval);
		//Sets up the self mocking sequence if the flag is set to true
		if(this.isSelfMocking){
			this.interval = setInterval(()=>{
				this.emit('message',500,[144,sequence[this.pos],0]);
				this.pos = (this.pos + 1) % sequence.length;
				this.emit('message',500,[144,sequence[this.pos],Math.floor(Math.random()*27+100)]);
			},50);
		}
	}

	mockNote(note,delta = 500,velocity = false){
		if(this._isPortOpen){
			let mockVelocity = velocity || 127;
			this.emit('message',delta,[144,note,mockVelocity])
		}
	}

	mockEvent(event,delta){
		this.emit('message',delta,event);
	}

	closePort(){
		this._isPortOpen = false;
		clearInterval(this.interval);
	}

	get isPortOpen(){
		return this._isPortOpen;
	}

}

module.exports = MockMidiEmitter;
