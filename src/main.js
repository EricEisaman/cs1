let CS1 = window.CS1 = {};
import utils from './core/utils/utils';
utils(CS1);
import loadSpinner from './core/load/load-spinner';
import './core/load/load-spinner.css';
import grabbable from './core/components/grabbable';
import navpointer from './core/components/nav-pointer';
import weatherviz from './core/components/weather-viz';
import shaderfrog from './core/components/shaderfrog/shader-frog';
shaderfrog(CS1);
import particles from './aps/particles';
particles(CS1);
import proximityGlitch from './demo/components/proximity-glitch'
proximityGlitch(CS1);
import hud from './hud/hud';
import './hud/hud.css';
hud(CS1);
import game from './core/components/game';
game(CS1);
import player from './core/components/player';
player(CS1);
import {bgmlite} from './core/services/bgm';
bgmlite(CS1);
import socket from './core/socket/client-socket';
socket(CS1);
import collectible from './core/components/collectible';
collectible(CS1);
import './main.css';
import login from './core/login/login';
import './core/login/login.css';
import aframeEffects from './ae/aframe-effects';
import cloud from './demo/components/cloud';
import ufo from './demo/components/ufo';
ufo(CS1);
import npc from './demo/components/npc';
npc(CS1);
import dotrow from './demo/components/dotrow';
import userdata from './core/components/userdata';
userdata(CS1);
import iotAPI from './demo/components/iot-api';
iotAPI(CS1);
import log from './core/components/log';
import launchable from './core/components/launchable';
import launchrow from './demo/components/launchrow';
import vrui from './core/components/vrui';
import chat from './core/components/chat';
import cs1Jukebox from './core/components/cs1-jukebox';
import mycomponents from './core/components/my-components';

//supress console.warn
window.console.warn = function(){};


  

  