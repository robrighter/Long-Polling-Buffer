// Long Polling Buffer
// (C) Rob Righter (@robrighter) 2010, Licensed under the MIT-LICENSE
var sys = require('sys');

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
        this.emit('newData',this.data);
    }
    
    this.datasince = function(since) {
        return this.data.filter(function(item){ return item.offset>since; });
    }
    
    this.addListenerForUpdateSince = function(since, callback) {
        response = this.datasince(since);
        if(response.length==0){
            //no data yet pass off the callout to wait for it
            handler = function(thedata){
                callback(thedata);
                this.removeListener('newData', handler);
            }
            this.addListener('newData', handler);
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