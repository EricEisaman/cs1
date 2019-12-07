<img src="https://cdn.glitch.com/a66c3f5c-9aba-45c0-952e-ccc59d8b0df3%2FCS1_logo_128.png?v=1564891473860">

# CS1 Game Engine
#### version 0.7.08
____

## Mission

🍎 Provide the JavaScript community with a fast track to high performance 3D VR multiplayer games installable on phones, tablets, laptops, and desktops as Progressive Web Applications (PWAs). The resultant games are compatible with many popular VR HMD and controller systems such as the Oculus Quest.

🍎 Provide students and teachers with an accompanying introductory level curriculum covering computer programming, computer networks, and application asset design.

____



## Getting Started Video

<a href="https://youtu.be/lKYQ1o2Uc_0" rel="noopener noreferer">![Video Overview](https://cdn.glitch.com/162b879e-fd42-40d9-8519-671d783b8c70%2FGetting_Started_Video.png?v=1575052424055)</a>



____

## Introductory Presentation

<iframe src="https://docs.google.com/presentation/d/e/2PACX-1vQUJYDleE4LBILr-2V57v_kPAD5TY-X6hnA94fJWl8drADMHHDtMB9BnDUtw7v1N6JmVS1NK_dTYc71/embed?start=false&loop=false&delayms=60000" frameborder="0" width="480" height="285" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>
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


## Overview

🍎 Based upon [A-Frame version 0.9](https://aframe.io/docs/0.9.0/introduction/).
  
🍎 Using [navigation mesh](https://www.donmccurdy.com/2017/08/20/creating-a-nav-mesh-for-a-webvr-scene/) based pathfinding.
  
🍎 Enables easy use of shaders created with [Shader Frog](https://shaderfrog.com/).
- Include the desired shader json file in your build by importing in shader-frog.js
- Declaratively implement the shader-frog component in your HTML.

🍎 JS, CSS, and JSON bundling, minification, and uglifying with [Rollup](https://rollupjs.org/guide/en).

🍎 Installable as a Progressive Web App [(PWA)](https://developers.google.com/web/progressive-web-apps/).

🍎 **Stats visualization system** including:
- **RingDial** data visualization widget
- **Meter** data visualization widget
- **GUI Widgets** (TODO)

🍎 Collectibiles System
- Offline collection
- Online collection
- Collectibles can be set to respawn

🍎 Items can be declared **grabbable**, therefore movable by players.

🍎 **grabbable** items can be launched with the **launchable** component.

🍎 BGM System (named exports)
- via SoundCloud
  - bgmlite: simple no UI, no server interaction
  - bgm: includes UI and interactive multiplayer interaction (TODO)

🍎 Player Component
- instantiated for all players
- avatars and animation clips can be changed dynamically


🍎 Particles Component
- implements [A-Frame Particle Player](https://github.com/supermedium/aframe-particleplayer-component)
- bundles particle animations stored as JSON

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

🍎 CS1.stats

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

    
    
