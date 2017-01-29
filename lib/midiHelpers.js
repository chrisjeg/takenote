var eventType = function(message){
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

module.exports = {
	toEvent: eventType
};