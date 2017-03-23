const EventEmitter = require('events');
const fourChords = [[72,76,79],[71,74,79],[69,76,81],[69,77,81]];


let sequence = fourChords.map((v) => v.concat(v,v,v)).reduce((a,b)=>a.concat(b));
let pos = 0;

class TestEmitter extends EventEmitter{
  constructor(){
    super();
    this.interval = null;
  }

  openPort(){
    clearInterval(this.interval);
    this.interval = setInterval(()=>{
      this.emit('message',500,[144,sequence[pos],0])
      pos = (pos + 1) % sequence.length;
      this.emit('message',500,[144,sequence[pos],Math.floor(Math.random()*27+100)])
    },50)
  }

  closePort(){
    clearInterval(this.interval);
  }
}

const emitter = new TestEmitter();



module.exports = TestEmitter;
