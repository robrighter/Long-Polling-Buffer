// Long Polling Buffer
// (C) Rob Righter (@robrighter) 2010, Licensed under the MIT-LICENSE

//the readbuffer provides a databuffer with a moving offset that can be used to allow AJAX long polling (instead of the websocket)
var LongPollingBuffer = function (buffersize) {
    
    var data = new Array();
    var listeners = {};
    this.size = buffersize;
    this.offset = 0;
    this.uid = 0;
    
    var addListener = function (uid, callback){
        listeners[''+uid] = callback;
    }
    
    var removeListener = function(uid) {
        delete listeners[''+uid];
    }
    
    var notifyAll = function (){
        for(var key in listeners){
            listeners[key]();
        }
    }
    
    function BufferItem (offset,value) {
        this.offset = offset;
        this.value = value;
    }
    
    var datasince = function(since) {
        return data.filter(function(item){ return item.offset>since; });
    }
    
    this.push  = function(value) {
        data.unshift(new BufferItem(this.offset++,value));
        while(data.length > this.size){
            data.pop([]);
        }
        notifyAll();
    }
    
    this.addListenerForUpdateSince = function(since, callback) {
        response = datasince(since);
        if(response.length==0){
            //no data yet pass off the callout to wait for it
            var theuid = ''+this.uid++;
            addListener(theuid,function(){
                callback(datasince(since));
                removeListener(theuid);
            });
            
        }
        else {
            //send back the data
            callback(response);
        }
    }
    
}

process.mixin(exports, {
  LongPollingBuffer: LongPollingBuffer
});