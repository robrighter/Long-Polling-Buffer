var sys = require('sys');
var un = require("./lib/underscore");
var lpb = require("./lib/longpollingbuffer");

var rb = new lpb.LongPollingBuffer(8);

rb.push("I'm");
rb.push('affraid');
rb.push('the Death Star');
rb.push('will be');
rb.push('fully');
rb.push('operational');
rb.push('when');
rb.push('your');
rb.push('friends');
rb.push('arrive');


//Since forever (or to the size of teh buffer)
rb.addListenerForUpdateSince(-1, function(data){
     sys.puts('\n\nSince forever (or to the size of the buffer): \n' + _.map(data,JSON.stringify).join(',\n') );
});

//Since offset 6
rb.addListenerForUpdateSince(6, function(data){
     sys.puts('\n\nSince offset 6: \n' + _.map(data,JSON.stringify).join(',\n') );
});