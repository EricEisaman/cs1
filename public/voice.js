window.voices = window.speechSynthesis.getVoices();

window.say = function(msg,name="none given") {
  var msg = new SpeechSynthesisUtterance(msg);
  if(name == "none given")
    msg.voice = speechSynthesis.getVoices().filter(function(voice) { return voice.name == window.config.voice.name; })[0];
  else
    msg.voice = speechSynthesis.getVoices().filter(function(voice) { return voice.name == name; })[0];
  msg.pitch = window.config.voice.pitch;
  msg.rate = window.config.voice.rate;
  msg.volume = window.config.voice.volume;
  speechSynthesis.speak(msg);
}



window.printVoices = ()=>{
  speechSynthesis.getVoices().forEach(v=>{
    console.log(v.name,v.lang);
  });
}