/* Well we've got to test that the tests run, right? */ 
const MockMidiEmitter = require('./MockMidiEmitter.js');

describe('Mock Midi Emitter',()=>{

    test('should load without error', () => {
        let mock = new MockMidiEmitter();
        let mock2 = new MockMidiEmitter(true);
        let mock3 = new MockMidiEmitter(false);
    });

    test('should have a closed port on instatiation',()=>{
        let mock = new MockMidiEmitter();
        expect(mock.isPortOpen).toBe(false);
    });

    test('should have an open port state when the port is opened',()=>{
        let mock = new MockMidiEmitter();
        mock.openPort();
        expect(mock.isPortOpen).toBe(true);
    })

    test('should close an open port when requested',()=>{
        let mock = new MockMidiEmitter();
        mock.openPort();
        mock.closePort();
        expect(mock.isPortOpen).toBe(false);
    })

    test('should allow a note to be mocked',done=>{
        let mock = new MockMidiEmitter();
        let expectedEvent = [144,100,127];
        mock.on('message',(delta,event)=>{
            expect(event).toEqual(expectedEvent);
            expect(delta).toEqual(500);
            done();
        });
        mock.openPort();
        mock.mockNote(100);
    });

    test('should allow a note to be mocked with custom delta',done=>{
        let mock = new MockMidiEmitter();
        mock.on('message',(delta,event)=>{
            expect(delta).toEqual(100);
            done();
        });
        mock.openPort();
        mock.mockNote(100,100);
    });
})
