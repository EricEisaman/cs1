<img src="https://cdn.glitch.com/f8abb766-9950-44ff-9adb-2f5f53fdaf1b%2FCS1_192.png?1552299344920">

# CS1 Game Engine
#### version 0.3.1
____

## Mission

🍎 Provide the JavaScript community with a fast track to high performance 3D VR multiplayer games installable on phones, tablets, laptops, and desktops as Progressive Web Applications (PWAs). The resultant games are compatible with many popular VR HMD and controller systems such as the Oculus Quest.

🍎 Provide computer science students and teachers with an accompanying introductory level curriculum.

____

## Try Tech Demo

🍎 Log into the <a href="https://cs1.glitch.me/" noopener noreferer>tech demo</a> with username: **computer** or **science** and password: **1234**.

____

## Quick Start 

🍎 Remix this project.

🍎 Add an **ADMIN_KEY** in **.env**

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

🍎 [A-Frame Effects](https://github.com/wizgrav/aframe-effects)
- bloom
- glitch
- godrays
- fxaa

🍎 [A-Frame Particle Player](https://github.com/supermedium/aframe-particleplayer-component)
- JSON particles bundling

🍎 BGM System
- via SoundCloud (TODO)

🍎 Player Component
- instantiated for all players
- avatars and animation clips can be changed dynamically

____

## <a href="https://docs.google.com/presentation/d/e/2PACX-1vSm0Bv326sS-haY14GL5SUnpuE1jdtX_WvIWBljpKMtOk0fcnXwu-fNEp3cAk1TcsQ0NZl7HllgsK7Q/pub?start=false&loop=false&delayms=60000" noopener noreferer>Curriculum</a>

## Lesson One

#### Objectives

🍎 Describe the **server** and the **client**.

🍎 Describe **HTML**, **CSS**, and **JavaScript**.

🍎 Describe **Node.js**.

🍎 Describe a **websocket** connection.

🍎 Describe **persistent data** and **databases**.

🍎 Create an **ADMIN_KEY** in the **.env** file.

🍎 Create a custom **gameName** value in the **src/client-config.js** file.

🍎 Build the client **bundle.js** and **bundle.css** in the server **Tools/Console**.

```

pnpm run build
refresh

```
🍎 Join your game with the **admin** username and **ADMIN_KEY** password.

🍎 Add a **new user** to the game database from the **client console**.

```
CS1.socket.emit('add-user', {key:[ADMIN_KEY], name:[new username], pw:[new user's password]})

```

🍎 Test multiplayer functionality by logging in with two users.

____


## Lesson Two 

#### Objectives


🍎 Describe a **Progressive Web Application (PWA)**.

🍎 Create your own **PWA icons** at **512x512** and **192x192** pixel resolutions.

🍎 Customize your **public/manifest.json** file.

🍎 Describe the  **JSON** file format and common use cases.

🍎 Install your **PWA** on a **phone**, **tablet**, or **Windows 10 device**.

____

## Issues

🍎 Please post any issues to <a href="https://github.com/EricEisaman/cs1/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc" noopener noreferer>GitHub</a>.

    
    
