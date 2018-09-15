![curiosity driven learning](https://cdn.glitch.com/162b879e-fd42-40d9-8519-671d783b8c70%2Fcuriosity_driven_learning_logo.png?1537016449703) 

# CS1

*“For the things we have to learn before we can do them, we learn by doing them.” 
― Aristotle, The Nicomachean Ethics*
____
____

 ![geometry game](https://cdn.glitch.com/162b879e-fd42-40d9-8519-671d783b8c70%2Fgeo-game.gif?1534009918502) 

## Watch the Getting Started Videos <a href="https://youtu.be/04UIBSSw5AE?list=PLd_CKe0-tWOf-YZy6_nApH8Xg2XeHUHZm">![YouTube Playlist](https://cdn.glitch.com/162b879e-fd42-40d9-8519-671d783b8c70%2Fyt64.png?1537016897215)</a>

____

Set the **ADMIN_KEY** in .env. This becomes your admin user password, username **admin**, password your **ADMIN_KEY**. 

In the **client-config.js** set the values for:
  - game name
  - emoji following game name in browser tab
  - favicon showing in browser tab
  - login font family
  - login font color
  - login form background color
  - login overlay color
  - avatar array of face image URLs ( use .png with transparent background )
  - avatar color used for button background 
  - avatar speed
  - the text color for the messages
  - sound file URL for playerJoined
  - sound file URL for playerLeft
  - BGM songs, volume and whether to auto play through all songs
  - custom key bindings/behaviors
  - sythesized voice settings
  - physics gravity
  - maximum grab distance for movable objects
  - movable physics objects to be added to the scene
  - environment settings
  - thruster colors
  - mobile thruster button icon
  - vr mode enabled / disabled
____

## Choosing a Voice
  
Explore the different voice names by listing them in the game browser console with:
```js
printVoices()
```
![names](https://cdn.glitch.com/8cdffa44-0009-4d0b-89c7-731fef3fef0b%2Fnames.png?1533445633949)
 
Test a variety of voices in the game browser console with the following pattern using the message followed by the voice name:

```js
say("Do you like games?","Katy")
```
____

## Adding Users

In the game browser console add users with the following pattern:
![add user](https://cdn.glitch.com/8cdffa44-0009-4d0b-89c7-731fef3fef0b%2Fadduser.png?1533445801204)

If you forget the Users you added, open the server **Activity Log** and reboot the server by adding an extra space after all the code in the **server.js file**.  The user names and passwords will be printed in the **Activity Log**.
  
  ____
  
## Choosing an Environment

Select from a variety of **environment presets**. Add your chosen preset in the **client-config.js**.

![environment preset](https://cdn.glitch.com/162b879e-fd42-40d9-8519-671d783b8c70%2Fenvironment_preset.png)

**Environment Presets**  

![Environement Options](https://github.com/feiss/aframe-environment-component/raw/master/assets/aframeenvironment.gif?raw=true)

____

## How to Play

Move with **WASD** and **ARROW** keys.  Jump with the **SPACE** key.
Toggle music mute with **0** key. Play next song with **P** key. 

![UI](https://cdn.glitch.com/162b879e-fd42-40d9-8519-671d783b8c70%2Fui.png)

Toggle the **Message and Avatar UI** with the **EQUALS** key on desktop, **double tap right screen** on Android mobile, **single tap top right screen** on iOS. **Tab** your way through the UI elements. Once you have finished typing your message or selecting a new avatar, hit **ENTER** to submit.

Grab and move objects with **click & drag** or **click & move keys** on desktop, **hover & move or rotate** on mobile.

Note: **Users cannot be logged in more than once simultaneously!**


Pressing the **F** key or clicking the **VR Headset Icon**, if enabled in **client-config.js** will take you to fullscreen mode.  Note: in fullscreen mode only movement keys are enabled.  Press the **ESC** key to exit fullscreen mode. 

Try the <a href="https://geometry-game.glitch.me/" no-opener no-referer>**LIVE DEMO**</a> with test users **computer** and **science** both with password **1234**.


____



**Thruster Animation**

![App Screen2](https://cdn.glitch.com/97457b24-474e-42eb-9358-c8bc7bab1d9f%2Fapp-screen.gif?1533847350291)

**Screenshot with Four Players**

![App Screen3](https://cdn.glitch.com/162b879e-fd42-40d9-8519-671d783b8c70%2F4players.png?1534020052774)

**Screenshot of Side Entrance to Sky Island** (Click to see fullsize image.)

<a href="https://cdn.glitch.com/dd72d0a0-2747-40ff-8463-f7755366f80f%2Fexplore.png?1534335012603" no-opener no-referer><img src="https://cdn.glitch.com/dd72d0a0-2747-40ff-8463-f7755366f80f%2Fexplore.png?1534335012603"></a>

**Performance Test** ( 6 instances on 1 computer! )
![Performance Test](https://cdn.glitch.com/dd72d0a0-2747-40ff-8463-f7755366f80f%2Fperformanc_test_small_size.gif?1534356530693)

____

## Design Avatars

Create your own **.glb** avatar models with <a href="http://pixologic.com/sculptris/" no-opener no-referer>**Sculptris**</a> and <a href="https://www.blender.org/download/" no-opener no-referer>**Blender**</a>.

**Sculptris for Easy Creation of Basic Model**

![Sculptris](https://cdn.glitch.com/f54ba682-ab47-46e4-bf61-5e68e6053f18%2Fsculptris.png?1532961951688)

**Blender Bones Animation**

![Blender](https://cdn.glitch.com/f54ba682-ab47-46e4-bf61-5e68e6053f18%2Fblender.png?1532961633005)

**Blender Export as .glb**  

( plugin for Blender v2.79 <a href="https://github.com/KhronosGroup/glTF-Blender-Exporter" no-opener no-referer>here</a>. Note: Blender v2.80 will have built-in plugin )
![.glb export](https://cdn.glitch.com/f54ba682-ab47-46e4-bf61-5e68e6053f18%2Fexport.png?1532962417545)

____

## Mobile Performance

- Joystick ( forward, backward, yaw )
- Pitch control ( touch drag right side of screen )
- Thruster Button ( up and forward )
- Message, BGM, Avatar UI 
  - **Android** : double tap right screen  
  - **iOS** : single tap top right screen
- Putting the cursor over a movable object for 2 seconds triggers 5 seconds of grab and move ability.

![mobile-0](https://cdn.glitch.com/dd72d0a0-2747-40ff-8463-f7755366f80f%2Fmobile_0.jpg?1535470988490)
![mobile-1](https://cdn.glitch.com/dd72d0a0-2747-40ff-8463-f7755366f80f%2Fmobile_1.jpg?1535470988578)
![mobile-2](https://cdn.glitch.com/dd72d0a0-2747-40ff-8463-f7755366f80f%2Fmobile_2.jpg?1535470988342)

____

## Related Videos

<a href="https://youtu.be/04UIBSSw5AE?list=PLd_CKe0-tWOf-YZy6_nApH8Xg2XeHUHZm" no-opener no-referer>🏁 Getting Started Playlist</a>

<a href="https://youtu.be/5SWlbeJzCDM" no-opener no-referer>🎨 Color and Font Themes</a>

<a href="https://youtu.be/eUVZ-o8N72U" no-opener no-referer>ℹ️ Overview 1</a>

<a href="https://youtu.be/11lV0jJpN7w" no-opener no-referer>ℹ️ Overview 2</a>

<a href="https://youtu.be/SIOQWoPyXGU" no-opener no-referer>ℹ️ Overview 3</a>

<a href="https://youtu.be/PaJe14bQMCY" no-opener no-referer>ℹ️ Overview 4</a>

____

## Special Thanks

Thanks to BrowserStack for easy testing of our UX/UI on many browsers.
<a href="https://www.browserstack.com" no-opener no-referer>![BrowserStack](https://cdn.glitch.com/dd72d0a0-2747-40ff-8463-f7755366f80f%2FBrowserstack-logo%402x.png)</a>

I would also like to extend special thanks to <a href="https://sketchfab.com/ZOSK" no-opener no-referer>**ZOSK Studios**</a> for the creation of the sky island model used in this project.