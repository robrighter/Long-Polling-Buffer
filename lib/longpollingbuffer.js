// Long Polling Buffer
// (C) Rob Righter (@robrighter) 2010, Licensed under the MIT-LICENSE

"use strict";

//the readbuffer provides a databuffer with a moving offset that can be used to allow AJAX long polling (instead of the websocket)
var LongPollingBuffer = function (buffersize) {

  var data = [],
    listeners = {},
    dirty = false,
    closed = false,
    addListener,
    removeListener,
    notifyAll,
    BufferItem,
    datasince;

  this.size = buffersize;
  this.offset = 0;
  this.uid = 0;

  addListener = function (uid, callback) {
    if (closed) {
      callback();
    } else {
      listeners[uid] = callback;
    }
  };

  removeListener = function (uid) {
    delete listeners[uid];
  };

  notifyAll = function () {
    var key;
    dirty = false;
    for (key in listeners) {
      if (listeners.hasOwnProperty(key)) {
        process.nextTick(listeners[key]);
      }
    }
  };

  BufferItem = function (offset, value) {
    this.offset = offset;
    this.value = value;
  };

  datasince = function(since) {
    return data.filter(function (item) {
      return item.offset > since;
    });
  };

  this.push  = function(value) {
    data.unshift(new BufferItem(this.offset, value));
    this.offset += 1;
    while (data.length > this.size) {
      data.pop([]);
    }
    this.flush();
  };

  this.addListenerForUpdateSince = function(since, callback) {
    var response, theuid;

    response = datasince(since);

    if (response.length === 0) {
      //no data yet pass off the callout to wait for it
      theuid = this.uid;
      this.uid += 1;
      addListener(theuid, function () {
        callback(datasince(since));
        removeListener(theuid);
      });
    } else {
      //send back the data
      callback(response);
    }
  };

  this.flush = function () {
    if (!dirty) {
      process.nextTick(notifyAll);
      dirty = true;
    }
  };

  this.close = function () {
    closed = true;
    this.flush();
  };
};

module.exports = LongPollingBuffer;
module.exports.LongPollingBuffer = LongPollingBuffer;
