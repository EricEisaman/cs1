<img src="https://cdn.glitch.com/f8abb766-9950-44ff-9adb-2f5f53fdaf1b%2FCS1_192.png?1552299344920">

# CS1 Game Engine
____

## Roadmap to version 0.7.0 👣

🍎 Provide community with a clear goal for our developer experience (DX)
  - follow the entity component system (<a href="https://en.wikipedia.org/wiki/Entity_component_system" rel="noreferer">ECS</a>) paradigm consistent with A-Frame and the underlying browser custom components. ✅
  - Develop and document custom events system. ✅
  - Enable game configuration development to be partly achieved via visual development tools such as <a href="https://cs1-flow.glitch.me" rel="noreferer">CS1 Flow</a>.
    - CS1 Flow will be designed to authenticate with developer's Glitch projects and write the resulting configurations as an ES6 module file in those projects' .data directory via a server REST API.
    - There will be an empty configuration file in the .data directory in case the developer chooses not to use any of the visual development tools.  ✅
   
🍎 Game admin console component.
  - will provide client-side interface with the live game server.
  - functions
    - player boot
    - item spawns sent as server rendered HTML strings.
    
🍎 Build a compelling demo with specialized components and custom user data stored in database.
  - Create a lesson on storing and retrieving custom user data using the database.
  - Create a lesson on writing and using custom events.
