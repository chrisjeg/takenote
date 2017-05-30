const TakeNote = require('../takenote');

describe('Take Note Static Functions',()=>{
    it('should convert a midi note to a pitch object',()=>{
        let note = 69; //Concert A!
        let pitch = TakeNote.toPitch(note);
        expect(pitch).toHaveProperty('spn','A4');
        expect(pitch).toHaveProperty('name','A');
    })
})