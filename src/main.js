let CS1 = window.CS1 = {};
import utils from './utils';
utils(CS1);
import loadSpinner from './load-spinner';
import './load-spinner.css';
import grabbable from './grabbable';
import navpointer from './nav-pointer';
import d3graph from './d3-graph';
import shaderfrog from './shader-frog';
shaderfrog(CS1);
import particles from './particles';
particles(CS1);
import proximityGlitch from './proximity-glitch'
proximityGlitch(CS1);
import hud from './hud';
import './hud.css';
hud(CS1);
import game from './game';
game(CS1);
import {bgmlite} from './bgm';
bgmlite(CS1);
import socket from './client-socket';
socket(CS1);
import collectible from './collectible';
collectible(CS1);
import player from './player';
player(CS1);
import signIn from './sign-in';
signIn(CS1);
import './main.css';
import login from './login';
import './login.css';
import aframeEffects from './aframe-effects';
import cloud from './cloud';
import ufo from './ufo';
ufo(CS1);
import npc from './npc';
npc(CS1);
import dotrow from './dotrow';


  

  