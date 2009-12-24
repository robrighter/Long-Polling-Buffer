var sys = require('sys');
var un = require("./underscore");

//the readbuffer provides a databuffer with a moving offset that can be used to allow AJAX long polling (instead of the websocket)
function LongPollingBuffer (buffersize) {
    this.data = new Array();
    this.size = buffersize;
    this.offset = 0;
    
    function BufferItem (offset,value) {
        this.offset = offset;
        this.value = value;
    }
    
    this.push = function(value) {
        this.data.unshift(new BufferItem(this.offset++,value));
        while(this.data.length > this.size){
            this.data.pop([]);
        }
        this.emit('newdata',this.data);
    }
    
    this.datasince = function(since) {
        return un._.select(this.data, function(item){ return item.offset>since; });
    }
    
    this.addListenerForUpdateSince = function(since, callback) {
        response = this.datasince(since);
        if(response.length==0){
            //no data yet pass off the callout to wait for it
            this.addListener('newdata', function(thedata){
                callback(this.datasince(since));
            });
        }
        else {
            //send back the data
            callback(response);
        }
    }
}

LongPollingBuffer.prototype = new process.EventEmitter();


process.mixin(exports, {
  LongPollingBuffer: LongPollingBuffer
});