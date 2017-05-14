const checkRules = function(key, time, patterns){
  //Map the next expected keys with a new immutable object
	this.expectedNext = this.expectedNext.map(test => {
    // Give up immediately if rule has timed out
		if (time > test.timeout) {
			return null;
    //If the note is an array, then treat as a chord
		} else if (test.note instanceof Array) {
			let remainingNotes = test.note.filter(note => key !== note);
			if (test.note.length !== remainingNotes.length) {
				return {
					name: test.name,
					note: (remainingNotes.length > 1)
						? remainingNotes
						: remainingNotes[0],
					nextPosition: test.nextPosition,
					timeout: test.timeout
				};
			}
    // If it's not a chord, check the key is exactly the note required
		} else if (key === test.note) {
			let isLastNote = (test.nextPosition === patterns[test.name].length);
			if (isLastNote) {
				this.emit('patternMatch', test.name);
				return null;
			} else {
				return {
					name: test.name,
					note: patterns[test.name][test.nextPosition].notes,
					nextPosition: test.nextPosition + 1,
					timeout: time + 1000
				};
			}
		}
		return null;
	}).filter(x => x !== null);

  //Check the existing tests and add any new rules
	Object.keys(patterns).map(name => {
		let pattern = patterns[name];
		//If the first note is a chord
		if (pattern[0].notes instanceof Array) {
			let remainingNotes = pattern[0].notes.filter(note => key !== note);
			if (pattern[0].notes.length !== remainingNotes.length) {
				this.expectedNext.push({
					name,
					note: (remainingNotes.length > 1)
						? remainingNotes
						: remainingNotes[0],
					nextPosition: (remainingNotes.length > 1)	? 1 : 2,
					timeout: time + 300
				});
			}
      //If the first note is a note
		} else {
			if (key === pattern[0].notes) {
				if (pattern.length === 1) {
					this.emit('patternMatch', name);
				} else {
					this.expectedNext.push({
						name,
						note: pattern[1].notes,
						nextPosition: 2,
						timeout: time + 1000
					});
				}
			}
		}
	});
};

module.exports = {
	checkRules
};
