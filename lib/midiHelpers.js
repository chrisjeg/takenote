/*This function will take a midi message and convert it to an easily
manipulatable JSON object */
var toEvent = function(message){
	let event = {};
	let status = message[0];
	let data1 = message[1];
	let data2 = message[2];
	switch(status){
	case 144:
		event = {
			id: 'key',
			key: data1,
			velocity: data2
		};
		break;
	case 176:
		if(data1 === 64){
			event = {
				id: 'sustain',
				active: (data2) ? true : false
			};
			break;
		}
		default:
		event = {
			id:'unknown',
			status,
			data1,
			data2
		};
	}
	return event;
};

//Normalises a key to a float between 0-1 based on the circle of fifths
var normalise = (k) => ((((k%2)===1) ? k+6 : k)%12)/12;

//Provides the brightness for a single led based on a shift provided.
var calculateBrightness = (key,shift) => {
	let n = ((key + shift) % 1) * 6;
	if (n<=1 || n>5){
		return 1;
	} else if (n<=2){
		return -(n-2);
	} else if (n<=4){
		return 0;
	} else {
		return n-4;
	}
};

//Converts an RGB value into a binary val to send to an LED
var toBinaryRGB = (r,g,b) => ((r&255)<<16)+((g&255)<<8)+(b&255);

var key2Led = function(key,num_leds,led_low_note,led_high_note,isInverted){
	if(key >= led_low_note && key <= led_high_note){
		let led = Math.round((key - led_low_note)/((led_high_note-led_low_note)/(num_leds-1)));
		if (isInverted) led = led*-1 + (num_leds-1);
		return led;
	} else if (key < led_low_note) {
		return isInverted ? num_leds - 1 : 0;
	} else {
		return isInverted ? 0 : num_leds - 1;
	}
};

var invertLeds = function(ledMessage,num_leds){
	ledMessage.led = ((ledMessage.led * -1) + (num_leds-1));
	return ledMessage;
};


module.exports = {
	toEvent,
	key2Led,
	normalise,
	calculateBrightness,
	toBinaryRGB
};
