let CS1 = window.CS1 = {};
import utils from './utils';
utils(CS1);
import loadSpinner from './load-spinner';
import './load-spinner.css';
import grabbable from './grabbable';
import navpointer from './nav-pointer';
import player from './player';
import d3graph from './d3-graph';
import shaderfrog from './shader-frog';
import particles from './particles';
particles(CS1);
import proximityGlitch from './proximity-glitch'
import hud from './hud';
import './hud.css';
hud(CS1);
import game from './game';
game(CS1);
import socket from './client-socket';
socket(CS1);
import collectible from './collectible';
collectible(CS1);
import './main.css';
import login from './login';
import './login.css';
import aframeEffects from './aframe-effects';

  

  