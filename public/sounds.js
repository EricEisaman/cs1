window.sounds = {};

Object.keys(window.config.sounds).forEach(soundName=>{
  window.sounds[soundName] = new Audio(window.config.sounds[soundName].url);
  window.sounds[soundName].loop = window.config.sounds[soundName].loop || false;
  window.sounds[soundName].volume = window.config.sounds[soundName].volume || 1;
});