<img src="https://cdn.glitch.com/a66c3f5c-9aba-45c0-952e-ccc59d8b0df3%2FCS1_logo_128.png?v=1564891473860">

# CS1 Game Engine
#### version 0.6.7
____

## Mission

🍎 Provide the JavaScript community with a fast track to high performance 3D VR multiplayer games installable on phones, tablets, laptops, and desktops as Progressive Web Applications (PWAs). The resultant games are compatible with many popular VR HMD and controller systems such as the Oculus Quest.

🍎 Provide students and teachers with an accompanying introductory level curriculum covering computer programming, computer networks, and application asset design.

____

## Tech Demo

🍎 Log into the <a href="https://cs1.glitch.me/" noopener noreferer>tech demo</a> with username: **computer** or **science** and password: **1234**.

🍎 Keyboard Interface:
  - Movement: **WASD** or **Arrow Keys**
  - Chat Mode: 
      - Toggle On/Off: **=**
      - Submit: **Enter**
      - New Line: **Down Arrow**
  - VRUI Toggle On/Off: **Backquote Key**
  

____

## First Steps

I suggest starting with the lessons accompanying the <a href="https://glitch.com/edit/#!/cs1-ide?path=README.md:1:0" rel="noopener noreferer">**CS1 IDE**</a>.

<a href="https://glitch.com/edit/#!/cs1-ide?path=README.md:1:0" rel="noopener noreferer">![CS1 IDE](https://cdn.glitch.com/07af4e76-a723-4969-8e18-7d7bc9f153d8%2Fcs1_ide_logo_256.png?v=1568757168497)</a>


____
## Quick Start 

🍎 Remix this project.

🍎 Add an **ADMIN_KEY** in **.env**, such as:
```C
ADMIN_KEY="myAdminPassword1234"
```
- Open the server log at Tools/Logs.
- Insert an empty space on a blank line of **.env** to force reboot.
- Observe the recorded **ADMIN_KEY** printed next to **admin** in the log.
- Use the recorded **ADMIN_KEY** when logging into the <a href="https://cs1-admin.glitch.me/" rel="noopener noreferer">CS1 Admin App</a>

🍎 Add **DATABASE_API_PROPERTIES** in **.env**, separated by spaces such as:
```C
DATABASE_API_PROPERTIES="LED credits"
```

🍎 Add **IOT_API_KEY** in **.env** if you are connecting an IoT device:
```C
IOT_API_KEY="wejvaYi359qM12"
```
🍎 For the admin account, login with admin and your ADMIN_KEY.

🍎 Add additional accounts through the client console.
```js
CS1.socket.emit('add-user',{key:[ADMIN_KEY],name:[new username],pw:[new user pw]})
```
🍎 After changing any src/ files, in the server Tools/Console run:
```sh
pnpm run build
refresh
```
____

## Overview

🍎 Based upon [A-Frame version 0.9](https://aframe.io/docs/0.9.0/introduction/).
  
🍎 Using [navigation mesh](https://www.donmccurdy.com/2017/08/20/creating-a-nav-mesh-for-a-webvr-scene/) based pathfinding.
  
🍎 Integrated with [D3.js](https://d3js.org/) for data visualization.
- Make examples. (TODO)
  
🍎 Enables easy use of shaders created with [Shader Frog](https://shaderfrog.com/).
- Include the desired shader json file in your build by importing in shader-frog.js
- Declaratively implement the shader-frog component in your HTML.

🍎 JS, CSS, and JSON bundling, minification, and uglifying with [Rollup](https://rollupjs.org/guide/en).

🍎 Installable as a Progressive Web App [(PWA)](https://developers.google.com/web/progressive-web-apps/).

🍎 **Heads Up Display (HUD) system** including:
- **RingDial** data visualization widget
- **Meter** data visualization widget
- **GUI Widgets** (TODO)

🍎 Collectibiles System
- Offline collection
- Online collection
- Collectibles can be set to respawn

🍎 Items can be declared **grabbable**, therefore movable by players.

🍎 **grabbable** items can be launched with the **launchable** component.

🍎 [A-Frame Effects](https://github.com/wizgrav/aframe-effects)
- bloom
- glitch
- godrays
- fxaa

🍎 [A-Frame Particle Player](https://github.com/supermedium/aframe-particleplayer-component)
- JSON particles bundling

🍎 BGM System (named exports)
- via SoundCloud
  - bgmlite: simple no UI, no server interaction
  - bgm: includes UI and interactive multiplayer interaction (TODO)

🍎 Player Component
- instantiated for all players
- avatars and animation clips can be changed dynamically

🍎 Node Graph Flow Based Editor
- Create with [Litegraph](https://github.com/jagenjo/litegraph.js). (<a href="https://glitch.com/edit/#!/cs1-flow?path=README.md:1:0" noopener noreferer>Early Development</a>)

🍎 Cloud Component
- vertex animation
- custom color

🍎 NPC Component

🍎 Dotrow Component
- Makes it easy to add rows of collectibles.
- Intended to be developer's first look in to editing component source code.

🍎 Database
- uses [Lowdb](https://github.com/typicode/lowdb) 

🍎 IoT Component
- Illustrates basic IoT device integration.

____

## CS1 Global Object Namespace

🍎 CS1.scene

🍎 CS1.myPlayer

🍎 CS1.otherPlayers

🍎 CS1.utils
 - uuid()
 - isEqual(a,b)
 - toColor(number)
 - randomFromArray(array)
 
🍎 CS1.cam

🍎 CS1.collectibles

🍎 CS1.grabbables

🍎 CS1.hud

🍎 CS1.say

🍎 CS1.sounds

🍎 CS1.shaderfrog 🐸
  - provides easy access to shaders to manipulate uniforms.

🍎 CS1.npc

🍎 CS1.game

🍎 CS1.db
  - set({key:'value'} , callbackFunction)
  - get('key' , callbackFunction)


____

## Issues

🍎 Please post any issues to <a href="https://github.com/EricEisaman/cs1/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc" noopener noreferer>GitHub</a>.

    
    
