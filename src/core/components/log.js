export default(()=>{

AFRAME.registerSystem('log', {
	  schema: {
	    console: {default: true}
	  },

	  init: function () {
	    var data = this.data;
	    var logs = this.logs = [];
	    var loggers = this.loggers = [];

	    // Register global function for logging.
	    window.CS1.log = function (message, channel) {
	      logs.push([message, channel]);
	      loggers.forEach(function (loggerComponent) {
	        loggerComponent.receiveLog(message, channel);
	      });

	      if (data.console) {
	        console.log('[log:' + (channel || '') + '] ' + message);
	      }
	    };
      
      window.CS1.socket.on('vr-log',data=>{
        window.CS1.log(data.msg,data.channel);
      });
      
      window.CS1.logall = function (message, channel){
        window.CS1.socket.emit('logall',{msg:message,channel:channel});    
      }
      
      
	  },

	  registerLogger: function (component) {
	    this.loggers.push(component);
	    this.logs.forEach(function (log) {
	      component.receiveLog.apply(component, log);
	    });
	  },

	  unregisterLogger: function (component) {
	    this.loggers.splice(this.loggers.indexOf(component), 1);
	  }
	});

	/**
	 * In-VR logging using text component.
	 */
	AFRAME.registerComponent('log', {
	  schema: {
	    channel: {type: 'string'},
	    filter: {type: 'string'},
	    max: {default: 100},
	    showErrors: {default: true}
	  },

	  init: function () {
	    this.logs = [];
	    this.system.registerLogger(this);
	  },

	  play: function () {
	    var self = this;

	    // Listen for `<a-scene>.emit('log')`.
	    this.el.sceneEl.addEventListener('log', function (evt) {
	      if (!evt.detail) { return; }
	      self.receiveLog(evt.detail.message, evt.detail.channel);
	    });

	    window.onerror = function (errorMsg, url, lineNumber, column, errorObj) {
	      self.receiveLog('Error: ' + errorMsg);
	    }
	  },

	  receiveLog: function (message, channel) {
	    var data = this.data;

	    // Coerce to string.
	    if (typeof message !== 'string') {
	      message = JSON.stringify(message);
	    }

	    // Match with ID if defined in data or event detail.
	    if (data.channel && channel && data.channel !== channel) { return; }

	    // Apply filter if `filter` defined.
	    if (data.filter && message.indexOf(data.filter) === -1) { return; }

	    // Add log.
	    this.logs.push(message);

	    // Truncate logs if `max` defined.
	    if (data.max && this.logs.length > data.max) { this.logs.shift(); }

	    // Update text. Each log gets its own line.
	    this.el.setAttribute('text', {value: this.logs.join('\n')});
      
	  },

	  remove: function () {
	    this.el.removeAttribute('text');
	    this.system.unregisterLogger(this);
	  }
	});
  
})()