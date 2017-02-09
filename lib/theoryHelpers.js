const pitchNames = ['C','C#','D','D#','E','F','F#','G','Ab','A','Bb','B'];

const toPitch = (key) => {
  let pitch = pitchNames[key % 12];
  return {
    name: pitch,
    spn: pitch + Math.floor((key/12)-1)
  }
};

module.exports = {
  toPitch
}
