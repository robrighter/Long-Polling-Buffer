Long Polling Buffer
===================

(C) Rob Righter (@robrighter) 2009, Licensed under the MIT-LICENSE

A Library for Node.js to simplify AJAX long polling

API
---

### LongPollingBuffer(buffersize)

Constructor. Initializes the buffer to be of size buffersize

### push(value)

Pushes data onto the queue which in turn notifies all the listeners

### addListenerForUpdateSince(since, callback)

Adds a listener for data updates. The callback is triggered when data is available after the since.


Example usage: Simple Activity Monitor
--------------------------------------

	var fu = require("./lib/fu");
	var sys = require('sys');
	process.mixin(GLOBAL, require("./lib/underscore"));
	var lpb = require("./lib/longpollingbuffer");
	
	HOST = null; // localhost
	PORT = 8000;
	
	//helper function
	String.prototype.trim = function() {
    	return this.replace(/^\s+|\s+$/g,"");
	}
	
	// Now start the program
	fu.listen(PORT, HOST);
	var rb = new lpb.LongPollingBuffer(200); //Create the Long Polling Buffer
	var iostat = process.createChildProcess("iostat", ["-w 1"])
	
	
	//Setup the listener to handle the flow of data from iostat 
	iostat.addListener("output", function (data) {
    	sys.puts(data);
    	if(data.search(/cpu/i) == -1){ //suppress the column header from iostat
        	rb.push(data.trim().split(/\s+/).join(" "));
    	}
	});
	
	//Setup the updater page for long polling  
	fu.get("/update", function (req, res) {
      	res.sendHeader(200,{"Content-Type": "text/html"});
      	var thesince = parseInt(req.uri.params.since);
      	if(!thesince){
          	thesince = -1;
      	}
      
      	rb.addListenerForUpdateSince(thesince, function(data){
           	var body = '['+_.map(data,JSON.stringify).join(',\n')+']';
           	res.sendBody( body );
           	res.finish();
      	});
	});
  
	// Static Files
	fu.get("/", fu.staticHandler("./client-side/index.html"));
	fu.get("/css/site.css", fu.staticHandler("./client-side/css/site.css"));
	fu.get("/js/site.js", fu.staticHandler("./client-side/js/site.js"));