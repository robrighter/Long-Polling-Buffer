var sys = require('sys');
var un = require("./lib/underscore");
var lpb = require("./lib/longpollingbuffer");

var buffer = new lpb.LongPollingBuffer(8);

buffer.push("I'm");
buffer.push('affraid');
buffer.push('the Death Star');
buffer.push('will be');
buffer.push('fully');
buffer.push('operational');
buffer.push('when');
buffer.push('your');
buffer.push('friends');
buffer.push('arrive');


//Since forever (or to the size of teh buffer)
buffer.addListenerForUpdateSince(-1, function(data){
 sys.puts('\n\nSince forever (or to the size of the buffer): \n' + _.map(data,JSON.stringify).join(',\n') );
});

//Since offset 6
buffer.addListenerForUpdateSince(6, function(data){
 sys.puts('\n\nSince offset 6: \n' + _.map(data,JSON.stringify).join(',\n') );
});