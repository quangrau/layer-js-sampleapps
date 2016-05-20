(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.layer = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

module.exports = {
  Root: require('./src/root'),
  Client: require('./src/client'),
  ClientAuthenticator: require('./src/client-authenticator'),
  Syncable: require('./src/syncable'),
  Conversation: require('./src/conversation'),
  Message: require('./src/message'),
  Announcement: require('./src/announcement'),
  MessagePart: require('./src/message-part'),
  Query: require('./src/query'),
  QueryBuilder: require('./src/query-builder'),
  xhr: require('./src/xhr'),
  User: require('./src/user'),
  LayerError: require('./src/layer-error'),
  LayerEvent: require('./src/layer-event'),
  Content: require('./src/content'),
  SyncManager: require('./src/sync-manager'),
  SyncEvent: require('./src/sync-event').SyncEvent,
  XHRSyncEvent: require('./src/sync-event').XHRSyncEvent,
  WebsocketSyncEvent: require('./src/sync-event').WebsocketSyncEvent,
  Websockets: {
    SocketManager: require('./src/websockets/socket-manager'),
    RequestManager: require('./src/websockets/request-manager'),
    ChangeManager: require('./src/websockets/change-manager')
  },
  OnlineStateManager: require('./src/online-state-manager'),
  DbManager: require('./src/db-manager'),
  Constants: require('./src/const'),
  Util: require('./src/client-utils'),
  TypingIndicators: require('./src/typing-indicators/typing-indicators')
};
module.exports.TypingIndicators.TypingListener = require('./src/typing-indicators/typing-listener');
module.exports.TypingIndicators.TypingPublisher = require('./src/typing-indicators/typing-publisher');

},{"./src/announcement":7,"./src/client":11,"./src/client-authenticator":8,"./src/client-utils":10,"./src/const":12,"./src/content":13,"./src/conversation":14,"./src/db-manager":15,"./src/layer-error":16,"./src/layer-event":17,"./src/message":20,"./src/message-part":19,"./src/online-state-manager":21,"./src/query":23,"./src/query-builder":22,"./src/root":24,"./src/sync-event":25,"./src/sync-manager":26,"./src/syncable":27,"./src/typing-indicators/typing-indicators":29,"./src/typing-indicators/typing-listener":30,"./src/typing-indicators/typing-publisher":31,"./src/user":32,"./src/websockets/change-manager":33,"./src/websockets/request-manager":34,"./src/websockets/socket-manager":35,"./src/xhr":36}],2:[function(require,module,exports){
/**
 * Standalone extraction of Backbone.Events, no external dependency required.
 * Degrades nicely when Backone/underscore are already available in the current
 * global context.
 *
 * Note that docs suggest to use underscore's `_.extend()` method to add Events
 * support to some given object. A `mixin()` method has been added to the Events
 * prototype to avoid using underscore for that sole purpose:
 *
 *     var myEventEmitter = BackboneEvents.mixin({});
 *
 * Or for a function constructor:
 *
 *     function MyConstructor(){}
 *     MyConstructor.prototype.foo = function(){}
 *     BackboneEvents.mixin(MyConstructor.prototype);
 *
 * (c) 2009-2013 Jeremy Ashkenas, DocumentCloud Inc.
 * (c) 2013 Nicolas Perriault
 */
/* global exports:true, define, module */
(function() {
  var root = this,
      nativeForEach = Array.prototype.forEach,
      hasOwnProperty = Object.prototype.hasOwnProperty,
      slice = Array.prototype.slice,
      idCounter = 0;

  // Returns a partial implementation matching the minimal API subset required
  // by Backbone.Events
  function miniscore() {
    return {
      keys: Object.keys || function (obj) {
        if (typeof obj !== "object" && typeof obj !== "function" || obj === null) {
          throw new TypeError("keys() called on a non-object");
        }
        var key, keys = [];
        for (key in obj) {
          if (obj.hasOwnProperty(key)) {
            keys[keys.length] = key;
          }
        }
        return keys;
      },

      uniqueId: function(prefix) {
        var id = ++idCounter + '';
        return prefix ? prefix + id : id;
      },

      has: function(obj, key) {
        return hasOwnProperty.call(obj, key);
      },

      each: function(obj, iterator, context) {
        if (obj == null) return;
        if (nativeForEach && obj.forEach === nativeForEach) {
          obj.forEach(iterator, context);
        } else if (obj.length === +obj.length) {
          for (var i = 0, l = obj.length; i < l; i++) {
            iterator.call(context, obj[i], i, obj);
          }
        } else {
          for (var key in obj) {
            if (this.has(obj, key)) {
              iterator.call(context, obj[key], key, obj);
            }
          }
        }
      },

      once: function(func) {
        var ran = false, memo;
        return function() {
          if (ran) return memo;
          ran = true;
          memo = func.apply(this, arguments);
          func = null;
          return memo;
        };
      }
    };
  }

  var _ = miniscore(), Events;

  // Backbone.Events
  // ---------------

  // A module that can be mixed in to *any object* in order to provide it with
  // custom events. You may bind with `on` or remove with `off` callback
  // functions to an event; `trigger`-ing an event fires all callbacks in
  // succession.
  //
  //     var object = {};
  //     _.extend(object, Backbone.Events);
  //     object.on('expand', function(){ alert('expanded'); });
  //     object.trigger('expand');
  //
  Events = {

    // Bind an event to a `callback` function. Passing `"all"` will bind
    // the callback to all events fired.
    on: function(name, callback, context) {
      if (!eventsApi(this, 'on', name, [callback, context]) || !callback) return this;
      this._events || (this._events = {});
      var events = this._events[name] || (this._events[name] = []);
      events.push({callback: callback, context: context, ctx: context || this});
      return this;
    },

    // Bind an event to only be triggered a single time. After the first time
    // the callback is invoked, it will be removed.
    once: function(name, callback, context) {
      if (!eventsApi(this, 'once', name, [callback, context]) || !callback) return this;
      var self = this;
      var once = _.once(function() {
        self.off(name, once);
        callback.apply(this, arguments);
      });
      once._callback = callback;
      return this.on(name, once, context);
    },

    // Remove one or many callbacks. If `context` is null, removes all
    // callbacks with that function. If `callback` is null, removes all
    // callbacks for the event. If `name` is null, removes all bound
    // callbacks for all events.
    off: function(name, callback, context) {
      var retain, ev, events, names, i, l, j, k;
      if (!this._events || !eventsApi(this, 'off', name, [callback, context])) return this;
      if (!name && !callback && !context) {
        this._events = {};
        return this;
      }

      names = name ? [name] : _.keys(this._events);
      for (i = 0, l = names.length; i < l; i++) {
        name = names[i];
        if (events = this._events[name]) {
          this._events[name] = retain = [];
          if (callback || context) {
            for (j = 0, k = events.length; j < k; j++) {
              ev = events[j];
              if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
                  (context && context !== ev.context)) {
                retain.push(ev);
              }
            }
          }
          if (!retain.length) delete this._events[name];
        }
      }

      return this;
    },

    // Trigger one or many events, firing all bound callbacks. Callbacks are
    // passed the same arguments as `trigger` is, apart from the event name
    // (unless you're listening on `"all"`, which will cause your callback to
    // receive the true name of the event as the first argument).
    trigger: function(name) {
      if (!this._events) return this;
      var args = slice.call(arguments, 1);
      if (!eventsApi(this, 'trigger', name, args)) return this;
      var events = this._events[name];
      var allEvents = this._events.all;
      if (events) triggerEvents(events, args);
      if (allEvents) triggerEvents(allEvents, arguments);
      return this;
    },

    // Tell this object to stop listening to either specific events ... or
    // to every object it's currently listening to.
    stopListening: function(obj, name, callback) {
      var listeners = this._listeners;
      if (!listeners) return this;
      var deleteListener = !name && !callback;
      if (typeof name === 'object') callback = this;
      if (obj) (listeners = {})[obj._listenerId] = obj;
      for (var id in listeners) {
        listeners[id].off(name, callback, this);
        if (deleteListener) delete this._listeners[id];
      }
      return this;
    }

  };

  // Regular expression used to split event strings.
  var eventSplitter = /\s+/;

  // Implement fancy features of the Events API such as multiple event
  // names `"change blur"` and jQuery-style event maps `{change: action}`
  // in terms of the existing API.
  var eventsApi = function(obj, action, name, rest) {
    if (!name) return true;

    // Handle event maps.
    if (typeof name === 'object') {
      for (var key in name) {
        obj[action].apply(obj, [key, name[key]].concat(rest));
      }
      return false;
    }

    // Handle space separated event names.
    if (eventSplitter.test(name)) {
      var names = name.split(eventSplitter);
      for (var i = 0, l = names.length; i < l; i++) {
        obj[action].apply(obj, [names[i]].concat(rest));
      }
      return false;
    }

    return true;
  };

  // A difficult-to-believe, but optimized internal dispatch function for
  // triggering events. Tries to keep the usual cases speedy (most internal
  // Backbone events have 3 arguments).
  var triggerEvents = function(events, args) {
    var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
    switch (args.length) {
      case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
      case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
      case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
      case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
      default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args);
    }
  };

  var listenMethods = {listenTo: 'on', listenToOnce: 'once'};

  // Inversion-of-control versions of `on` and `once`. Tell *this* object to
  // listen to an event in another object ... keeping track of what it's
  // listening to.
  _.each(listenMethods, function(implementation, method) {
    Events[method] = function(obj, name, callback) {
      var listeners = this._listeners || (this._listeners = {});
      var id = obj._listenerId || (obj._listenerId = _.uniqueId('l'));
      listeners[id] = obj;
      if (typeof name === 'object') callback = this;
      obj[implementation](name, callback, this);
      return this;
    };
  });

  // Aliases for backwards compatibility.
  Events.bind   = Events.on;
  Events.unbind = Events.off;

  // Mixin utility
  Events.mixin = function(proto) {
    var exports = ['on', 'once', 'off', 'trigger', 'stopListening', 'listenTo',
                   'listenToOnce', 'bind', 'unbind'];
    _.each(exports, function(name) {
      proto[name] = this[name];
    }, this);
    return proto;
  };

  // Export Events as BackboneEvents depending on current context
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = Events;
    }
    exports.BackboneEvents = Events;
  }else if (typeof define === "function"  && typeof define.amd == "object") {
    define(function() {
      return Events;
    });
  } else {
    root.BackboneEvents = Events;
  }
})(this);

},{}],3:[function(require,module,exports){

},{}],4:[function(require,module,exports){
/**
 * The layer.js.LayerPatchParser method will parse
 *
 * @method
 * @param {Boolean}   [camelCase=false]             Set the camel cased version of the name of the input object
 * @param {Object}    [propertyNameMap]             Maps property names in the operation to property names in the local object schema
 * @param {Object}    [changeCallbacks]             Callback made any time an object is changed
 * @param {Object}    [abortCallbacks]              Callback made to verify a change is permitted
 * @param {Function}  [doesObjectMatchIdCallback]   Callback returns boolean to indicate if a given object matches an ID.
 * @return {Boolean}                                Returns true if all operations completed successfully, false if some returned errors
 */

(function() {
  var opHandlers = {
    'set': setProp,
    'delete': deleteProp,
    'add': addProp,
    'remove': removeProp
  };

  function Parser(options) {
    this.camelCase = options.camelCase;
    this.propertyNameMap = options.propertyNameMap;
    this.changeCallbacks = options.changeCallbacks;
    this.abortCallbacks = options.abortCallbacks;
    this.getObjectCallback = options.getObjectCallback;
    this.doesObjectMatchIdCallback = options.doesObjectMatchIdCallback || function(id, obj) {
      return obj.id == id;
    };
    this.returnIds = options.returnIds;
    return this;
  };

  if (typeof module !== 'undefined') {
    module.exports = Parser;
  } else {
    window.LayerPatchParser = Parser;
  }

  Parser.prototype.parse = function(options) {
    var changes = {};
    options.operations.forEach(function(op) {
      var propertyDef = getPropertyDef.apply(this, [op.property, options, changes, op])
      opHandlers[op.operation].call(this,
        propertyDef,
        getValue.apply(this, [op, options]),
        op, options, changes);
    }, this);

    reportChanges.apply(this, [changes, options.object, options.type]);
  };

  function reportChanges(changes, updateObject, objectType) {
    if (this.changeCallbacks && objectType && this.changeCallbacks[objectType]) {
      Object.keys(changes).forEach(function(key) {
        if (this.changeCallbacks[objectType].all) {
          this.changeCallbacks[objectType].all(updateObject, updateObject[key], changes[key].before, changes[key].paths);
        }
        else if (this.changeCallbacks[objectType][key]) {
          this.changeCallbacks[objectType][key](updateObject, updateObject[key], changes[key].before, changes[key].paths);
        }
      }, this);
    }
  }

  function getPropertyDef(property, options, changes, operation) {
    var obj = options.object;
    var temporarySeparator = String.fromCharCode(145);
    property = property.replace(/\\\./g, temporarySeparator);
    property = property.replace(/\\(.)/g, '$1');
    var parts = property.split(/\./);

    var r = new RegExp(temporarySeparator, 'g')
    parts = parts.map(function(part) {
      return part.replace(r, '.');
    });

    if (this.camelCase) {
      parts[0] = parts[0].replace(/[-_]./g, function(str) {
        return str[1].toUpperCase();
      });
    }

    if (this.propertyNameMap) {
      var typeDef = this.propertyNameMap[options.type];
      parts[0] = (typeDef && typeDef[parts[0]]) || parts[0];
    }

    trackChanges.apply(this, [{
      baseName: parts[0],
      fullPath: property,
      object: options.object,
      options: options,
      changes: changes,
      operation: operation
    }]);

    var curObj = obj;
    for (var i = 0; i < parts.length-1; i++) {
      var part = parts[i];
      if (part in curObj) {
        curObj = curObj[part];
        if (curObj === null || typeof curObj !== 'object') throw new Error('Can not access property \'' + property + '\'');
      } else {
        curObj[part] = {};
        curObj = curObj[part];
      }
    }
    return {
      pointer: curObj,
      lastName: parts[parts.length-1],
      baseName: parts[0],
      fullPath: property,
      abortHandler: this.abortCallbacks && this.abortCallbacks[options.type] && (this.abortCallbacks[options.type].all || this.abortCallbacks[options.type][parts[0]])
    };
  }

  function getValue(op, options) {
    if (op.id) {
      if (!this.getObjectCallback) throw new Error('Must provide getObjectCallback in constructor to use ids');
      var result = this.getObjectCallback(op.id);
      if (result) return result;
      if (this.returnIds) return op.id;
      return null;
    } else {
      return op.value;
    }
  }

  function trackChanges(options) {
    if (!options.changes[options.baseName]) {
      var initialValue = options.object[options.baseName];
      if ('id' in options.operation && initialValue) {
        initialValue = initialValue.id;
      }
      var change = options.changes[options.baseName] = {paths: []};
      change.before = (initialValue && typeof initialValue === 'object') ? JSON.parse(JSON.stringify(initialValue)) : initialValue;
    }
    var paths = options.changes[options.baseName].paths;
    if (paths.indexOf(options.fullPath) === -1) {
      paths.push(options.fullPath);
    }
  }

  function setProp(propertyDef, value, op, options, changes) {
    if (propertyDef.abortHandler) {
      if (propertyDef.abortHandler(propertyDef.fullPath, 'set', value)) return;
    }
    propertyDef.pointer[propertyDef.lastName] = value;

  }

  function deleteProp(propertyDef, value, op, options, changes) {
    if (propertyDef.abortHandler) {
      if (propertyDef.abortHandler(propertyDef.fullPath, 'delete', value)) return;
    }
    delete propertyDef.pointer[propertyDef.lastName];
  }

  function addProp(propertyDef, value, op, options, changes) {
    if (propertyDef.abortHandler) {
      if (propertyDef.abortHandler(propertyDef.fullPath, 'add', value)) return;
    }
    var obj;
    if (propertyDef.lastName in propertyDef.pointer) {
      obj = propertyDef.pointer[propertyDef.lastName];
    } else {
      obj = propertyDef.pointer[propertyDef.lastName] = [];
    }
    if (!Array.isArray(obj)) throw new Error('The add operation requires an array or new structure to add to.');
    if (!op.id) {
      if (Array.isArray(value)) throw new Error('The add operation will not add arrays to sets.');
      if (value && typeof value === 'object') throw new Error('The add operation will not add objects to sets.');
    }
    if (obj.indexOf(value) === -1) obj.push(value);
  }

  function removeProp(propertyDef, value, op, options, changes) {
    if (propertyDef.abortHandler) {
      if (propertyDef.abortHandler(propertyDef.fullPath, 'remove', value)) return;
    }
    var obj;
    if (propertyDef.lastName in propertyDef.pointer) {
      obj = propertyDef.pointer[propertyDef.lastName];
    } else {
      obj = propertyDef.pointer[propertyDef.lastName] = [];
    }
    if (!Array.isArray(obj)) throw new Error('The remove operation requires an array or new structure to remove from.');

    if (!op.id) {
      if (Array.isArray(value)) throw new Error('The remove operation will not remove arrays from sets.');
      if (value && typeof value === 'object') throw new Error('The remove operation will not remove objects from sets.');

      var index = obj.indexOf(value);
      if (index !== -1) obj.splice(index, 1);
    } else {
      for (var i = 0; i < obj.length; i++) {
        if (this.doesObjectMatchIdCallback(op.id, obj[i])) {
          obj.splice(i, 1);
          break;
        }
      }
    }
  }
})();

},{}],5:[function(require,module,exports){
(function (global){

var rng;

if (global.crypto && crypto.getRandomValues) {
  // WHATWG crypto-based RNG - http://wiki.whatwg.org/wiki/Crypto
  // Moderately fast, high quality
  var _rnds8 = new Uint8Array(16);
  rng = function whatwgRNG() {
    crypto.getRandomValues(_rnds8);
    return _rnds8;
  };
}

if (!rng) {
  // Math.random()-based (RNG)
  //
  // If all else fails, use Math.random().  It's fast, but is of unspecified
  // quality.
  var  _rnds = new Array(16);
  rng = function() {
    for (var i = 0, r; i < 16; i++) {
      if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
      _rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
    }

    return _rnds;
  };
}

module.exports = rng;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],6:[function(require,module,exports){
//     uuid.js
//
//     Copyright (c) 2010-2012 Robert Kieffer
//     MIT License - http://opensource.org/licenses/mit-license.php

// Unique ID creation requires a high quality random # generator.  We feature
// detect to determine the best RNG source, normalizing to a function that
// returns 128-bits of randomness, since that's what's usually required
var _rng = require('./rng');

// Maps for number <-> hex string conversion
var _byteToHex = [];
var _hexToByte = {};
for (var i = 0; i < 256; i++) {
  _byteToHex[i] = (i + 0x100).toString(16).substr(1);
  _hexToByte[_byteToHex[i]] = i;
}

// **`parse()` - Parse a UUID into it's component bytes**
function parse(s, buf, offset) {
  var i = (buf && offset) || 0, ii = 0;

  buf = buf || [];
  s.toLowerCase().replace(/[0-9a-f]{2}/g, function(oct) {
    if (ii < 16) { // Don't overflow!
      buf[i + ii++] = _hexToByte[oct];
    }
  });

  // Zero out remaining bytes if string was short
  while (ii < 16) {
    buf[i + ii++] = 0;
  }

  return buf;
}

// **`unparse()` - Convert UUID byte array (ala parse()) into a string**
function unparse(buf, offset) {
  var i = offset || 0, bth = _byteToHex;
  return  bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]];
}

// **`v1()` - Generate time-based UUID**
//
// Inspired by https://github.com/LiosK/UUID.js
// and http://docs.python.org/library/uuid.html

// random #'s we need to init node and clockseq
var _seedBytes = _rng();

// Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
var _nodeId = [
  _seedBytes[0] | 0x01,
  _seedBytes[1], _seedBytes[2], _seedBytes[3], _seedBytes[4], _seedBytes[5]
];

// Per 4.2.2, randomize (14 bit) clockseq
var _clockseq = (_seedBytes[6] << 8 | _seedBytes[7]) & 0x3fff;

// Previous uuid creation time
var _lastMSecs = 0, _lastNSecs = 0;

// See https://github.com/broofa/node-uuid for API details
function v1(options, buf, offset) {
  var i = buf && offset || 0;
  var b = buf || [];

  options = options || {};

  var clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq;

  // UUID timestamps are 100 nano-second units since the Gregorian epoch,
  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
  var msecs = options.msecs !== undefined ? options.msecs : new Date().getTime();

  // Per 4.2.1.2, use count of uuid's generated during the current clock
  // cycle to simulate higher resolution clock
  var nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1;

  // Time since last uuid creation (in msecs)
  var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;

  // Per 4.2.1.2, Bump clockseq on clock regression
  if (dt < 0 && options.clockseq === undefined) {
    clockseq = clockseq + 1 & 0x3fff;
  }

  // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
  // time interval
  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
    nsecs = 0;
  }

  // Per 4.2.1.2 Throw error if too many uuids are requested
  if (nsecs >= 10000) {
    throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
  }

  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq;

  // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
  msecs += 12219292800000;

  // `time_low`
  var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
  b[i++] = tl >>> 24 & 0xff;
  b[i++] = tl >>> 16 & 0xff;
  b[i++] = tl >>> 8 & 0xff;
  b[i++] = tl & 0xff;

  // `time_mid`
  var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
  b[i++] = tmh >>> 8 & 0xff;
  b[i++] = tmh & 0xff;

  // `time_high_and_version`
  b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
  b[i++] = tmh >>> 16 & 0xff;

  // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
  b[i++] = clockseq >>> 8 | 0x80;

  // `clock_seq_low`
  b[i++] = clockseq & 0xff;

  // `node`
  var node = options.node || _nodeId;
  for (var n = 0; n < 6; n++) {
    b[i + n] = node[n];
  }

  return buf ? buf : unparse(b);
}

// **`v4()` - Generate random UUID**

// See https://github.com/broofa/node-uuid for API details
function v4(options, buf, offset) {
  // Deprecated - 'format' argument, as supported in v1.2
  var i = buf && offset || 0;

  if (typeof(options) == 'string') {
    buf = options == 'binary' ? new Array(16) : null;
    options = null;
  }
  options = options || {};

  var rnds = options.random || (options.rng || _rng)();

  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
  rnds[6] = (rnds[6] & 0x0f) | 0x40;
  rnds[8] = (rnds[8] & 0x3f) | 0x80;

  // Copy bytes to buffer, if provided
  if (buf) {
    for (var ii = 0; ii < 16; ii++) {
      buf[i + ii] = rnds[ii];
    }
  }

  return buf || unparse(rnds);
}

// Export public API
var uuid = v4;
uuid.v1 = v1;
uuid.v4 = v4;
uuid.parse = parse;
uuid.unparse = unparse;

module.exports = uuid;

},{"./rng":5}],7:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Message = require('./message');
var Syncable = require('./syncable');
var Root = require('./root');

var Announcement = function (_Message) {
  _inherits(Announcement, _Message);

  function Announcement() {
    _classCallCheck(this, Announcement);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Announcement).apply(this, arguments));
  }

  _createClass(Announcement, [{
    key: 'send',
    value: function send() {}
  }, {
    key: 'getConversation',
    value: function getConversation() {}
  }, {
    key: '_loaded',
    value: function _loaded(data) {
      this.getClient()._addMessage(this);
    }

    /**
     * Creates a message from the server's representation of a message.
     *
     * Similar to _populateFromServer, however, this method takes a
     * message description and returns a new message instance using _populateFromServer
     * to setup the values.
     *
     * @method _createFromServer
     * @protected
     * @static
     * @param  {Object} message - Server's representation of the message
     * @param  {layer.Conversation} conversation - Conversation for the message
     * @return {layer.Message}
     */

  }], [{
    key: '_createFromServer',
    value: function _createFromServer(message, client) {
      var fromWebsocket = message.fromWebsocket;
      return new Announcement({
        fromServer: message,
        clientId: client.appId,
        _notify: fromWebsocket && message.is_unread
      });
    }
  }]);

  return Announcement;
}(Message);

Announcement.prefixUUID = 'layer:///announcements/';

Announcement.inObjectIgnore = Message.inObjectIgnore;

Announcement.bubbleEventParent = 'getClient';

Announcement._supportedEvents = [].concat(Message._supportedEvents);

Root.initClass.apply(Announcement, [Announcement, 'Announcement']);
Syncable.subclasses.push(Announcement);
module.exports = Announcement;

},{"./message":20,"./root":24,"./syncable":27}],8:[function(require,module,exports){
(function (global){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Layer Client.  Access the layer by calling create and receiving it
 * from the "ready" callback.

  var client = new layer.Client({
    appId: "layer:///apps/staging/ffffffff-ffff-ffff-ffff-ffffffffffff",
    isTrustedDevice: false,
    challenge: function(evt) {
      myAuthenticator({
        nonce: evt.nonce,
        onSuccess: evt.callback
      });
    },
    ready: function(client) {
      alert("Yay, I finally got my client!");
    }
  }).connect("sampleuserId");

 * The Layer Client/ClientAuthenticator classes have been divided into:
 *
 * 1. ClientAuthenticator: Manages all authentication and connectivity related issues
 * 2. Client: Manages access to Conversations, Queries, Messages, Events, etc...
 *
 * @class layer.ClientAuthenticator
 * @private
 * @extends layer.Root
 * @author Michael Kantor
 *
 */

var xhr = require('./xhr');
var Root = require('./root');
var SocketManager = require('./websockets/socket-manager');
var WebsocketChangeManager = require('./websockets/change-manager');
var WebsocketRequestManager = require('./websockets/request-manager');
var LayerError = require('./layer-error');
var OnlineManager = require('./online-state-manager');
var SyncManager = require('./sync-manager');
var DbManager = require('./db-manager');

var _require = require('./sync-event');

var XHRSyncEvent = _require.XHRSyncEvent;
var WebsocketSyncEvent = _require.WebsocketSyncEvent;

var _require2 = require('./const');

var ACCEPT = _require2.ACCEPT;
var LOCALSTORAGE_KEYS = _require2.LOCALSTORAGE_KEYS;

var atob = typeof window === 'undefined' ? require('atob') : window.atob;
var logger = require('./logger');

var MAX_XHR_RETRIES = 3;

var ClientAuthenticator = function (_Root) {
  _inherits(ClientAuthenticator, _Root);

  /**
   * Create a new Client.
   *
   * The appId is the only required parameter:
   *
   *      var client = new Client({
   *          appId: "layer:///apps/staging/uuid"
   *      });
   *
   * For trusted devices, you can enable storage of data to indexedDB and localStorage with the `isTrustedDevice` property:
   *
   *      var client = new Client({
   *          appId: "layer:///apps/staging/uuid",
   *          isTrustedDevice: true
   *      });
   *
   * @method constructor
   * @param  {Object} options
   * @param  {string} options.appId           - "layer:///apps/production/uuid"; Identifies what
   *                                            application we are connecting to.
   * @param  {string} [options.url=https://api.layer.com] - URL to log into a different REST server
   * @param {number} [options.logLevel=ERROR] - Provide a log level that is one of layer.Constants.LOG.NONE, layer.Constants.LOG.ERROR,
   *                                            layer.Constants.LOG.WARN, layer.Constants.LOG.INFO, layer.Constants.LOG.DEBUG
   * @param {boolean} [options.isTrustedDevice=false] - If this is not a trusted device, no data will be written to indexedDB nor localStorage,
   *                                            regardless of any values in layer.Client.persistenceFeatures.
   * @param {Object} [options.persistenceFeatures=] If layer.Client.isTrustedDevice is true, then this specifies what types of data to store.
   *                                            Want to insure credit card data is not written? Disable writing of Messages to indexedDB.
   *                                            Default is for all data to be stored.
   *                                            * identities: Write identities to indexedDB? This allows for faster initialization.
   *                                            * conversations: Write conversations to indexedDB? This allows for faster rendering
   *                                                             of a Conversation List
   *                                            * messages: Write messages to indexedDB? This allows for full offline access
   *                                            * syncQueue: Write requests made while offline to indexedDB?  This allows the app
   *                                                         to complete sending messages after being relaunched.
   *                                            * sessionToken: Write the session token to localStorage for quick reauthentication on relaunching the app.
   */

  function ClientAuthenticator(options) {
    _classCallCheck(this, ClientAuthenticator);

    // Validate required parameters
    if (!options.appId) throw new Error(LayerError.dictionary.appIdMissing);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(ClientAuthenticator).call(this, options));
  }

  /**
   * Initialize the subcomponents of the ClientAuthenticator
   *
   * @method _initComponents
   * @private
   */


  _createClass(ClientAuthenticator, [{
    key: '_initComponents',
    value: function _initComponents() {
      // Setup the websocket manager; won't connect until we trigger an authenticated event
      this.socketManager = new SocketManager({
        client: this
      });

      this.socketChangeManager = new WebsocketChangeManager({
        client: this,
        socketManager: this.socketManager
      });

      this.socketRequestManager = new WebsocketRequestManager({
        client: this,
        socketManager: this.socketManager
      });

      this.onlineManager = new OnlineManager({
        socketManager: this.socketManager,
        testUrl: this.url + '/nonces?connection-test',
        connected: this._handleOnlineChange.bind(this),
        disconnected: this._handleOnlineChange.bind(this)
      });

      this.syncManager = new SyncManager({
        onlineManager: this.onlineManager,
        socketManager: this.socketManager,
        requestManager: this.socketRequestManager,
        client: this
      });
    }

    /**
     * Destroy the subcomponents of the ClientAuthenticator
     *
     * @method _destroyComponents
     * @private
     */

  }, {
    key: '_destroyComponents',
    value: function _destroyComponents() {
      this.syncManager.destroy();
      this.onlineManager.destroy();
      this.socketManager.destroy();
      this.socketChangeManager.destroy();
      this.socketRequestManager.destroy();
      if (this.dbManager) this.dbManager.destroy();
    }

    /**
     * Is Persisted Session Tokens disabled?
     *
     * @method _isPersistedSessionsDisabled
     * @returns {Boolean}
     * @private
     */

  }, {
    key: '_isPersistedSessionsDisabled',
    value: function _isPersistedSessionsDisabled() {
      return !global.localStorage || this.persistenceFeatures && !this.persistenceFeatures.sessionToken;
    }

    /**
     * Restore the sessionToken from localStorage.
     *
     * This sets the sessionToken rather than returning the token.
     *
     * @method _restoreLastSession
     * @private
     */

  }, {
    key: '_restoreLastSession',
    value: function _restoreLastSession() {
      if (this._isPersistedSessionsDisabled()) return;
      try {
        var sessionData = global.localStorage[LOCALSTORAGE_KEYS.SESSIONDATA + this.appId];
        if (!sessionData) return;
        var parsedData = JSON.parse(sessionData);
        if (parsedData.expires < Date.now()) {
          global.localStorage.removeItem(LOCALSTORAGE_KEYS.SESSIONDATA + this.appId);
        } else {
          this.sessionToken = parsedData.sessionToken;
        }
      } catch (error) {
        // No-op
      }
    }

    /**
     * Has the userID changed since the last login?
     *
     * @method _hasUserIdChanged
     * @param {string} userId
     * @returns {boolean}
     * @private
     */

  }, {
    key: '_hasUserIdChanged',
    value: function _hasUserIdChanged(userId) {
      try {
        var sessionData = global.localStorage[LOCALSTORAGE_KEYS.SESSIONDATA + this.appId];
        if (!sessionData) return false;
        return JSON.parse(sessionData).userId !== userId;
      } catch (error) {
        return true;
      }
    }

    /**
     * Initiates the connection.
     *
     * Called by constructor().
     *
     * Will either attempt to validate the cached sessionToken by getting converations,
     * or if no sessionToken, will call /nonces to start process of getting a new one.
     *
     * @method connect
     * @param {string} userId - User ID of the user you are logging in as
     * @returns {layer.ClientAuthenticator} this
     */

  }, {
    key: 'connect',
    value: function connect(userId) {
      var _this2 = this;

      this.isConnected = false;
      if (!this.isTrustedDevice || !userId || this._isPersistedSessionsDisabled() || this._hasUserIdChanged(userId)) {
        this._clearStoredData();
      }
      if (this.isTrustedDevice && userId) {
        this._restoreLastSession(userId);
      }
      this.userId = userId;
      if (this.sessionToken) {
        this._sessionTokenRestored();
      } else {
        this.xhr({
          url: '/nonces',
          method: 'POST',
          sync: false
        }, function (result) {
          return _this2._connectionResponse(result);
        });
      }
      return this;
    }

    /**
     * Initiates the connection with a session token.
     *
     * This call is for use when you have received a Session Token from some other source; such as your server,
     * and wish to use that instead of doing a full auth process.
     *
     * The Client will presume the token to be valid, and will asynchronously trigger the `ready` event.
     * If the token provided is NOT valid, this won't be detected until a request is made using this token,
     * at which point the `challenge` method will trigger.
     *
     * NOTE: The `connected` event will not be triggered on this path.
     *
     * @method connectWithSession
     * @param {String} userId
     * @param {String} sessionToken
     * @returns {layer.ClientAuthenticator} this
     */

  }, {
    key: 'connectWithSession',
    value: function connectWithSession(userId, sessionToken) {
      var _this3 = this;

      if (!userId || !sessionToken) throw new Error(LayerError.dictionary.sessionAndUserRequired);
      if (!this.isTrustedDevice || this._isPersistedSessionsDisabled() || this._hasUserIdChanged(userId)) {
        this._clearStoredData();
      }
      this.onlineManager.start();

      this.userId = userId;
      this.isConnected = true;
      setTimeout(function () {
        return _this3._authComplete({ session_token: sessionToken });
      }, 1);
    }

    /**
     * Called when our request for a nonce gets a response.
     *
     * If there is an error, calls _connectionError.
     *
     * If there is nonce, calls _connectionComplete.
     *
     * @method _connectionResponse
     * @private
     * @param  {Object} result
     */

  }, {
    key: '_connectionResponse',
    value: function _connectionResponse(result) {
      if (!result.success) {
        this._connectionError(result.data);
      } else {
        this._connectionComplete(result.data);
      }
    }

    /**
     * We are now connected (we have a nonce).
     *
     * If we have successfully retrieved a nonce, then
     * we have entered a "connected" but not "authenticated" state.
     * Set the state, trigger any events, and then start authentication.
     *
     * @method _connectionComplete
     * @private
     * @param  {Object} result
     * @param  {string} result.nonce - The nonce provided by the server
     *
     * @fires connected
     */

  }, {
    key: '_connectionComplete',
    value: function _connectionComplete(result) {
      this.isConnected = true;
      this.trigger('connected');
      this._authenticate(result.nonce);
    }

    /**
     * Called when we fail to get a nonce.
     *
     * @method _connectionError
     * @private
     * @param  {layer.LayerError} err
     *
     * @fires connected-error
     */

  }, {
    key: '_connectionError',
    value: function _connectionError(error) {
      this.trigger('connected-error', { error: error });
    }

    /* CONNECT METHODS END */

    /* AUTHENTICATE METHODS BEGIN */

    /**
     * Start the authentication step.
     *
     * We start authentication by triggering a "challenge" event that
     * tells the app to use the nonce to obtain an identity_token.
     *
     * @method _authenticate
     * @private
     * @param  {string} nonce - The nonce to provide your identity provider service
     *
     * @fires challenge
     */

  }, {
    key: '_authenticate',
    value: function _authenticate(nonce) {
      if (nonce) {
        this.trigger('challenge', {
          nonce: nonce,
          callback: this.answerAuthenticationChallenge.bind(this)
        });
      }
    }

    /**
     * Accept an identityToken and use it to create a session.
     *
     * Typically, this method is called using the function pointer provided by
     * the challenge event, but it can also be called directly.
     *
     *      getIdentityToken(nonce, function(identityToken) {
     *          client.answerAuthenticationChallenge(identityToken);
     *      });
     *
     * @method answerAuthenticationChallenge
     * @param  {string} identityToken - Identity token provided by your identity provider service
     */

  }, {
    key: 'answerAuthenticationChallenge',
    value: function answerAuthenticationChallenge(identityToken) {
      var _this4 = this;

      // Report an error if no identityToken provided
      if (!identityToken) {
        throw new Error(LayerError.dictionary.identityTokenMissing);
      } else {
        // Store the UserId and get a sessionToken; bypass the __adjustUserId connected test
        this.userId = JSON.parse(atob(identityToken.split('.')[1])).prn;
        this.xhr({
          url: '/sessions',
          method: 'POST',
          sync: false,
          data: {
            identity_token: identityToken,
            app_id: this.appId
          }
        }, function (result) {
          return _this4._authResponse(result, identityToken);
        });
      }
    }

    /**
     * Called when our request for a sessionToken receives a response.
     *
     * @private
     * @method _authResponse
     * @param  {Object} result
     * @param  {string} identityToken
     */

  }, {
    key: '_authResponse',
    value: function _authResponse(result, identityToken) {
      if (!result.success) {
        this._authError(result.data, identityToken);
      } else {
        this._authComplete(result.data);
      }
    }

    /**
     * Authentication is completed, update state and trigger events.
     *
     * @method _authComplete
     * @private
     * @param  {Object} result
     * @param  {string} result.session_token - Session token received from the server
     *
     * @fires authenticated
     */

  }, {
    key: '_authComplete',
    value: function _authComplete(result) {
      if (!result || !result.session_token) {
        throw new Error(LayerError.dictionary.sessionTokenMissing);
      }
      this.sessionToken = result.session_token;

      // NOTE: We store both items of data in a single key because someone listening for storage
      // events is listening for an asynchronous change, and we need to gaurentee that both
      // userId and session are available.
      if (!this._isPersistedSessionsDisabled()) {
        try {
          global.localStorage[LOCALSTORAGE_KEYS.SESSIONDATA + this.appId] = JSON.stringify({
            sessionToken: this.sessionToken || '',
            userId: this.userId || '',
            expires: Date.now() + 30 * 60 * 60 * 24
          });
        } catch (e) {
          // Do nothing
        }
      }

      this.isAuthenticated = true;
      this.trigger('authenticated');
      this._clientReady();
    }

    /**
     * Authentication has failed.
     *
     * @method _authError
     * @private
     * @param  {layer.LayerError} result
     * @param  {string} identityToken Not currently used
     *
     * @fires authenticated-error
     */

  }, {
    key: '_authError',
    value: function _authError(error, identityToken) {
      this.trigger('authenticated-error', { error: error });
    }

    /**
     * Sets state and triggers events for both connected and authenticated.
     *
     * If reusing a sessionToken cached in localStorage,
     * use this method rather than _authComplete.
     *
     * @method _sessionTokenRestored
     * @private
     *
     * @fires connected, authenticated
     */

  }, {
    key: '_sessionTokenRestored',
    value: function _sessionTokenRestored() {
      this.isConnected = true;
      this.trigger('connected');
      this.onlineManager.start();
      this.isAuthenticated = true;
      this.trigger('authenticated');
      this._clientReady();
    }

    /**
     * Called to flag the client as ready for action.
     *
     * This method is called after authenication AND
     * after initial conversations have been loaded.
     *
     * @method _clientReady
     * @private
     * @fires ready
     */

  }, {
    key: '_clientReady',
    value: function _clientReady() {
      if (!this.persistenceFeatures || !this.isTrustedDevice) {
        this.persistenceFeatures = {
          identity: this.isTrustedDevice,
          conversations: this.isTrustedDevice,
          messages: this.isTrustedDevice,
          syncQueue: this.isTrustedDevice,
          sessionToken: this.isTrustedDevice
        };
      }
      if (!this.dbManager) {
        this.dbManager = new DbManager({
          client: this,
          tables: this.persistenceFeatures
        });
      }

      if (!this.isReady) {
        this.isReady = true;
        this.trigger('ready');
        this.onlineManager.start();
      }
    }

    /* CONNECT METHODS END */

    /* START SESSION MANAGEMENT METHODS */

    /**
     * Deletes your sessionToken from the server, and removes all user data from the Client.
     * Call `client.login()` to restart the authentication process.
     *
     * @method logout
     * @return {layer.ClientAuthenticator} this
     */

  }, {
    key: 'logout',
    value: function logout() {
      if (this.isAuthenticated) {
        this.xhr({
          method: 'DELETE',
          url: '/sessions/' + escape(this.sessionToken)
        });
      }

      // Clear data even if isAuthenticated is false
      // Session may have expired, but data still cached.
      this._resetSession();
      this._clearStoredData();
      return this;
    }
  }, {
    key: '_clearStoredData',
    value: function _clearStoredData() {
      if (this.dbManager) this.dbManager.deleteTables();
      if (global.localStorage) localStorage.removeItem(LOCALSTORAGE_KEYS.SESSIONDATA + this.appId);
    }

    /**
     * Log out/clear session information.
     *
     * Use this to clear the sessionToken and all information from this session.
     *
     * @method _resetSession
     * @private
     * @returns {layer.ClientAuthenticator} this
     */

  }, {
    key: '_resetSession',
    value: function _resetSession() {
      this.isReady = false;
      if (this.sessionToken) {
        this.sessionToken = '';
        if (global.localStorage) {
          localStorage.removeItem(LOCALSTORAGE_KEYS.SESSIONDATA + this.appId);
        }
      }

      this.isConnected = false;
      this.isAuthenticated = false;

      this.trigger('deauthenticated');
      this.onlineManager.stop();
    }

    /**
     * Register your IOS device to receive notifications.
     * For use with native code only (Cordova, React Native, Titanium, etc...)
     *
     * @method registerIOSPushToken
     * @param {Object} options
     * @param {string} options.deviceId - Your IOS device's device ID
     * @param {string} options.iosVersion - Your IOS device's version number
     * @param {string} options.token - Your Apple APNS Token
     * @param {string} [options.bundleId] - Your Apple APNS Bundle ID ("com.layer.bundleid")
     * @param {Function} [callback=null] - Optional callback
     * @param {layer.LayerError} callback.error - LayerError if there was an error; null if successful
     */

  }, {
    key: 'registerIOSPushToken',
    value: function registerIOSPushToken(options, callback) {
      this.xhr({
        url: 'push_tokens',
        method: 'POST',
        sync: false,
        data: {
          token: options.token,
          type: 'apns',
          device_id: options.deviceId,
          ios_version: options.iosVersion,
          apns_bundle_id: options.bundleId
        }
      }, function (result) {
        return callback(result.data);
      });
    }

    /**
     * Register your Android device to receive notifications.
     * For use with native code only (Cordova, React Native, Titanium, etc...)
     *
     * @method registerAndroidPushToken
     * @param {Object} options
     * @param {string} options.deviceId - Your IOS device's device ID
     * @param {string} options.token - Your GCM push Token
     * @param {string} options.senderId - Your GCM Sender ID/Project Number
     * @param {Function} [callback=null] - Optional callback
     * @param {layer.LayerError} callback.error - LayerError if there was an error; null if successful
     */

  }, {
    key: 'registerAndroidPushToken',
    value: function registerAndroidPushToken(options, callback) {
      this.xhr({
        url: 'push_tokens',
        method: 'POST',
        sync: false,
        data: {
          token: options.token,
          type: 'gcm',
          device_id: options.deviceId,
          gcm_sender_id: options.senderId
        }
      }, function (result) {
        return callback(result.data);
      });
    }

    /**
     * Register your Android device to receive notifications.
     * For use with native code only (Cordova, React Native, Titanium, etc...)
     *
     * @method unregisterPushToken
     * @param {string} deviceId - Your IOS device's device ID
     * @param {Function} [callback=null] - Optional callback
     * @param {layer.LayerError} callback.error - LayerError if there was an error; null if successful
     */

  }, {
    key: 'unregisterPushToken',
    value: function unregisterPushToken(deviceId, callback) {
      this.xhr({
        url: 'push_tokens/' + deviceId,
        method: 'DELETE'
      }, function (result) {
        return callback(result.data);
      });
    }

    /* SESSION MANAGEMENT METHODS END */

    /* ACCESSOR METHODS BEGIN */

    /**
     * __ Methods are automatically called by property setters.
     *
     * Any attempt to execute `this.userAppId = 'xxx'` will cause an error to be thrown
     * if the client is already connected.
     *
     * @private
     * @method __adjustAppId
     * @param {string} value - New appId value
     */

  }, {
    key: '__adjustAppId',
    value: function __adjustAppId() {
      if (this.isConnected) throw new Error(LayerError.dictionary.cantChangeIfConnected);
    }

    /**
     * __ Methods are automatically called by property setters.
     *
     * Any attempt to execute `this.userId = 'xxx'` will cause an error to be thrown
     * if the client is already connected... unless setting it from scratch, or to the same value.
     *
     * @private
     * @method __adjustUserId
     * @param {string} value - New appId value
     */

  }, {
    key: '__adjustUserId',
    value: function __adjustUserId(userId) {
      if (this.isConnected && this.userId && this.userId !== userId || this.isAuthenticated) {
        throw new Error(LayerError.dictionary.cantChangeIfConnected);
      }
    }

    /* ACCESSOR METHODS END */

    /* COMMUNICATIONS METHODS BEGIN */

  }, {
    key: 'sendSocketRequest',
    value: function sendSocketRequest(params, callback) {
      if (params.sync) {
        var target = params.sync.target;
        var depends = params.sync.depends;
        if (target && !depends) depends = [target];

        this.syncManager.request(new WebsocketSyncEvent({
          data: params.body,
          operation: params.method,
          target: target,
          depends: depends,
          callback: callback
        }));
      } else {
        if (typeof params.data === 'function') params.data = params.data();
        this.socketRequestManager.sendRequest(params, callback);
      }
    }

    /**
     * This event handler receives events from the Online State Manager and generates an event for those subscribed
     * to client.on('online')
     *
     * @method _handleOnlineChange
     * @private
     * @param {layer.LayerEvent} evt
     */

  }, {
    key: '_handleOnlineChange',
    value: function _handleOnlineChange(evt) {
      if (!this.isAuthenticated) return;
      var duration = evt.offlineDuration;
      var isOnline = evt.eventName === 'connected';
      var obj = { isOnline: isOnline };
      if (isOnline) {
        obj.reset = duration > ClientAuthenticator.ResetAfterOfflineDuration;
      }
      this.trigger('online', obj);
    }

    /**
     * Main entry point for sending xhr requests or for queing them in the syncManager.
     *
     * This call adjust arguments for our REST server.
     *
     * @method xhr
     * @protected
     * @param  {Object}   options
     * @param  {string}   options.url - URL relative client's url: "/conversations"
     * @param  {Function} callback
     * @param  {Object}   callback.result
     * @param  {Mixed}    callback.result.data - If an error occurred, this is a layer.LayerError;
     *                                          If the response was application/json, this will be an object
     *                                          If the response was text/empty, this will be text/empty
     * @param  {XMLHttpRequest} callback.result.xhr - Native xhr request object for detailed analysis
     * @param  {Object}         callback.result.Links - Hash of Link headers
     * @return {layer.ClientAuthenticator} this
     */

  }, {
    key: 'xhr',
    value: function xhr(options, callback) {
      if (!options.sync || !options.sync.target) {
        options.url = this._xhrFixRelativeUrls(options.url || '');
      }

      options.withCredentials = true;
      if (!options.method) options.method = 'GET';
      if (!options.headers) options.headers = {};
      this._xhrFixHeaders(options.headers);
      this._xhrFixAuth(options.headers);

      // Note: this is not sync vs async; this is syncManager vs fire it now
      if (options.sync === false) {
        this._nonsyncXhr(options, callback, 0);
      } else {
        this._syncXhr(options, callback);
      }
      return this;
    }
  }, {
    key: '_syncXhr',
    value: function _syncXhr(options, callback) {
      var _this5 = this;

      if (!options.sync) options.sync = {};
      var innerCallback = function innerCallback(result) {
        _this5._xhrResult(result, callback);
      };
      var target = options.sync.target;
      var depends = options.sync.depends;
      if (target && !depends) depends = [target];

      this.syncManager.request(new XHRSyncEvent({
        url: options.url,
        data: options.data,
        method: options.method,
        operation: options.sync.operation || options.method,
        headers: options.headers,
        callback: innerCallback,
        target: target,
        depends: depends
      }));
    }

    /**
     * For xhr calls that don't go through the sync manager,
     * fire the request, and if it fails, refire it up to 3 tries
     * before reporting an error.  1 second delay between requests
     * so whatever issue is occuring is a tiny bit more likely to resolve,
     * and so we don't hammer the server every time there's a problem.
     *
     * @method _nonsyncXhr
     * @param  {Object}   options
     * @param  {Function} callback
     * @param  {number}   retryCount
     */

  }, {
    key: '_nonsyncXhr',
    value: function _nonsyncXhr(options, callback, retryCount) {
      var _this6 = this;

      xhr(options, function (result) {
        if ([502, 503, 504].indexOf(result.status) !== -1 && retryCount < MAX_XHR_RETRIES) {
          setTimeout(function () {
            return _this6._nonsyncXhr(options, callback, retryCount + 1);
          }, 1000);
        } else {
          _this6._xhrResult(result, callback);
        }
      });
    }

    /**
     * Fix authentication header for an xhr request
     *
     * @method _xhrFixAuth
     * @private
     * @param  {Object} headers
     */

  }, {
    key: '_xhrFixAuth',
    value: function _xhrFixAuth(headers) {
      if (this.sessionToken && !headers.Authorization) {
        headers.authorization = 'Layer session-token="' + this.sessionToken + '"'; // eslint-disable-line
      }
    }

    /**
     * Fix relative URLs to create absolute URLs needed for CORS requests.
     *
     * @method _xhrFixRelativeUrls
     * @private
     * @param  {string} relative or absolute url
     * @return {string} absolute url
     */

  }, {
    key: '_xhrFixRelativeUrls',
    value: function _xhrFixRelativeUrls(url) {
      var result = url;
      if (url.indexOf('https://') === -1) {
        if (url[0] === '/') {
          result = this.url + url;
        } else {
          result = this.url + '/' + url;
        }
      }
      return result;
    }

    /**
     * Fixup all headers in preparation for an xhr call.
     *
     * 1. All headers use lower case names for standard/easy lookup
     * 2. Set the accept header
     * 3. If needed, set the content-type header
     *
     * @method _xhrFixHeaders
     * @private
     * @param  {Object} headers
     */

  }, {
    key: '_xhrFixHeaders',
    value: function _xhrFixHeaders(headers) {
      // Replace all headers in arbitrary case with all lower case
      // for easy matching.
      var headerNameList = Object.keys(headers);
      headerNameList.forEach(function (headerName) {
        if (headerName !== headerName.toLowerCase()) {
          headers[headerName.toLowerCase()] = headers[headerName];
          delete headers[headerName];
        }
      });

      if (!headers.accept) headers.accept = ACCEPT;

      if (!headers['content-type']) headers['content-type'] = 'application/json';
    }

    /**
     * Handle the result of an xhr call
     *
     * @method _xhrResult
     * @private
     * @param  {Object}   result     Standard xhr response object from the xhr lib
     * @param  {Function} [callback] Callback on completion
     */

  }, {
    key: '_xhrResult',
    value: function _xhrResult(result, callback) {
      if (this.isDestroyed) return;

      if (!result.success) {
        // Replace the response with a LayerError instance
        if (result.data && _typeof(result.data) === 'object') {
          this._generateError(result);
        }

        // If its an authentication error, reauthenticate
        // don't call _resetSession as that wipes all data and screws with UIs, and the user
        // is still authenticated on the customer's app even if not on Layer.
        if (result.status === 401 && this.isAuthenticated) {
          logger.warn('SESSION EXPIRED!');
          this.isAuthenticated = false;
          this.trigger('deauthenticated');
          this._authenticate(result.data.getNonce());
        }
      }
      if (callback) callback(result);
    }

    /**
     * Transforms xhr error response into a layer.LayerError instance.
     *
     * Adds additional information to the result object including
     *
     * * url
     * * data
     *
     * @method _generateError
     * @private
     * @param  {Object} result - Result of the xhr call
     */

  }, {
    key: '_generateError',
    value: function _generateError(result) {
      result.data = new LayerError(result.data);
      if (!result.data.httpStatus) result.data.httpStatus = result.status;
      result.data.log();
    }

    /* END COMMUNICATIONS METHODS */

  }]);

  return ClientAuthenticator;
}(Root);

/**
 * State variable; indicates that client is currently authenticated by the server.
 * Should never be true if isConnected is false.
 * @type {Boolean}
 */


ClientAuthenticator.prototype.isAuthenticated = false;

/**
 * State variable; indicates that client is currently connected to server
 * (may not be authenticated yet)
 * @type {Boolean}
 */
ClientAuthenticator.prototype.isConnected = false;

/**
 * State variable; indicates that client is ready for the app to use.
 * Use the 'ready' event to be notified when this value changes to true.
 *
 * @type {boolean}
 */
ClientAuthenticator.prototype.isReady = false;

/**
 * Your Layer Application ID. This value can not be changed once connected.
 * To find your Layer Application ID, see your Layer Developer Dashboard.
 * @type {String}
 */
ClientAuthenticator.prototype.appId = '';

/**
 * You can use this to find the userId you are logged in as.
 * You can set this in the constructor to verify that the client
 * will only restore a session if that session belonged to that same userId.
 * @type {String}
 */
ClientAuthenticator.prototype.userId = '';

/**
 * Your current session token that authenticates your requests.
 * @type {String}
 */
ClientAuthenticator.prototype.sessionToken = '';

/**
 * URL to Layer's Web API server.
 * @type {String}
 */
ClientAuthenticator.prototype.url = 'https://api.layer.com';

/**
 * Web Socket Manager
 * @type {layer.Websockets.SocketManager}
 */
ClientAuthenticator.prototype.socketManager = null;

/**
 * Web Socket Request Manager
* @type {layer.Websockets.RequestManager}
 */
ClientAuthenticator.prototype.socketRequestManager = null;

/**
 * Web Socket Manager
 * @type {layer.Websockets.ChangeManager}
 */
ClientAuthenticator.prototype.socketChangeManager = null;

/**
 * Service for managing online as well as offline server requests
 * @type {layer.SyncManager}
 */
ClientAuthenticator.prototype.syncManager = null;

/**
 * Service for managing online/offline state and events
 * @type {layer.OnlineStateManager}
 */
ClientAuthenticator.prototype.onlineManager = null;

/**
 * If this is a trusted device, then we can write personal data to persistent memory.
 * @type {boolean}
 */
ClientAuthenticator.prototype.isTrustedDevice = false;

/**
 * If this layer.Client.isTrustedDevice is true, then you can control which types of data are persisted.
 *
 * Properties of this Object can be:
 *
 * * identities: Write identities to indexedDB? This allows for faster initialization.
 * * conversations: Write conversations to indexedDB? This allows for faster rendering
 *                  of a Conversation List
 * * messages: Write messages to indexedDB? This allows for full offline access
 * * syncQueue: Write requests made while offline to indexedDB?  This allows the app
 *              to complete sending messages after being relaunched.
 * * sessionToken: Write the session token to localStorage for quick reauthentication on relaunching the app.
 *
 *      new layer.Client({
 *        isTrustedDevice: true,
 *        persistenceFeatures: {
 *          conversations: true,
 *          identities: true,
 *          messages: false,
 *          syncQueue: false,
 *          sessionToken: true
 *        }
 *      });
 *
 * @type {object}
 */
ClientAuthenticator.prototype.persistenceFeatures = null;

/**
 * Database Manager for read/write to IndexedDB
 * @type {layer.DbManager}
 */
ClientAuthenticator.prototype.dbManager = null;

/**
 * Unique identifier for the client.
 *
 * This ID is used to differentiate this instance with instances that may run in other tabs of the browser.
 */
ClientAuthenticator.prototype.id = '';

/**
 * Is true if the client is authenticated and connected to the server;
 *
 * Typically used to determine if there is a connection to the server.
 *
 * Typically used in conjunction with the `online` event.
 *
 * @type {boolean}
 */
Object.defineProperty(ClientAuthenticator.prototype, 'isOnline', {
  enumerable: true,
  get: function get() {
    return this.onlineManager && this.onlineManager.isOnline;
  }
});

/**
 * Log levels; one of:
 *
 *    * layer.Constants.LOG.NONE
 *    * layer.Constants.LOG.ERROR
 *    * layer.Constants.LOG.WARN
 *    * layer.Constants.LOG.INFO
 *    * layer.Constants.LOG.DEBUG
 *
 * @type {number}
 */
Object.defineProperty(ClientAuthenticator.prototype, 'logLevel', {
  enumerable: false,
  get: function get() {
    return logger.level;
  },
  set: function set(value) {
    logger.level = value;
  }
});

/**
 * Time to be offline after which we don't do a WebSocket Events.replay,
 * but instead just refresh all our Query data.  Defaults to 30 hours.
 *
 * @type {number}
 * @static
 */
ClientAuthenticator.ResetAfterOfflineDuration = 1000 * 60 * 60 * 30;

/**
 * List of events supported by this class
 * @static
 * @protected
 * @type {string[]}
 */
ClientAuthenticator._supportedEvents = [
/**
 * The client is ready for action
 *
 *      client.on('ready', function(evt) {
 *          renderMyUI();
 *      });
 *
 * @event
 */
'ready',

/**
 * Fired when connected to the server.
 * Currently just means we have a nonce.
 * Not recommended for typical applications.
 * @event connected
 */
'connected',

/**
 * Fired when unsuccessful in obtaining a nonce
 * Not recommended for typical applications.
 * @event connected-error
 * @param {Object} event
 * @param {layer.LayerError} event.error
 */
'connected-error',

/**
 * We now have a session and any requests we send aught to work.
 * Typically you should use the ready event instead of the authenticated event.
 * @event authenticated
 */
'authenticated',

/**
 * Failed to authenticate your client.
 *
 * Either your identity-token was invalid, or something went wrong
 * using your identity-token.
 *
 * @event authenticated-error
 * @param {Object} event
 * @param {layer.LayerError} event.error
 */
'authenticated-error',

/**
 * This event fires when a session has expired or when `layer.Client.logout` is called.
 * Typically, it is enough to subscribe to the challenge event
 * which will let you reauthenticate; typical applications do not need
 * to subscribe to this.
 *
 * @event deauthenticated
 */
'deauthenticated',

/**
 * @event challenge
 * Verify the user's identity.
 *
 * This event is where you verify that the user is who we all think the user is,
 * and provide an identity token to validate that.
 *
 * @param {Object} event
 * @param {string} event.nonce - A nonce for you to provide to your identity provider
 * @param {Function} event.callback - Call this once you have an identity-token
 * @param {string} event.callback.identityToken - Identity token provided by your identity provider service
 */
'challenge',

/**
 * @event session-terminated
 * If your session has been terminated in such a way as to prevent automatic reconnect,
 *
 * this event will fire.  Common scenario: user has two tabs open;
 * one tab the user logs out (or you call client.logout()).
 * The other tab will detect that the sessionToken has been removed,
 * and will terminate its session as well.  In this scenario we do not want
 * to automatically trigger a challenge and restart the login process.
 */
'session-terminated',

/**
 * @event online
 *
 * This event is used to detect when the client is online (connected to the server)
 * or offline (still able to accept API calls but no longer able to sync to the server).
 *
 *      client.on('online', function(evt) {
 *         if (evt.isOnline) {
 *             statusDiv.style.backgroundColor = 'green';
 *         } else {
 *             statusDiv.style.backgroundColor = 'red';
 *         }
 *      });
 *
 * @param {Object} event
 * @param {boolean} event.isOnline
 */
'online'].concat(Root._supportedEvents);

Root.initClass.apply(ClientAuthenticator, [ClientAuthenticator, 'ClientAuthenticator']);

module.exports = ClientAuthenticator;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./const":12,"./db-manager":15,"./layer-error":16,"./logger":18,"./online-state-manager":21,"./root":24,"./sync-event":25,"./sync-manager":26,"./websockets/change-manager":33,"./websockets/request-manager":34,"./websockets/socket-manager":35,"./xhr":36,"atob":3}],9:[function(require,module,exports){
"use strict";

/**
 * Allows all components to have a clientId instead of a client pointer.
 * Allows an app to have multiple Clients, each with its own appId.
 * Provides a global utility that can be required by all modules for accessing
 * the client.
 *
 * @class  layer.ClientRegistry
 * @private
 */

var registry = {};

/**
 * Register a new Client; will destroy any previous client with the same appId.
 *
 * @method register
 * @param  {layer.Client} client
 */
function register(client) {
  var appId = client.appId;
  if (registry[appId] && !registry[appId].isDestroyed) {
    registry[appId].destroy();
  }
  registry[appId] = client;
}

/**
 * Removes a Client.
 *
 * @method unregister
 * @param  {layer.Client} client
 */
function unregister(client) {
  if (registry[client.appId]) delete registry[client.appId];
}

/**
 * Get a Client by appId
 *
 * @method get
 * @param  {string} appId
 * @return {layer.Client}
 */
function get(appId) {
  return registry[appId];
}

function getAll() {
  return Object.keys(registry).map(function (key) {
    return registry[key];
  });
}

module.exports = {
  get: get,
  getAll: getAll,
  register: register,
  unregister: unregister
};

},{}],10:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

/**
 * Utility methods
 *
 * @class layer.ClientUtils
 */

var LayerParser = require('layer-patch');
var uuid = require('uuid');

/**
 * Generate a random UUID
 *
 * @method
 * @return {string}
 */
exports.generateUUID = uuid.v4;

/**
 * Returns the 'type' portion of a Layer ID.
 *
 *         switch(Utils.typeFromID(id)) {
 *             case 'conversations':
 *                 ...
 *             case 'message':
 *                 ...
 *             case: 'queries':
 *                 ...
 *         }
 *
 * Does not currently handle Layer App IDs.
 *
 * @method
 * @param  {string} id
 * @return {string}
 */
exports.typeFromID = function (id) {
  var matches = id.match(/layer\:\/\/\/(.*?)\//);
  return matches ? matches[1] : '';
};

exports.isEmpty = function (obj) {
  return Object.prototype.toString.apply(obj) === '[object Object]' && Object.keys(obj).length === 0;
};

/**
 * Simplified sort method.
 *
 * Provides a function to return the value to compare rather than do the comparison.
 *
 *      sortBy([{v: 3}, {v: 1}, v: 33}], function(value) {
 *          return value.v;
 *      }, false);
 *
 * @method
 * @param  {Mixed[]}   inArray      Array to sort
 * @param  {Function} fn            Function that will return a value to compare
 * @param  {Function} fn.value      Current value from inArray we are comparing, and from which a value should be extracted
 * @param  {boolean}  [reverse=false] Sort ascending (false) or descending (true)
 */
exports.sortBy = function (inArray, fn, reverse) {
  reverse = reverse ? -1 : 1;
  inArray.sort(function (valueA, valueB) {
    var aa = fn(valueA);
    var bb = fn(valueB);
    if (aa === undefined && bb === undefined) return 0;
    if (aa === undefined && bb !== undefined) return 1;
    if (aa !== undefined && bb === undefined) return -1;
    if (aa > bb) return 1 * reverse;
    if (aa < bb) return -1 * reverse;
    return 0;
  });
};

/**
 * Quick and easy clone method.
 *
 * Does not work on circular references; should not be used
 * on objects with event listeners.
 *
 *      var newObj = Utils.clone(oldObj);
 *
 * @method
 * @param  {Object}     Object to clone
 * @return {Object}     New Object
 */
exports.clone = function (obj) {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Execute this function asynchronously.
 *
 * Defer will use SOME technique to delay execution of your function.
 * Defer() is intended for anything that should be processed after current execution has
 * completed, even if that means 0ms delay.
 *
 *      defer(function() {alert('That wasn't very long now was it!');});
 *
 * TODO: WEB-842: Add a postMessage handler.
 *
 * @method
 * @param  {Function} f
 */
exports.defer = function (func) {
  return setTimeout(func, 0);
};

/**
 * Returns a delay in seconds needed to follow an exponential
 * backoff pattern of delays for retrying a connection.
 *
 * Algorithm has two motivations:
 *
 * 1. Retry with increasingly long intervals up to some maximum interval
 * 2. Randomize the retry interval enough so that a thousand clients
 * all following the same algorithm at the same time will not hit the
 * server at the exact same times.
 *
 * The following are results before jitter for some values of counter:

      0: 0.1
      1: 0.2
      2: 0.4
      3: 0.8
      4: 1.6
      5: 3.2
      6: 6.4
      7: 12.8
      8: 25.6
      9: 51.2
      10: 102.4
      11. 204.8
      12. 409.6
      13. 819.2
      14. 1638.4 (27 minutes)

 * @method getExponentialBackoffSeconds
 * @param  {number} maxSeconds - This is not the maximum seconds delay, but rather
 * the maximum seconds delay BEFORE adding a randomized value.
 * @param  {number} counter - Current counter to use for calculating the delay; should be incremented up to some reasonable maximum value for each use.
 * @return {number}     Delay in seconds/fractions of a second
 */
exports.getExponentialBackoffSeconds = function getExponentialBackoffSeconds(maxSeconds, counter) {
  var secondsWaitTime = Math.pow(2, counter) / 10,
      secondsOffset = Math.random(); // value between 0-1 seconds.
  if (counter < 2) secondsOffset = secondsOffset / 4; // values less than 0.2 should be offset by 0-0.25 seconds
  else if (counter < 6) secondsOffset = secondsOffset / 2; // values between 0.2 and 1.0 should be offset by 0-0.5 seconds

  if (secondsWaitTime >= maxSeconds) secondsWaitTime = maxSeconds;

  return secondsWaitTime + secondsOffset;
};

var parser = undefined;

/**
 * Creates a LayerParser
 *
 * @method
 * @private
 * @param {Object} request - see layer.ClientUtils.layerParse
 */
function createParser(request) {
  request.client.once('destroy', function () {
    return parser = null;
  });

  parser = new LayerParser({
    camelCase: true,
    getObjectCallback: function getObjectCallback(id) {
      return request.client._getObject(id);
    },
    propertyNameMap: {
      Conversation: {
        unreadMessageCount: 'unreadCount'
      }
    },
    changeCallbacks: {
      Message: {
        all: function all(updateObject, newValue, oldValue, paths) {
          updateObject._handlePatchEvent(newValue, oldValue, paths);
        }
      },
      Conversation: {
        all: function all(updateObject, newValue, oldValue, paths) {
          updateObject._handlePatchEvent(newValue, oldValue, paths);
        }
      }
    }
  });
}

/**
 * Run the Layer Parser on the request.
 *
 * Parameters here
 * are the parameters specied in [Layer-Patch](https://github.com/layerhq/node-layer-patch), plus
 * a client object.
 *
 *      Util.layerParse({
 *          object: conversation,
 *          type: 'Conversation',
 *          operations: layerPatchOperations,
 *          client: client
 *      });
 *
 * @method
 * @param {Object} request - layer-patch parameters
 * @param {Object} request.object - Object being updated  by the operations
 * @param {string} request.type - Type of object being updated
 * @param {Object[]} request.operations - Array of change operations to perform upon the object
 * @param {layer.Client} request.client
 */
exports.layerParse = function (request) {
  if (!parser) createParser(request);
  parser.parse(request);
};

/**
 * Object comparison.
 *
 * Does a recursive traversal of two objects verifying that they are the same.
 * Is able to make metadata-restricted assumptions such as that
 * all values are either plain Objects or strings.
 *
 *      if (Utils.doesObjectMatch(conv1.metadata, conv2.metadata)) {
 *          alert('These two metadata objects are the same');
 *      }
 *
 * @method
 * @param  {Object} requestedData
 * @param  {Object} actualData
 * @return {boolean}
 */
exports.doesObjectMatch = function (requestedData, actualData) {
  if (!requestedData && actualData || requestedData && !actualData) return false;
  var requestedKeys = Object.keys(requestedData).sort();
  var actualKeys = Object.keys(actualData).sort();

  // If there are a different number of keys, fail.
  if (requestedKeys.length !== actualKeys.length) return false;

  // Compare key name and value at each index
  for (var index = 0; index < requestedKeys.length; index++) {
    var k1 = requestedKeys[index];
    var k2 = actualKeys[index];
    var v1 = requestedData[k1];
    var v2 = actualData[k2];
    if (k1 !== k2) return false;
    if (v1 && (typeof v1 === 'undefined' ? 'undefined' : _typeof(v1)) === 'object') {
      // Array comparison is not used by the Web SDK at this time.
      if (Array.isArray(v1)) {
        throw new Error('Array comparison not handled yet');
      } else if (!exports.doesObjectMatch(v1, v2)) {
        return false;
      }
    } else if (v1 !== v2) {
      return false;
    }
  }
  return true;
};

/**
 * Simple array inclusion test
 * @method includes
 * @param {Mixed[]} items
 * @param {Mixed} value
 * @returns {boolean}
 */
exports.includes = function (items, value) {
  return items.indexOf(value) !== -1;
};

},{"layer-patch":4,"uuid":6}],11:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * The Layer Client; this is the top level component for any Layer based application.

    var client = new layer.Client({
      appId: 'layer:///apps/staging/ffffffff-ffff-ffff-ffff-ffffffffffff',
      userId: 'Fred',
      challenge: function(evt) {
        myAuthenticator({
          nonce: evt.nonce,
          onSuccess: evt.callback
        });
      },
      ready: function(client) {
        alert('I am Client; Server: Serve me!');
      }
    });
 *
 * You can also initialize this as

    var client = new layer.Client({
      appId: 'layer:///apps/staging/ffffffff-ffff-ffff-ffff-ffffffffffff',
      userId: 'Fred'
    });

    client.on('challenge', function(evt) {
      myAuthenticator({
        nonce: evt.nonce,
        onSuccess: evt.callback
      });
    });

    client.on('ready', function(client) {
      alert('I am Client; Server: Serve me!');
    });
 *
 * ## API Synopsis:
 *
 * The following Properties, Methods and Events are the most commonly used ones.  See the full API below
 * for the rest of the API.
 *
 * ### Properties:
 *
 * * layer.Client.userId: User ID of the authenticated user
 * * layer.Client.appId: The ID for your application
 *
 *
 * ### Methods:
 *
 * * layer.Client.createConversation(): Create a new layer.Conversation.
 * * layer.Client.createQuery(): Create a new layer.Query.
 * * layer.Client.getMessage(): Input a Message ID, and output a Message from cache.
 * * layer.Client.getConversation(): Input a Conversation ID, and output a Conversation from cache.
 * * layer.Client.on() and layer.Conversation.off(): event listeners
 * * layer.Client.destroy(): Cleanup all resources used by this client, including all Messages and Conversations.
 *
 * ### Events:
 *
 * * `challenge`: Provides a nonce and a callback; you call the callback once you have an Identity Token.
 * * `ready`: Your application can now start using the Layer services
 * * `messages:notify`: Used to notify your application of new messages for which a local notification may be suitable.
 *
 * ## Logging:
 *
 * There are two ways to change the log level for Layer's logger:
 *
 *     layer.Client.prototype.logLevel = layer.Constants.LOG.INFO;
 *
 * or
 *
 *     var client = new layer.Client({
 *        appId: 'layer:///apps/staging/ffffffff-ffff-ffff-ffff-ffffffffffff',
 *        userId: 'Fred',
 *        logLevel: layer.Constants.LOG.INFO
 *     });
 *
 * @class  layer.Client
 * @extends layer.ClientAuthenticator
 *
 */

var ClientAuth = require('./client-authenticator');
var Conversation = require('./conversation');
var Query = require('./query');
var LayerError = require('./layer-error');
var Syncable = require('./syncable');
var Message = require('./message');
var Announcement = require('./announcement');
var User = require('./user');
var TypingIndicatorListener = require('./typing-indicators/typing-indicator-listener');
var Util = require('./client-utils');
var Root = require('./root');
var ClientRegistry = require('./client-registry');
var logger = require('./logger');

var Client = function (_ClientAuth) {
  _inherits(Client, _ClientAuth);

  /*
   * Adds conversations, messages and websockets on top of the authentication client.
   * jsdocs on parent class constructor.
   */

  function Client(options) {
    _classCallCheck(this, Client);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Client).call(this, options));

    ClientRegistry.register(_this);

    // Initialize Properties
    _this._conversationsHash = {};
    _this._messagesHash = {};
    _this._queriesHash = {};
    _this._scheduleCheckAndPurgeCacheItems = [];

    if (!options.users) {
      _this.users = [];
    } else {
      _this.__updateUsers(_this.users);
    }

    _this._initComponents();

    _this.on('online', _this._connectionRestored.bind(_this));
    return _this;
  }

  /* See parent method docs */


  _createClass(Client, [{
    key: '_initComponents',
    value: function _initComponents() {
      var _this2 = this;

      _get(Object.getPrototypeOf(Client.prototype), '_initComponents', this).call(this);

      this._typingIndicators = new TypingIndicatorListener({
        clientId: this.appId
      });

      // Instantiate Plugins
      Object.keys(Client.plugins).forEach(function (propertyName) {
        _this2[propertyName] = new Client.plugins[propertyName](_this2);
      });
    }

    /**
     * Cleanup all resources (Conversations, Messages, etc...) prior to destroy or reauthentication.
     *
     * @method _cleanup
     * @private
     */

  }, {
    key: '_cleanup',
    value: function _cleanup() {
      var _this3 = this;

      if (this.isDestroyed) return;
      this._inCleanup = true;

      Object.keys(this._conversationsHash).forEach(function (id) {
        var c = _this3._conversationsHash[id];
        if (c && !c.isDestroyed) {
          c.destroy();
        }
      });
      this._conversationsHash = null;

      Object.keys(this._messagesHash).forEach(function (id) {
        var m = _this3._messagesHash[id];
        if (m && !m.isDestroyed) {
          m.destroy();
        }
      });
      this._messagesHash = null;

      Object.keys(this._queriesHash).forEach(function (id) {
        _this3._queriesHash[id].destroy();
      });
      this._queriesHash = null;
      if (this.users) [].concat(this.users).forEach(function (user) {
        return user.destroy ? user.destroy() : null;
      });

      // Ideally we'd set it to null, but _adjustUsers would make it []
      this.users = [];

      if (this.socketManager) this.socketManager.close();
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      var _this4 = this;

      // Cleanup all plugins
      Object.keys(Client.plugins).forEach(function (propertyName) {
        if (_this4[propertyName]) {
          _this4[propertyName].destroy();
          delete _this4[propertyName];
        }
      });

      // Cleanup all resources (Conversations, Messages, etc...)
      this._cleanup();

      this._destroyComponents();

      ClientRegistry.unregister(this);

      _get(Object.getPrototypeOf(Client.prototype), 'destroy', this).call(this);
      this._inCleanup = false;
    }

    /**
     * Retrieve a conversation by Identifier.
     *
     *      var c = client.getConversation('layer:///conversations/uuid');
     *
     * If there is not a conversation with that id, it will return null.
     *
     * If you want it to load it from cache and then from server if not in cache, use the `canLoad` parameter.
     * If loading from the server, the method will return
     * a layer.Conversation instance that has no data; the conversations:loaded/conversations:loaded-error events
     * will let you know when the conversation has finished/failed loading from the server.
     *
     *      var c = client.getConversation('layer:///conversations/123', true)
     *      .on('conversations:loaded', function() {
     *          // Render the Conversation with all of its details loaded
     *          myrerender(c);
     *      });
     *      // Render a placeholder for c until the details of c have loaded
     *      myrender(c);
     *
     * @method getConversation
     * @param  {string} id
     * @param  {boolean} [canLoad=false] - Pass true to allow loading a conversation from
     *                                    the server if not found
     * @return {layer.Conversation}
     */

  }, {
    key: 'getConversation',
    value: function getConversation(id, canLoad) {
      if (typeof id !== 'string') throw new Error(LayerError.dictionary.idParamRequired);
      if (this._conversationsHash[id]) {
        return this._conversationsHash[id];
      } else if (canLoad) {
        return Conversation.load(id, this);
      }
    }

    /**
     * Adds a conversation to the client.
     *
     * Typically, you do not need to call this; the following code
     * automatically calls _addConversation for you:
     *
     *      var conv = new layer.Conversation({
     *          client: client,
     *          participants: ['a', 'b']
     *      });
     *
     *      // OR:
     *      var conv = client.createConversation(['a', 'b']);
     *
     * @method _addConversation
     * @protected
     * @param  {layer.Conversation} c
     * @returns {layer.Client} this
     */

  }, {
    key: '_addConversation',
    value: function _addConversation(conversation) {
      var id = conversation.id;
      if (!this._conversationsHash[id]) {
        // Register the Conversation
        this._conversationsHash[id] = conversation;

        // Make sure the client is set so that the next event bubbles up
        if (conversation.clientId !== this.appId) conversation.clientId = this.appId;
        this._triggerAsync('conversations:add', { conversations: [conversation] });

        this._scheduleCheckAndPurgeCache(conversation);
      }
      return this;
    }

    /**
     * Removes a conversation from the client.
     *
     * Typically, you do not need to call this; the following code
     * automatically calls _removeConversation for you:
     *
     *      converation.destroy();
     *
     * @method _removeConversation
     * @protected
     * @param  {layer.Conversation} c
     * @returns {layer.Client} this
     */

  }, {
    key: '_removeConversation',
    value: function _removeConversation(conversation) {
      var _this5 = this;

      // Insure we do not get any events, such as message:remove
      conversation.off(null, null, this);

      if (this._conversationsHash[conversation.id]) {
        delete this._conversationsHash[conversation.id];
        this._triggerAsync('conversations:remove', { conversations: [conversation] });
      }

      // Remove any Message associated with this Conversation
      Object.keys(this._messagesHash).forEach(function (id) {
        if (_this5._messagesHash[id].conversationId === conversation.id) {
          _this5._messagesHash[id].destroy();
        }
      });

      return this;
    }

    /**
     * If the Conversation ID changes, we need to reregister the Conversation
     *
     * @method _updateConversationId
     * @protected
     * @param  {layer.Conversation} conversation - Conversation whose ID has changed
     * @param  {string} oldId - Previous ID
     */

  }, {
    key: '_updateConversationId',
    value: function _updateConversationId(conversation, oldId) {
      var _this6 = this;

      if (this._conversationsHash[oldId]) {
        this._conversationsHash[conversation.id] = conversation;
        delete this._conversationsHash[oldId];

        // This is a nasty way to work... but need to find and update all
        // conversationId properties of all Messages or the Query's won't
        // see these as matching the query.
        Object.keys(this._messagesHash).filter(function (id) {
          return _this6._messagesHash[id].conversationId === oldId;
        }).forEach(function (id) {
          return _this6._messagesHash[id].conversationId = conversation.id;
        });
      }
    }

    /**
     * Retrieve the message or announcement id.
     *
     * Useful for finding a message when you have only the ID.
     *
     * If the message is not found, it will return null.
     *
     * If you want it to load it from cache and then from server if not in cache, use the `canLoad` parameter.
     * If loading from the server, the method will return
     * a layer.Message instance that has no data; the messages:loaded/messages:loaded-error events
     * will let you know when the message has finished/failed loading from the server.
     *
     *      var m = client.getMessage('layer:///messages/123', true)
     *      .on('messages:loaded', function() {
     *          // Render the Message with all of its details loaded
     *          myrerender(m);
     *      });
     *      // Render a placeholder for m until the details of m have loaded
     *      myrender(m);
     *
     *
     * @method getMessage
     * @param  {string} id              - layer:///messages/uuid
     * @param  {boolean} [canLoad=false] - Pass true to allow loading a message from the server if not found
     * @return {layer.Message}
     */

  }, {
    key: 'getMessage',
    value: function getMessage(id, canLoad) {
      if (typeof id !== 'string') throw new Error(LayerError.dictionary.idParamRequired);

      if (this._messagesHash[id]) {
        return this._messagesHash[id];
      } else if (canLoad) {
        return Syncable.load(id, this);
      }
    }

    /**
     * Get a MessagePart by ID
     * @method getMessagePart
     * @param {String} id - ID of the Message Part; layer:///messages/uuid/parts/5
     */

  }, {
    key: 'getMessagePart',
    value: function getMessagePart(id) {
      if (typeof id !== 'string') throw new Error(LayerError.dictionary.idParamRequired);

      var messageId = id.replace(/\/parts.*$/, '');
      var message = this.getMessage(messageId);
      if (message) return message.getPartById(id);
    }

    /**
     * Registers a message in _messagesHash and triggers events.
     *
     * May also update Conversation.lastMessage.
     *
     * @method _addMessage
     * @protected
     * @param  {layer.Message} message
     */

  }, {
    key: '_addMessage',
    value: function _addMessage(message) {
      if (!this._messagesHash[message.id]) {
        this._messagesHash[message.id] = message;
        this._triggerAsync('messages:add', { messages: [message] });
        if (message._notify) {
          this._triggerAsync('messages:notify', { message: message });
          message._notify = false;
        }

        var conversation = message.getConversation(false);
        if (conversation && (!conversation.lastMessage || conversation.lastMessage.position < message.position)) {
          var lastMessageWas = conversation.lastMessage;
          conversation.lastMessage = message;
          if (lastMessageWas) this._scheduleCheckAndPurgeCache(lastMessageWas);
        } else {
          this._scheduleCheckAndPurgeCache(message);
        }
      }
    }

    /**
     * Removes message from _messagesHash.
     *
     * Accepts IDs or Message instances
     *
     * TODO: Remove support for remove by ID
     *
     * @method _removeMessage
     * @private
     * @param  {layer.Message|string} message or Message ID
     */

  }, {
    key: '_removeMessage',
    value: function _removeMessage(message) {
      var id = typeof message === 'string' ? message : message.id;
      message = this._messagesHash[id];
      if (message) {
        delete this._messagesHash[id];
        if (!this._inCleanup) {
          this._triggerAsync('messages:remove', { messages: [message] });
          var conv = message.getConversation(false);
          if (conv && conv.lastMessage === message) conv.lastMessage = null;
        }
      }
    }

    /**
     * Handles delete from position event from Websocket.
     *
     * A WebSocket may deliver a `delete` Conversation event with a
     * from_position field indicating that all Messages at the specified position
     * and earlier should be deleted.
     *
     * @method _purgeMessagesByPosition
     * @private
     * @param {string} conversationId
     * @param {number} fromPosition
     */

  }, {
    key: '_purgeMessagesByPosition',
    value: function _purgeMessagesByPosition(conversationId, fromPosition) {
      var _this7 = this;

      Object.keys(this._messagesHash).forEach(function (mId) {
        var message = _this7._messagesHash[mId];
        if (message.conversationId === conversationId && message.position <= fromPosition) {
          message.destroy();
        }
      });
    }

    /**
     * Takes as input an object id, and either calls getConversation() or getMessage() as needed.
     *
     * Will only get cached objects, will not get objects from the server.
     *
     * This is not a public method mostly so there's no ambiguity over using getXXX
     * or _getObject.  getXXX typically has an option to load the resource, which this
     * does not.
     *
     * @method _getObject
     * @protected
     * @param  {string} id - Message, Conversation or Query id
     * @return {layer.Message|layer.Conversation|layer.Query}
     */

  }, {
    key: '_getObject',
    value: function _getObject(id) {
      switch (Util.typeFromID(id)) {
        case 'messages':
        case 'announcements':
          return this.getMessage(id);
        case 'conversations':
          return this.getConversation(id);
        case 'queries':
          return this.getQuery(id);
      }
    }

    /**
     * Takes an object description from the server and either updates it (if cached)
     * or creates and caches it .
     *
     * @method _createObject
     * @protected
     * @param  {Object} obj - Plain javascript object representing a Message or Conversation
     */

  }, {
    key: '_createObject',
    value: function _createObject(obj) {
      var item = this._getObject(obj.id);
      if (item) {
        item._populateFromServer(obj);
        return item;
      } else {
        // TODO: Factory method in Syncable class?
        switch (Util.typeFromID(obj.id)) {
          case 'messages':
            return Message._createFromServer(obj, this);

          case 'announcements':
            return Announcement._createFromServer(obj, this);

          case 'conversations':
            return Conversation._createFromServer(obj, this);
        }
      }
    }

    /**
     * Merge events into smaller numbers of more complete events.
     *
     * Before any delayed triggers are fired, fold together all of the conversations:add
     * and conversations:remove events so that 100 conversations:add events can be fired as
     * a single event.
     *
     * @method _processDelayedTriggers
     * @private
     */

  }, {
    key: '_processDelayedTriggers',
    value: function _processDelayedTriggers() {
      if (this.isDestroyed) return;

      var addConversations = this._delayedTriggers.filter(function (evt) {
        return evt[0] === 'conversations:add';
      });
      var removeConversations = this._delayedTriggers.filter(function (evt) {
        return evt[0] === 'conversations:remove';
      });
      this._foldEvents(addConversations, 'conversations', this);
      this._foldEvents(removeConversations, 'conversations', this);

      var addMessages = this._delayedTriggers.filter(function (evt) {
        return evt[0] === 'messages:add';
      });
      var removeMessages = this._delayedTriggers.filter(function (evt) {
        return evt[0] === 'messages:remove';
      });

      this._foldEvents(addMessages, 'messages', this);
      this._foldEvents(removeMessages, 'messages', this);

      _get(Object.getPrototypeOf(Client.prototype), '_processDelayedTriggers', this).call(this);
    }
  }, {
    key: 'trigger',
    value: function trigger(eventName, evt) {
      this._triggerLogger(eventName, evt);
      _get(Object.getPrototypeOf(Client.prototype), 'trigger', this).call(this, eventName, evt);
    }

    /**
     * Does logging on all triggered events.
     *
     * All logging is done at `debug` or `info` levels.
     *
     * @method _triggerLogger
     * @private
     */

  }, {
    key: '_triggerLogger',
    value: function _triggerLogger(eventName, evt) {
      var infoEvents = ['conversations:add', 'conversations:remove', 'conversations:change', 'messages:add', 'messages:remove', 'messages:change', 'challenge', 'ready'];
      if (infoEvents.indexOf(eventName) !== -1) {
        if (evt && evt.isChange) {
          logger.info('Client Event: ' + eventName + ' ' + evt.changes.map(function (change) {
            return change.property;
          }).join(', '));
        } else {
          var text = '';
          if (evt) {
            if (evt.message) text = evt.message.id;
            if (evt.messages) text = evt.messages.length + ' messages';
            if (evt.conversation) text = evt.conversation.id;
            if (evt.conversations) text = evt.conversations.length + ' conversations';
          }
          logger.info('Client Event: ' + eventName + ' ' + text);
        }
        if (evt) logger.debug(evt);
      } else {
        logger.debug(eventName, evt);
      }
    }

    /**
     * Searches locally cached conversations for a matching conversation.
     *
     * Iterates over conversations calling a matching function until
     * the conversation is found or all conversations tested.
     *
     *      var c = client.findConversation(function(conversation) {
     *          if (conversation.participants.indexOf('a') != -1) return true;
     *      });
     *
     * @method findCachedConversation
     * @param  {Function} f - Function to call until we find a match
     * @param  {layer.Conversation} f.conversation - A conversation to test
     * @param  {boolean} f.return - Return true if the conversation is a match
     * @param  {Object} [context] - Optional context for the *this* object
     * @return {layer.Conversation}
     *
     * @deprecated
     * This should be replaced by iterating over your layer.Query data.
     */

  }, {
    key: 'findCachedConversation',
    value: function findCachedConversation(func, context) {
      var test = context ? func.bind(context) : func;
      var list = Object.keys(this._conversationsHash);
      var len = list.length;
      for (var index = 0; index < len; index++) {
        var key = list[index];
        var conversation = this._conversationsHash[key];
        if (test(conversation, index)) return conversation;
      }
    }

    /**
     * If the session has been reset, dump all data.
     *
     * @method _resetSession
     * @private
     */

  }, {
    key: '_resetSession',
    value: function _resetSession() {
      this._cleanup();
      this.users = [];
      this._conversationsHash = {};
      this._messagesHash = {};
      this._queriesHash = {};
      return _get(Object.getPrototypeOf(Client.prototype), '_resetSession', this).call(this);
    }

    /**
     * Add a user to the users array.
     *
     * By doing this instead of just directly `this.client.users.push(user)`
     * the user will get its conversations property setup correctly.
     *
     * @method addUser
     * @param  {layer.User} user [description]
     * @returns {layer.Client} this
     */

  }, {
    key: 'addUser',
    value: function addUser(user) {
      this.users.push(user);
      user.setClient(this);
      this.trigger('users:change');
      return this;
    }

    /**
     * Searches `client.users` array for the specified id.
     *
     * Use of the `client.users` array is optional.
     *
     *      function getSenderDisplayName(message) {
     *          var user = client.findUser(message.sender.userId);
     *          return user ? user.displayName : 'Unknown User';
     *      }
     *
     * @method findUser
     * @param  {string} id
     * @return {layer.User}
     */

  }, {
    key: 'findUser',
    value: function findUser(id) {
      var l = this.users.length;
      for (var i = 0; i < l; i++) {
        var u = this.users[i];
        if (u.id === id) return u;
      }
    }

    /**
     * __ Methods are automatically called by property setters.
     *
     * Insure that any attempt to set the `users` property sets it to an array.
     *
     * @method __adjustUsers
     * @private
     */

  }, {
    key: '__adjustUsers',
    value: function __adjustUsers(users) {
      if (!users) return [];
      if (!Array.isArray(users)) return [users];
    }

    /**
     * __ Methods are automatically called by property setters.
     *
     * Insure that each user in the users array gets its client property setup.
     *
     * @method __adjustUsers
     * @private
     */

  }, {
    key: '__updateUsers',
    value: function __updateUsers(users) {
      var _this8 = this;

      users.forEach(function (u) {
        if (u instanceof User) u.setClient(_this8);
      });
      this.trigger('users:change');
    }

    /**
     * This method is recommended way to create a Conversation.
     *
     * There are a few ways to invoke it; note that the default behavior is to create a Distinct Conversation
     * unless otherwise stated via the layer.Conversation.distinct property.
     *
     *         client.createConversation(['a', 'b']);
     *
     *         client.createConversation({participants: ['a', 'b']});
     *
     *         client.createConversation({
     *             participants: ['a', 'b'],
     *             distinct: false
     *         });
     *
     *         client.createConversation({
     *             participants: ['a', 'b'],
     *             metadata: {
     *                 title: 'I am a title'
     *             }
     *         });
     *
     * If you try to create a Distinct Conversation that already exists,
     * you will get back an existing Conversation, and any requested metadata
     * will NOT be set; you will get whatever metadata the matching Conversation
     * already had.
     *
     * The default value for distinct is `true`.
     *
     * Whether the Conversation already exists or not, a 'conversations:sent' event
     * will be triggered asynchronously and the Conversation object will be ready
     * at that time.  Further, the event will provide details on the result:
     *
     *       var conversation = client.createConversation(['a', 'b']);
     *       conversation.on('conversations:sent', function(evt) {
     *           switch(evt.result) {
     *               case Conversation.CREATED:
     *                   alert(conversation.id + ' was created');
     *                   break;
     *               case Conversation.FOUND:
     *                   alert(conversation.id + ' was found');
     *                   break;
     *               case Conversation.FOUND_WITHOUT_REQUESTED_METADATA:
     *                   alert(conversation.id + ' was found but it already has a title so your requested title was not set');
     *                   break;
     *            }
     *       });
     *
     * @method createConversation
     * @param  {Object/string[]} options Either an array of participants,
     *                                  or an object with parameters to pass to
     *                                  Conversation's constructor
     * @param {Boolean} [options.distinct=true] Is this a distinct Converation?
     * @param {Object} [options.metadata={}] Metadata for your Conversation
     * @return {layer.Conversation}
     */

  }, {
    key: 'createConversation',
    value: function createConversation(options) {
      var opts = undefined;
      if (Array.isArray(options)) {
        opts = {
          participants: options
        };
      } else {
        opts = options;
      }
      if (!('distinct' in opts)) opts.distinct = true;
      opts.client = this;
      return Conversation.create(opts);
    }

    /**
     * Retrieve the query by query id.
     *
     * Useful for finding a Query when you only have the ID
     *
     * @method getQuery
     * @param  {string} id              - layer:///messages/uuid
     * @return {layer.Query}
     */

  }, {
    key: 'getQuery',
    value: function getQuery(id) {
      if (typeof id !== 'string') throw new Error(LayerError.dictionary.idParamRequired);

      if (this._queriesHash[id]) {
        return this._queriesHash[id];
      }
    }

    /**
     * There are two options to create a new layer.Query instance.
     *
     * The direct way:
     *
     *     var query = client.createQuery({
     *         model: layer.Query.Message,
     *         predicate: 'conversation.id = '' + conv.id + ''',
     *         paginationWindow: 50
     *     });
     *
     * A Builder approach that allows for a simpler syntax:
     *
     *     var qBuilder = QueryBuilder
     *      .messages()
     *      .forConversation('layer:///conversations/ffffffff-ffff-ffff-ffff-ffffffffffff')
     *      .paginationWindow(100);
     *     var query = client.createQuery(qBuilder);
     *
     * @method createQuery
     * @param  {layer.QueryBuilder|Object} options - Either a layer.QueryBuilder instance, or parameters for the layer.Query constructor
     * @return {layer.Query}
     */

  }, {
    key: 'createQuery',
    value: function createQuery(options) {
      var query = undefined;
      if (typeof options.build === 'function') {
        query = new Query(this, options);
      } else {
        options.client = this;
        query = new Query(options);
      }
      this._addQuery(query);
      return query;
    }

    /**
     * Register the layer.Query.
     *
     * @method _addQuery
     * @private
     * @param  {layer.Query} query
     */

  }, {
    key: '_addQuery',
    value: function _addQuery(query) {
      this._queriesHash[query.id] = query;
    }

    /**
     * Deregister the layer.Query.
     *
     * @method _removeQuery
     * @private
     * @param  {layer.Query} query [description]
     */

  }, {
    key: '_removeQuery',
    value: function _removeQuery(query) {
      var _this9 = this;

      if (query) {
        delete this._queriesHash[query.id];
        if (!this._inCleanup) {
          var data = query.data.map(function (obj) {
            return _this9._getObject(obj.id);
          }).filter(function (obj) {
            return obj;
          });
          this._checkAndPurgeCache(data);
        }
        this.off(null, null, query);
      }
    }

    /**
     * Check to see if the specified objects can safely be removed from cache.
     *
     * Removes from cache if an object is not part of any Query's result set.
     *
     * @method _checkAndPurgeCache
     * @private
     * @param  {layer.Root[]} objects - Array of Messages or Conversations
     */

  }, {
    key: '_checkAndPurgeCache',
    value: function _checkAndPurgeCache(objects) {
      var _this10 = this;

      objects.forEach(function (obj) {
        if (!obj.isDestroyed && !_this10._isCachedObject(obj)) {
          if (obj instanceof Root === false) obj = _this10._getObject(obj.id);
          obj.destroy();
        }
      });
    }

    /**
     * Schedules _runScheduledCheckAndPurgeCache if needed, and adds this object
     * to the list of objects it will validate for uncaching.
     *
     * Note that any object that does not exist on the server (!isSaved()) is an object that the
     * app created and can only be purged by the app and not by the SDK.  Once its been
     * saved, and can be reloaded from the server when needed, its subject to standard caching.
     *
     * @method _scheduleCheckAndPurgeCache
     * @private
     * @param {layer.Root}
     */

  }, {
    key: '_scheduleCheckAndPurgeCache',
    value: function _scheduleCheckAndPurgeCache(object) {
      var _this11 = this;

      if (object.isSaved()) {
        if (this._scheduleCheckAndPurgeCacheAt < Date.now()) {
          this._scheduleCheckAndPurgeCacheAt = Date.now() + Client.CACHE_PURGE_INTERVAL;
          setTimeout(function () {
            return _this11._runScheduledCheckAndPurgeCache();
          }, Client.CACHE_PURGE_INTERVAL);
        }
        this._scheduleCheckAndPurgeCacheItems.push(object);
      }
    }

    /**
     * Calls _checkAndPurgeCache on accumulated objects and resets its state
     */

  }, {
    key: '_runScheduledCheckAndPurgeCache',
    value: function _runScheduledCheckAndPurgeCache() {
      var list = this._scheduleCheckAndPurgeCacheItems;
      this._scheduleCheckAndPurgeCacheItems = [];
      this._checkAndPurgeCache(list);
      this._scheduleCheckAndPurgeCacheAt = 0;
    }

    /**
     * Returns true if the specified object should continue to be part of the cache.
     *
     * Result is based on whether the object is part of the data for a Query.
     *
     * @method _isCachedObject
     * @private
     * @param  {layer.Root} obj - A Message or Conversation Instance
     * @return {Boolean}
     */

  }, {
    key: '_isCachedObject',
    value: function _isCachedObject(obj) {
      var list = Object.keys(this._queriesHash);
      for (var i = 0; i < list.length; i++) {
        var query = this._queriesHash[list[i]];
        if (query._getItem(obj.id)) return true;
      }
    }

    /**
     * On restoring a connection, determine what steps need to be taken to update our data.
     *
     * A reset boolean property is passed; set based on  layer.ClientAuthenticator.ResetAfterOfflineDuration.
     *
     * Note it is possible for an application to have logic that causes queries to be created/destroyed
     * as a side-effect of layer.Query.reset destroying all data. So we must test to see if queries exist.
     *
     * @method _connectionRestored
     * @private
     * @param {boolean} reset - Should the session reset/reload all data or attempt to resume where it left off?
     */

  }, {
    key: '_connectionRestored',
    value: function _connectionRestored(evt) {
      var _this12 = this;

      if (evt.reset) {
        logger.debug('Client Connection Restored; Resetting all Queries');
        Object.keys(this._queriesHash).forEach(function (id) {
          var query = _this12._queriesHash[id];
          if (query) query.reset();
        });
      }
    }

    /**
     * Remove the specified object from cache
     *
     * @method _removeObject
     * @private
     * @param  {layer.Root}  obj - A Message or Conversation Instance
     */

  }, {
    key: '_removeObject',
    value: function _removeObject(obj) {
      if (obj) obj.destroy();
    }

    /**
     * Creates a layer.TypingIndicators.TypingListener instance
     * bound to the specified dom node.
     *
     *      var typingListener = client.createTypingListener(document.getElementById('myTextBox'));
     *      typingListener.setConversation(mySelectedConversation);
     *
     * Use this method to instantiate a listener, and call
     * layer.TypingIndicators.TypingListener.setConversation every time you want to change which Conversation
     * it reports your user is typing into.
     *
     * @method createTypingListener
     * @param  {HTMLElement} inputNode - Text input to watch for keystrokes
     * @return {layer.TypingIndicators.TypingListener}
     */

  }, {
    key: 'createTypingListener',
    value: function createTypingListener(inputNode) {
      var TypingListener = require('./typing-indicators/typing-listener');
      return new TypingListener({
        clientId: this.appId,
        input: inputNode
      });
    }

    /**
     * Creates a layer.TypingIndicators.TypingPublisher.
     *
     * The TypingPublisher lets you manage your Typing Indicators without using
     * the layer.TypingIndicators.TypingListener.
     *
     *      var typingPublisher = client.createTypingPublisher();
     *      typingPublisher.setConversation(mySelectedConversation);
     *      typingPublisher.setState(layer.TypingIndicators.STARTED);
     *
     * Use this method to instantiate a listener, and call
     * layer.TypingIndicators.TypingPublisher.setConversation every time you want to change which Conversation
     * it reports your user is typing into.
     *
     * Use layer.TypingIndicators.TypingPublisher.setState to inform other users of your current state.
     * Note that the `STARTED` state only lasts for 2.5 seconds, so you
     * must repeatedly call setState for as long as this state should continue.
     * This is typically done by simply calling it every time a user hits
     * a key.
     *
     * @method createTypingPublisher
     * @return {layer.TypingIndicators.TypingPublisher}
     */

  }, {
    key: 'createTypingPublisher',
    value: function createTypingPublisher() {
      var TypingPublisher = require('./typing-indicators/typing-publisher');
      return new TypingPublisher({
        clientId: this.appId
      });
    }

    /**
     * Accessor for getting a Client by appId.
     *
     * Most apps will only have one client,
     * and will not need this method.
     *
     * @method getClient
     * @static
     * @param  {string} appId
     * @return {layer.Client}
     */

  }], [{
    key: 'getClient',
    value: function getClient(appId) {
      return ClientRegistry.get(appId);
    }
  }, {
    key: 'destroyAllClients',
    value: function destroyAllClients() {
      ClientRegistry.getAll().forEach(function (client) {
        return client.destroy();
      });
    }

    /*
     * Registers a plugin which can add capabilities to the Client.
     *
     * Capabilities must be triggered by Events/Event Listeners.
     *
     * This concept is a bit premature and unused/untested...
     * As implemented, it provides for a plugin that will be
     * instantiated by the Client and passed the Client as its parameter.
     * This allows for a library of plugins that can be shared among
     * different companies/projects but that are outside of the core
     * app logic.
     *
     *      // Define the plugin
     *      function MyPlugin(client) {
     *          this.client = client;
     *          client.on('messages:add', this.onMessagesAdd, this);
     *      }
     *
     *      MyPlugin.prototype.onMessagesAdd = function(event) {
     *          var messages = event.messages;
     *          alert('You now have ' + messages.length  + ' messages');
     *      }
     *
     *      // Register the Plugin
     *      Client.registerPlugin('myPlugin34', MyPlugin);
     *
     *      var client = new Client({appId: 'layer:///apps/staging/uuid'});
     *
     *      // Trigger the plugin's behavior
     *      client.myPlugin34.addMessages({messages:[]});
     *
     * @method registerPlugin
     * @static
     * @param  {string} name     [description]
     * @param  {Function} classDef [description]
     */

  }, {
    key: 'registerPlugin',
    value: function registerPlugin(name, classDef) {
      Client.plugins[name] = classDef;
    }
  }]);

  return Client;
}(ClientAuth);

/**
 * Hash of layer.Conversation objects for quick lookup by id
 *
 * @private
 * @property {Object}
 */


Client.prototype._conversationsHash = null;

/**
 * Hash of layer.Message objects for quick lookup by id
 *
 * @private
 * @type {Object}
 */
Client.prototype._messagesHash = null;

/**
 * Hash of layer.Query objects for quick lookup by id
 *
 * @private
 * @type {Object}
 */
Client.prototype._queriesHash = null;

/**
 * Array of items to be checked to see if they can be uncached.
 *
 * @private
 * @type {layer.Root[]}
 */
Client.prototype._scheduleCheckAndPurgeCacheItems = null;

/**
 * Time that the next call to _runCheckAndPurgeCache() is scheduled for in ms since 1970.
 *
 * @private
 * @type {number}
 */
Client.prototype._scheduleCheckAndPurgeCacheAt = 0;

/**
 * Array of layer.User objects.
 *
 * Use of this property is optional; but by storing
 * an array of layer.User objects in this array, you can
 * then use the `client.findUser(userId)` method to lookup
 * users; and you can use the layer.User objects to find
 * suitable Conversations so you can associate a Direct
 * Message conversation with each user.
 *
 * @type {layer.User[]}
 */
Client.prototype.users = null;

/**
 * Any Conversation or Message that is part of a Query's results are kept in memory for as long as it
 * remains in that Query.  However, when a websocket event delivers new Messages and Conversations that
 * are NOT part of a Query, how long should they stick around in memory?  Why have them stick around?
 * Perhaps an app wants to post a notification of a new Message or Conversation... and wants to keep
 * the object local for a little while.  Default is 10 minutes before checking to see if
 * the object is part of a Query or can be uncached.  Value is in miliseconds.
 * @static
 * @type {number}
 */
Client.CACHE_PURGE_INTERVAL = 10 * 60 * 1000;

Client._ignoredEvents = ['conversations:loaded', 'conversations:loaded-error'];

Client._supportedEvents = [

/**
 * One or more layer.Conversation objects have been added to the client.
 *
 * They may have been added via the websocket, or via the user creating
 * a new Conversation locally.
 *
 *      client.on('conversations:add', function(evt) {
 *          evt.conversations.forEach(function(conversation) {
 *              myView.addConversation(conversation);
 *          });
 *      });
 *
 * @event
 * @param {layer.LayerEvent} evt
 * @param {layer.Conversation[]} evt.conversations - Array of conversations added
 */
'conversations:add',

/**
 * One or more layer.Conversation objects have been removed.
 *
 * A removed Conversation is not necessarily deleted, its just
 * no longer being held in local memory.
 *
 * Note that typically you will want the conversations:delete event
 * rather than conversations:remove.
 *
 *      client.on('conversations:remove', function(evt) {
 *          evt.conversations.forEach(function(conversation) {
 *              myView.removeConversation(conversation);
 *          });
 *      });
 *
 * @event
 * @param {layer.LayerEvent} evt
 * @param {layer.Conversation[]} evt.conversations - Array of conversations removed
 */
'conversations:remove',

/**
 * The conversation is now on the server.
 *
 * Called after creating the conversation
 * on the server.  The Result property is one of:
 *
 * * layer.Conversation.CREATED: A new Conversation has been created
 * * layer.Conversation.FOUND: A matching Distinct Conversation has been found
 * * layer.Conversation.FOUND_WITHOUT_REQUESTED_METADATA: A matching Distinct Conversation has been found
 *                       but note that the metadata is NOT what you requested.
 *
 * All of these results will also mean that the updated property values have been
 * copied into your Conversation object.  That means your metadata property may no
 * longer be its initial value; it will be the value found on the server.
 *
 *      client.on('conversations:sent', function(evt) {
 *          switch(evt.result) {
 *              case Conversation.CREATED:
 *                  alert(evt.target.id + ' Created!');
 *                  break;
 *              case Conversation.FOUND:
 *                  alert(evt.target.id + ' Found!');
 *                  break;
 *              case Conversation.FOUND_WITHOUT_REQUESTED_METADATA:
 *                  alert(evt.target.id + ' Found, but does not have the requested metadata!');
 *                  break;
 *          }
 *      });
 *
 * @event
 * @param {layer.LayerEvent} event
 * @param {string} event.result
 * @param {layer.Conversation} target
 */
'conversations:sent',

/**
 * A conversation failed to load or create on the server.
 *
 *      client.on('conversations:sent-error', function(evt) {
 *          alert(evt.data.message);
 *      });
 *
 * @event
 * @param {layer.LayerEvent} evt
 * @param {layer.LayerError} evt.data
 * @param {layer.Conversation} target
 */
'conversations:sent-error',

/**
 * A conversation had a change in its properties.
 *
 * This change may have been delivered from a remote user
 * or as a result of a local operation.
 *
 *      client.on('conversations:change', function(evt) {
 *          var metadataChanges = evt.getChangesFor('metadata');
 *          var participantChanges = evt.getChangesFor('participants');
 *          if (metadataChanges.length) {
 *              myView.renderTitle(evt.target.metadata.title);
 *          }
 *          if (participantChanges.length) {
 *              myView.renderParticipants(evt.target.participants);
 *          }
 *      });
 *
 * @event
 * @param {layer.LayerEvent} evt
 * @param {layer.Conversation} evt.target
 * @param {Object[]} evt.changes
 * @param {Mixed} evt.changes.newValue
 * @param {Mixed} evt.changes.oldValue
 * @param {string} evt.changes.property - Name of the property that has changed
 */
'conversations:change',

/**
 * A call to layer.Conversation.load has completed successfully
 *
 * @event
 * @param {layer.LayerEvent} evt
 * @param {layer.Conversation} evt.target
 */
'conversations:loaded',

/**
 * A new message has been received for which a notification may be suitable.
 * This event is triggered for messages that are:
 *
 * 1. Added via websocket rather than other IO
 * 2. Not yet been marked as read
 * 3. Not sent by this user
 *
        client.on('messages:notify', function(evt) {
            myNotify(evt.message);
        })
 *
 * @event
 * @param {layer.LayerEvent} evt
 * @param {layer.Message} evt.Message
 */
'messages:notify',

/**
 * Messages have been added to a conversation.
 *
 * This event is triggered on
 *
 * * creating/sending a new message
 * * Receiving a new Message via websocket
 * * Querying/downloading a set of Messages
 *
        client.on('messages:add', function(evt) {
            evt.messages.forEach(function(message) {
                myView.addMessage(message);
            });
        });
 *
 * @event
 * @param {layer.LayerEvent} evt
 * @param {layer.Message[]} evt.messages
 */
'messages:add',

/**
 * A message has been removed from a conversation.
 *
 * A removed Message is not necessarily deleted,
 * just no longer being held in memory.
 *
 * Note that typically you will want the messages:delete event
 * rather than messages:remove.
 *
 *      client.on('messages:remove', function(evt) {
 *          evt.messages.forEach(function(message) {
 *              myView.removeMessage(message);
 *          });
 *      });
 *
 * @event
 * @param {layer.LayerEvent} evt
 * @param {layer.Message} evt.message
 */
'messages:remove',

/**
 * A message has been sent.
 *
 *      client.on('messages:sent', function(evt) {
 *          alert(evt.target.getText() + ' has been sent');
 *      });
 *
 * @event
 * @param {layer.LayerEvent} evt
 * @param {layer.Message} evt.target
 */
'messages:sent',

/**
 * A message is about to be sent.
 *
 * Useful if you want to
 * add parts to the message before it goes out.
 *
 *      client.on('messages:sending', function(evt) {
 *          evt.target.addPart({
 *              mimeType: 'text/plain',
 *              body: 'this is just a test'
 *          });
 *      });
 *
 * @event
 * @param {layer.LayerEvent} evt
 * @param {layer.Message} evt.target
 */
'messages:sending',

/**
 * Server failed to receive a Message.
 *
 * @event
 * @param {layer.LayerEvent} evt
 * @param {layer.LayerError} evt.error
 */
'messages:sent-error',

/**
 * A message has had a change in its properties.
 *
 * This change may have been delivered from a remote user
 * or as a result of a local operation.
 *
 *      client.on('messages:change', function(evt) {
 *          var recpientStatusChanges = evt.getChangesFor('recipientStatus');
 *          if (recpientStatusChanges.length) {
 *              myView.renderStatus(evt.target);
 *          }
 *      });
 *
 * @event
 * @param {layer.LayerEvent} evt
 * @param {layer.Message} evt.target
 * @param {Object[]} evt.changes
 * @param {Mixed} evt.changes.newValue
 * @param {Mixed} evt.changes.oldValue
 * @param {string} evt.changes.property - Name of the property that has changed
 */
'messages:change',

/**
 * A message has been marked as read.
 *
 * This is can be triggered by a local event, or by this same user on a separate device or browser.
 *
 *      client.on('messages:read', function(evt) {
 *          myView.renderUnreadStatus(evt.target);
 *      });
 *
 * @event
 * @param {layer.LayerEvent} evt
 * @param {layer.Message} evt.target
 */
'messages:read',

/**
 * A call to layer.Message.load has completed successfully
 *
 * @event
 * @param {layer.LayerEvent} evt
 * @param {layer.Message} evt.target
 */
'messages:loaded',

/**
 * A Conversation has been deleted from the server.
 *
 * Caused by either a successful call to layer.Conversation.delete() on the Conversation
 * or by a remote user.
 *
 *      client.on('conversations:delete', function(evt) {
 *          myView.removeConversation(evt.target);
 *      });
 *
 * @event
 * @param {layer.LayerEvent} evt
 * @param {layer.Conversation} evt.target
 */
'conversations:delete',

/**
 * A Message has been deleted from the server.
 *
 * Caused by either a successful call to layer.Message.delete() on the Message
 * or by a remote user.
 *
 *      client.on('messages:delete', function(evt) {
 *          myView.removeMessage(evt.target);
 *      });
 *
 * @event
 * @param {layer.LayerEvent} evt
 * @param {layer.Message} evt.target
 */
'messages:delete',

/**
 * A User has been added or changed in the users array.
 *
 * This event is not yet well supported.
 * @event
 */
'users:change',

/**
 * A Typing Indicator state has changed.
 *
 * Either a change has been received
 * from the server, or a typing indicator state has expired.
 *
 *      client.on('typing-indicator-change', function(evt) {
 *          if (evt.conversationId === myConversationId) {
 *              alert(evt.typing.join(', ') + ' are typing');
 *              alert(evt.paused.join(', ') + ' are paused');
 *          }
 *      });
 *
 * @event
 * @param {layer.LayerEvent} evt
 * @param {string} conversationId - ID of the Conversation users are typing into
 * @param {string[]} typing - Array of user IDs who are currently typing
 * @param {string[]} paused - Array of user IDs who are currently paused;
 *                            A paused user still has text in their text box.
 */
'typing-indicator-change'].concat(ClientAuth._supportedEvents);

Client.plugins = {};

Root.initClass.apply(Client, [Client, 'Client']);
module.exports = Client;

},{"./announcement":7,"./client-authenticator":8,"./client-registry":9,"./client-utils":10,"./conversation":14,"./layer-error":16,"./logger":18,"./message":20,"./query":23,"./root":24,"./syncable":27,"./typing-indicators/typing-indicator-listener":28,"./typing-indicators/typing-listener":30,"./typing-indicators/typing-publisher":31,"./user":32}],12:[function(require,module,exports){
'use strict';

/**
 * Layer Constants are stored in two places:
 *
 * 1. As part of the layer.Constants singleton
 * 2. As static properties on classes.
 *
 * Typically the static property constants are designed to be changed by developers to customize behaviors,
 * and tend to only be used by that single class.
 *
 * @class layer.Constants
 * @singleton
 */
module.exports = {
  /**
   * Is the object synchronized with the server?
   * @property {Object} [SYNC_STATE=null]
   * @property {string} SYNC_STATE.NEW      - Object is newly created, was created locally, not from server data, and has not yet been sent to the server.
   * @property {string} SYNC_STATE.SAVING   - Object is newly created and is being sent to the server.
   * @property {string} SYNC_STATE.SYNCING  - Object exists both locally and on server but is being synced with changes.
   * @property {string} SYNC_STATE.SYNCED   - Object exists both locally and on server and at last check was in sync.
   * @property {string} SYNC_STATE.LOADING  - Object is being loaded from the server and may not have its properties set yet.
   */
  SYNC_STATE: {
    NEW: 'NEW',
    SAVING: 'SAVING',
    SYNCING: 'SYNCING',
    SYNCED: 'SYNCED',
    LOADING: 'LOADING'
  },

  /**
   * Values for readStatus/deliveryStatus
   * @property {Object} [RECIPIENT_STATE=]
   * @property {string} RECIPIENT_STATE.NONE - No users have read (or received) this Message
   * @property {string} RECIPIENT_STATE.SOME - Some users have read (or received) this Message
   * @property {string} RECIPIENT_STATE.ALL  - All users have read (or received) this Message
   */
  RECIPIENT_STATE: {
    NONE: 'NONE',
    SOME: 'SOME',
    ALL: 'ALL'
  },

  /**
   * Values for recipientStatus
   * @property {Object} [RECEIPT_STATE=]
   * @property {string} RECEIPT_STATE.SENT      - The Message has been sent to the specified user but it has not yet been received by their device.
   * @property {string} RECEIPT_STATE.DELIVERED - The Message has been delivered to the specified use but has not yet been read.
   * @property {string} RECEIPT_STATE.READ      - The Message has been read by the specified user.
   * @property {string} RECEIPT_STATE.PENDING   - The request to send this Message to the specified user has not yet been received by the server.
   */
  RECEIPT_STATE: {
    SENT: 'sent',
    DELIVERED: 'delivered',
    READ: 'read',
    PENDING: 'pending'
  },
  LOCALSTORAGE_KEYS: {
    SESSIONDATA: 'layer-session-data-'
  },
  ACCEPT: 'application/vnd.layer+json; version=1.0',

  /**
   * Log levels
   * @property {Object} [LOG=]
   * @property {number} LOG.DEBUG     Log detailed information about requests, responses, events, state changes, etc...
   * @property {number} LOG.INFO      Log sparse information about requests, responses and events
   * @property {number} LOG.WARN      Log failures that are expected, normal, handled, but suggests that an operation didn't complete as intended
   * @property {number} LOG.ERROR     Log failures that are not expected or could not be handled
   * @property {number} LOG.NONE      Logs? Who needs em?
   */
  LOG: {
    DEBUG: 4,
    INFO: 3,
    WARN: 2,
    ERROR: 1,
    NONE: 0
  },

  /**
   * Deletion Modes
   * @property {Object} [DELETION_MODE=]
   * @property {number} DELETION_MODE.ALL          Delete Message/Conversation for All users but remain in the Conversation;
   *                                               new Messages will restore this Conversation minus any Message History prior to deletion.
   * @property {number} DELETION_MODE.MY_DEVICES   Delete Message or Conversation; but see layer.Conversation.leave if you want to delete
   *                                               a Conversation and not have it come back.
   */
  DELETION_MODE: {
    ALL: 1,
    MY_DEVICES: 2
  }
};

},{}],13:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * The Content class represents Rich Content.
 *
 * Note that instances of this class will automatically be
 * generated for developers based on whether their message parts
 * require it.
 *
 * That means for the most part, you should never need to
 * instantiate one of these directly.
 *
 *      var content = new layer.Content({
 *          id: 'layer:///content/8c839735-5f95-439a-a867-30903c0133f2'
 *      });
 *
 * @class  layer.Content
 * @protected
 * @extends layer.Root
 * @author Michael Kantor
 */

var Root = require('./root');
var xhr = require('./xhr');

var Content = function (_Root) {
  _inherits(Content, _Root);

  /**
   * Constructor
   *
   * @method constructor
   * @param  {Object} options
   * @param  {string} options.id - Identifier for the content
   * @param  {string} [options.downloadUrl=null] - Url to download the content from
   * @param  {Date} [options.expiration] - Expiration date for the url
   * @param  {string} [options.refreshUrl] - Url to access to get a new downloadUrl after it has expired
   *
   * @return {layer.Content}
   */

  function Content(options) {
    _classCallCheck(this, Content);

    if (typeof options === 'string') {
      options = { id: options };
    }
    return _possibleConstructorReturn(this, Object.getPrototypeOf(Content).call(this, options));
  }

  /**
   * Loads the data from google's cloud storage.
   *
   * Data is provided via callback.
   *
   * Note that typically one should use layer.MessagePart.fetchContent() rather than layer.Content.loadContent()
   *
   * @method loadContent
   * @param {string} mimeType - Mime type for the Blob
   * @param {Function} callback
   * @param {Blob} callback.data - A Blob instance representing the data downloaded.  If Blob object is not available, then may use other format.
   */


  _createClass(Content, [{
    key: 'loadContent',
    value: function loadContent(mimeType, callback) {
      xhr({
        url: this.downloadUrl,
        responseType: 'arraybuffer'
      }, function (result) {
        if (result.success) {
          if (typeof Blob !== 'undefined') {
            var blob = new Blob([result.data], { type: mimeType });
            callback(null, blob);
          } else {
            // If the blob class isn't defined (nodejs) then just return the result as is
            callback(null, result.data);
          }
        } else {
          callback(result.data, null);
        }
      });
    }

    /**
     * Refreshes the URL, which updates the URL and resets the expiration time for the URL
     *
     * @method refreshContent
     * @param {layer.Client} client
     * @param {Function} [callback]
     */

  }, {
    key: 'refreshContent',
    value: function refreshContent(client, callback) {
      var _this2 = this;

      client.xhr({
        url: this.refreshUrl,
        method: 'GET'
      }, function (result) {
        var data = result.data;

        _this2.expiration = new Date(data.expiration);
        _this2.downloadUrl = data.download_url;
        if (callback) callback(_this2.downloadUrl);
      });
    }

    /**
     * Is the download url expired or about to expire?
     * We can't be sure of the state of the device's internal clock,
     * so if its within 10 minutes of expiring, just treat it as expired.
     *
     * @method isExpired
     * @returns {Boolean}
     */

  }, {
    key: 'isExpired',
    value: function isExpired() {
      var expirationLeeway = 10 * 60 * 1000;
      return this.expiration.getTime() - expirationLeeway < Date.now();
    }

    /**
     * Creates a MessagePart from a server representation of the part
     *
     * @method _createFromServer
     * @private
     * @static
     * @param  {Object} part - Server representation of a part
     */

  }], [{
    key: '_createFromServer',
    value: function _createFromServer(part) {
      return new Content({
        id: part.id,
        downloadUrl: part.download_url,
        expiration: new Date(part.expiration),
        refreshUrl: part.refresh_url
      });
    }
  }]);

  return Content;
}(Root);

/**
 * Server generated identifier
 * @type {string}
 */


Content.prototype.id = '';

Content.prototype.blob = null;

/**
 * Server generated url for downloading the content
 * @type {string}
 */
Content.prototype.downloadUrl = '';

/**
 * Url for refreshing the downloadUrl after it has expired
 * @type {string}
 */
Content.prototype.refreshUrl = '';

/**
 * Size of the content.
 *
 * This property only has a value when in the process
 * of Creating the rich content and sending the Message.
 *
 * @type {number}
 */
Content.prototype.size = 0;

/**
 * Expiration date for the downloadUrl
 * @type {Date}
 */
Content.prototype.expiration = null;

Root.initClass.apply(Content, [Content, 'Content']);
module.exports = Content;

},{"./root":24,"./xhr":36}],14:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * A Conversation object represents a dialog amongst a set
 * of participants.
 *
 * Create a Conversation using the client:
 *
 *      var conversation = client.createConversation({
 *          participants: ['a','b'],
 *          distinct: true
 *      });
 *
 * In addition, there is a shortcut method for creating
 * a conversation, which will default to creating a Distinct
 * Conversation.
 *
 *      var conversation = client.createConversation(['a','b']);
 *
 * NOTE:   Do not create a conversation with new layer.Conversation(...),
 *         This will fail to handle the distinct property short of going to the server for evaluation.
 *
 * NOTE:   Creating a Conversation is a local action.  A Conversation will not be
 *         sent to the server until either:
 *
 * 1. A message is sent on that Conversation
 * 2. `Conversation.send()` is called (not recommended as mobile clients
 *    expect at least one layer.Message in a Conversation)
 *
 * Key methods, events and properties for getting started:
 *
 * Properties:
 *
 * * layer.Conversation.id: this property is worth being familiar with; it identifies the
 *   Conversation and can be used in `client.getConversation(id)` to retrieve it.
 * * layer.Conversation.internalId: This property makes for a handy unique ID for use in dom nodes;
 *   gaurenteed not to change during this session.
 * * layer.Conversation.lastMessage: This property makes it easy to show info about the most recent Message
 *    when rendering a list of Conversations.
 * * layer.Conversation.metadata: Custom data for your Conversation; commonly used to store a 'title' property
 *    to name your Conversation.
 *
 * Methods:
 *
 * * layer.Conversation.addParticipants and layer.Conversation.removeParticipants: Change the participants of the Conversation
 * * layer.Conversation.setMetadataProperties: Set metadata.title to 'My Conversation with Layer Support' (uh oh)
 * * layer.Conversation.on() and layer.Conversation.off(): event listeners built on top of the `backbone-events-standalone` npm project
 * * layer.Conversation.leave() to leave the Conversation
 *
 * Events:
 *
 * * `conversations:change`: Useful for observing changes to participants and metadata
 *   and updating rendering of your open Conversation
 *
 * Finally, to access a list of Messages in a Conversation, see layer.Query.
 *
 * @class  layer.Conversation
 * @extends layer.Syncable
 * @author  Michael Kantor
 */

var Syncable = require('./syncable');
var Message = require('./message');
var LayerError = require('./layer-error');
var Util = require('./client-utils');
var Constants = require('./const');
var Root = require('./root');
var LayerEvent = require('./layer-event');
var ClientRegistry = require('./client-registry');
var logger = require('./logger');

var Conversation = function (_Syncable) {
  _inherits(Conversation, _Syncable);

  /**
   * Create a new conversation.
   *
   * The static `layer.Conversation.create()` method
   * will correctly lookup distinct Conversations and
   * return them; `new layer.Conversation()` will not.
   *
   * Developers should use `layer.Conversation.create()`.
   *
   * @method constructor
   * @protected
   * @param  {Object} options
   * @param {string[]} options.participants - Array of participant ids
   * @param {boolean} [options.distinct=true] - Is the conversation distinct
   * @param {Object} [options.metadata] - An object containing Conversation Metadata.
   * @return {layer.Conversation}
   */

  function Conversation() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Conversation);

    // Setup default values
    if (!options.participants) options.participants = [];
    if (!options.metadata) options.metadata = {};

    // Make sure the ID from handle fromServer parameter is used by the Root.constructor
    if (options.fromServer) options.id = options.fromServer.id;

    // Make sure we have an clientId property
    if (options.client) options.clientId = options.client.appId;

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Conversation).call(this, options));

    _this.isInitializing = true;
    var client = _this.getClient();

    // If the options contains a full server definition of the object,
    // copy it in with _populateFromServer; this will add the Conversation
    // to the Client as well.
    if (options && options.fromServer) {
      _this._populateFromServer(options.fromServer);
    }

    // Setup participants
    else if (client && _this.participants.indexOf(client.userId) === -1) {
        _this.participants.push(client.userId);
      }

    _this.localCreatedAt = new Date();

    if (client) client._addConversation(_this);
    _this.isInitializing = false;
    return _this;
  }

  /**
   * Destroy the local copy of this Conversation, cleaning up all resources
   * it consumes.
   *
   * @method destroy
   */


  _createClass(Conversation, [{
    key: 'destroy',
    value: function destroy() {
      this.lastMessage = null;

      // Client fires 'conversations:remove' and then removes the Conversation.
      if (this.clientId) this.getClient()._removeConversation(this);

      _get(Object.getPrototypeOf(Conversation.prototype), 'destroy', this).call(this);

      this.participants = null;
      this.metadata = null;
    }

    /**
     * Get the client associated with this Conversation.
     *
     * @method getClient
     * @return {layer.Client}
     */

  }, {
    key: 'getClient',
    value: function getClient() {
      return ClientRegistry.get(this.clientId);
    }

    /**
     * Create this Conversation on the server.
     *
     * On completion, this instance will receive
     * an id, url and createdAt.  It may also receive metadata
     * if there was a FOUND_WITHOUT_REQUESTED_METADATA result.
     *
     * Note that the optional Message parameter should NOT be used except
     * by the layer.Message class itself.
     *
     * Note that recommended practice is to send the Conversation by sending a Message in the Conversation,
     * and NOT by calling Conversation.send.
     *
     *      client.createConversation({
     *          participants: ['a', 'b'],
     *          distinct: false
     *      })
     *      .send()
     *      .on('conversations:sent', function(evt) {
     *          alert('Done');
     *      });
     *
     * @method send
     * @param {layer.Message} [message] Tells the Conversation what its last_message will be
     * @return {layer.Conversation} this
     */

  }, {
    key: 'send',
    value: function send(message) {
      var _this2 = this;

      var client = this.getClient();
      if (!client) throw new Error(LayerError.dictionary.clientMissing);

      // If this is part of a create({distinct:true}).send() call where
      // the distinct conversation was found, just trigger the cached event and exit
      if (this._sendDistinctEvent) return this._handleLocalDistinctConversation();

      // If a message is passed in, then that message is being sent, and is our
      // new lastMessage (until the websocket tells us otherwise)
      if (message) {
        // Setting a position is required if its going to get sorted correctly by query.
        // The correct position will be written by _populateFromServer when the object
        // is returned from the server.  We increment the position by the time since the prior lastMessage was sent
        // so that if multiple tabs are sending messages and writing them to indexedDB, they will have positions in correct chronological order.
        // WARNING: The query will NOT be resorted using the server's position value.
        var position = undefined;
        if (this.lastMessage) {
          position = this.lastMessage.position + Date.now() - this.lastMessage.sentAt.getTime();
          if (position === this.lastMessage.position) position++;
        } else {
          position = 0;
        }
        message.position = position;
        this.lastMessage = message;
      }

      // If the Conversation is already on the server, don't send.
      if (this.syncState !== Constants.SYNC_STATE.NEW) return this;

      // Make sure this user is a participant (server does this for us, but
      // this insures the local copy is correct until we get a response from
      // the server
      if (this.participants.indexOf(client.userId) === -1) {
        this.participants.push(client.userId);
      }

      // If there is only one participant, its client.userId.  Not enough
      // for us to have a good Conversation on the server.  Abort.
      if (this.participants.length === 1) {
        throw new Error(LayerError.dictionary.moreParticipantsRequired);
      }

      // Update the syncState
      this._setSyncing();

      client.sendSocketRequest({
        method: 'POST',
        body: {}, // see _getSendData
        sync: {
          depends: this.id,
          target: this.id
        }
      }, function (result) {
        return _this2._createResult(result);
      });
      return this;
    }

    /**
     * Handles the case where a Distinct Create Conversation found a local match.
     *
     * When an app calls client.createConversation([...])
     * and requests a Distinct Conversation (default setting),
     * and the Conversation already exists, what do we do to help
     * them access it?
     *
     *      client.createConversation(["fred"]).on("conversations:sent", function(evt) {
     *        render();
     *      });
     *
     * Under normal conditions, calling `c.send()` on a matching distinct Conversation
     * would either throw an error or just be a no-op.  We use this method to trigger
     * the expected "conversations:sent" event even though its already been sent and
     * we did nothing.  Use the evt.result property if you want to know whether the
     * result was a new conversation or matching one.
     *
     * @method _handleLocalDistinctConversation
     * @private
     */

  }, {
    key: '_handleLocalDistinctConversation',
    value: function _handleLocalDistinctConversation() {
      var evt = this._sendDistinctEvent;
      this._sendDistinctEvent = null;

      // delay so there is time to setup an event listener on this conversation
      this._triggerAsync('conversations:sent', evt);
      return this;
    }

    /**
     * Gets the data for a Create request.
     *
     * The layer.SyncManager needs a callback to create the Conversation as it
     * looks NOW, not back when `send()` was called.  This method is called
     * by the layer.SyncManager to populate the POST data of the call.
     *
     * @method _getSendData
     * @private
     * @return {Object} Websocket data for the request
     */

  }, {
    key: '_getSendData',
    value: function _getSendData(data) {
      var isMetadataEmpty = Util.isEmpty(this.metadata);
      return {
        method: 'Conversation.create',
        data: {
          participants: this.participants,
          distinct: this.distinct,
          metadata: isMetadataEmpty ? null : this.metadata,
          id: this.id
        }
      };
    }

    /**
     * Process result of send method.
     *
     * Note that we use _triggerAsync so that
     * events reporting changes to the layer.Conversation.id can
     * be applied before reporting on it being sent.
     *
     * Example: Query will now have the resolved Distinct IDs rather than the proposed ID
     * when this event is triggered.
     *
     * @method _createResult
     * @private
     * @param  {Object} result
     */

  }, {
    key: '_createResult',
    value: function _createResult(_ref) {
      var success = _ref.success;
      var data = _ref.data;

      if (this.isDestroyed) return;
      if (success) {
        this._createSuccess(data);
      } else if (data.id === 'conflict') {
        this._populateFromServer(data.data);
        this._triggerAsync('conversations:sent', {
          result: Conversation.FOUND_WITHOUT_REQUESTED_METADATA
        });
      } else {
        this.trigger('conversations:sent-error', { error: data });
        this.destroy();
      }
    }

    /**
     * Process the successful result of a create call
     *
     * @method _createSuccess
     * @private
     * @param  {Object} data Server description of Conversation
     */

  }, {
    key: '_createSuccess',
    value: function _createSuccess(data) {
      this._populateFromServer(data);
      if (!this.distinct) {
        this._triggerAsync('conversations:sent', {
          result: Conversation.CREATED
        });
      } else {
        // Currently the websocket does not tell us if its
        // returning an existing Conversation.  So guess...
        // if there is no lastMessage, then most likely, there was
        // no existing Conversation.  Sadly, API-834; last_message is currently
        // always null.
        this._triggerAsync('conversations:sent', {
          result: !this.lastMessage ? Conversation.CREATED : Conversation.FOUND
        });
      }
    }

    /**
     * Populates this instance using server-data.
     *
     * Side effects add this to the Client.
     *
     * @method _populateFromServer
     * @private
     * @param  {Object} conversation - Server representation of the conversation
     */

  }, {
    key: '_populateFromServer',
    value: function _populateFromServer(conversation) {
      var client = this.getClient();

      // Disable events if creating a new Conversation
      // We still want property change events for anything that DOES change
      this._disableEvents = this.syncState === Constants.SYNC_STATE.NEW;

      this._setSynced();

      var id = this.id;
      this.id = conversation.id;

      // IDs change if the server returns a matching Distinct Conversation
      if (id !== this.id) {
        client._updateConversationId(this, id);
        this._triggerAsync('conversations:change', {
          oldValue: id,
          newValue: this.id,
          property: 'id'
        });
      }

      this.url = conversation.url;
      this.participants = conversation.participants;
      this.distinct = conversation.distinct;
      this.createdAt = new Date(conversation.created_at);
      this.metadata = conversation.metadata;
      this.unreadCount = conversation.unread_message_count;
      this.isCurrentParticipant = this.participants.indexOf(client.userId) !== -1;

      client._addConversation(this);

      if (conversation.last_message) {
        this.lastMessage = client._createObject(conversation.last_message);
      } else {
        this.lastMessage = null;
      }

      this._disableEvents = false;
    }

    /**
     * Add an array of participant ids to the conversation.
     *
     *      conversation.addParticipants(['a', 'b']);
     *
     * New participants will immediately show up in the Conversation,
     * but may not have synced with the server yet.
     *
     * TODO WEB-967: Roll participants back on getting a server error
     *
     * @method addParticipants
     * @param  {string[]} participants - Array of participant ids
     * @returns {layer.Conversation} this
     */

  }, {
    key: 'addParticipants',
    value: function addParticipants(participants) {
      var _this3 = this;

      // Only add those that aren't already in the list.
      var adding = participants.filter(function (participant) {
        return _this3.participants.indexOf(participant) === -1;
      });
      this._patchParticipants({ add: adding, remove: [] });
      return this;
    }

    /**
     * Removes an array of participant ids from the conversation.
     *
     *      conversation.removeParticipants(['a', 'b']);
     *
     * Removed participants will immediately be removed from this Conversation,
     * but may not have synced with the server yet.
     *
     * Throws error if you attempt to remove ALL participants.
     *
     * TODO  WEB-967: Roll participants back on getting a server error
     *
     * @method removeParticipants
     * @param  {string[]} participants - Array of participant ids
     * @returns {layer.Conversation} this
     */

  }, {
    key: 'removeParticipants',
    value: function removeParticipants(participants) {
      var _this4 = this;

      var currentParticipants = this.participants.concat([]).sort();
      var removing = participants.filter(function (participant) {
        return _this4.participants.indexOf(participant) !== -1;
      }).sort();
      if (JSON.stringify(currentParticipants) === JSON.stringify(removing)) {
        throw new Error(LayerError.dictionary.moreParticipantsRequired);
      }
      this._patchParticipants({ add: [], remove: removing });
      return this;
    }

    /**
     * Replaces all participants with a new array of of participant ids.
     *
     *      conversation.replaceParticipants(['a', 'b']);
     *
     * Changed participants will immediately show up in the Conversation,
     * but may not have synced with the server yet.
     *
     * TODO WEB-967: Roll participants back on getting a server error
     *
     * @method replaceParticipants
     * @param  {string[]} participants - Array of participant ids
     * @returns {layer.Conversation} this
     */

  }, {
    key: 'replaceParticipants',
    value: function replaceParticipants(participants) {
      if (!participants || !participants.length) {
        throw new Error(LayerError.dictionary.moreParticipantsRequired);
      }

      var change = this._getParticipantChange(participants, this.participants);
      this._patchParticipants(change);
      return this;
    }

    /**
     * Update the server with the new participant list.
     *
     * Executes as follows:
     *
     * 1. Updates the participants property of the local object
     * 2. Triggers a conversations:change event
     * 3. Submits a request to be sent to the server to update the server's object
     * 4. If there is an error, no errors are fired except by layer.SyncManager, but another
     *    conversations:change event is fired as the change is rolled back.
     *
     * @method _patchParticipants
     * @private
     * @param  {Object[]} operations - Array of JSON patch operation
     * @param  {Object} eventData - Data describing the change for use in an event
     */

  }, {
    key: '_patchParticipants',
    value: function _patchParticipants(change) {
      var _this5 = this;

      this._applyParticipantChange(change);
      this.isCurrentParticipant = this.participants.indexOf(this.getClient().userId) !== -1;

      var ops = [];
      change.remove.forEach(function (id) {
        ops.push({
          operation: 'remove',
          property: 'participants',
          value: id
        });
      });

      change.add.forEach(function (id) {
        ops.push({
          operation: 'add',
          property: 'participants',
          value: id
        });
      });

      this._xhr({
        url: '',
        method: 'PATCH',
        data: JSON.stringify(ops),
        headers: {
          'content-type': 'application/vnd.layer-patch+json'
        }
      }, function (result) {
        if (!result.success) _this5._load();
      });
    }

    /**
     * Internally we use `{add: [], remove: []}` instead of LayerOperations.
     *
     * So control is handed off to this method to actually apply the changes
     * to the participants array.
     *
     * @method _applyParticipantChange
     * @private
     * @param  {Object} change
     * @param  {string[]} change.add - Array of userids to add
     * @param  {string[]} change.remove - Array of userids to remove
     */

  }, {
    key: '_applyParticipantChange',
    value: function _applyParticipantChange(change) {
      var participants = [].concat(this.participants);
      change.add.forEach(function (id) {
        if (participants.indexOf(id) === -1) participants.push(id);
      });
      change.remove.forEach(function (id) {
        var index = participants.indexOf(id);
        if (index !== -1) participants.splice(index, 1);
      });
      this.participants = participants;
    }

    /**
     * Delete the Conversation from the server and removes this user as a participant.
     *
     * @method leave
     * @return null
     */

  }, {
    key: 'leave',
    value: function leave() {
      if (this.isDestroyed) throw new Error(LayerError.dictionary.isDestroyed);
      this._delete('mode=my_devices&leave=true');
    }

    /**
     * Delete the Conversation from the server, but deletion mode may cause user to remain a participant.
     *
     * This call will support various deletion modes.
     *
     * Deletion Modes:
     *
     * * layer.Constants.DELETION_MODE.ALL: This deletes the local copy immediately, and attempts to also
     *   delete the server's copy.
     * * layer.Constants.DELETION_MODE.MY_DEVICES: Deletes the local copy immediately, and attempts to delete it from all
     *   of my devices.  Other users retain access.
     * * true: For backwards compatibility thi is the same as ALL.
     *
     * MY_DEVICES does not remove this user as a participant.  That means a new Message on this Conversation will recreate the
     * Conversation for this user.  See layer.Conversation.leave() instead.
     *
     * Executes as follows:
     *
     * 1. Submits a request to be sent to the server to delete the server's object
     * 2. Delete's the local object
     * 3. If there is an error, no errors are fired except by layer.SyncManager, but the Conversation will be reloaded from the server,
     *    triggering a conversations:add event.
     *
     * @method delete
     * @param {number} deletionMode - layer.Constants.DELETION_MODE.ALL is only supported mode at this time
     * @return null
     */

  }, {
    key: 'delete',
    value: function _delete(mode) {
      if (this.isDestroyed) throw new Error(LayerError.dictionary.isDestroyed);

      var queryStr = undefined;
      switch (mode) {
        case Constants.DELETION_MODE.ALL:
        case true:
          queryStr = 'mode=all_participants';
          break;
        case Constants.DELETION_MODE.MY_DEVICES:
          queryStr = 'mode=my_devices&leave=false';
          break;
        default:
          throw new Error(LayerError.dictionary.deletionModeUnsupported);
      }

      this._delete(queryStr);
    }

    /**
     * Delete the Conversation from the server (internal version).
     *
     * This version of Delete takes a Query String that is packaged up by
     * layer.Conversation.delete and layer.Conversation.leave.
     *
     * @method _delete
     * @private
     * @param {string} queryStr - Query string for the DELETE request
     */

  }, {
    key: '_delete',
    value: function _delete(queryStr) {
      var id = this.id;
      var client = this.getClient();
      this._xhr({
        method: 'DELETE',
        url: '?' + queryStr
      }, function (result) {
        if (!result.success && (!result.data || result.data.id !== 'not_found')) Conversation.load(id, client);
      });

      this._deleted();
      this.destroy();
    }

    /**
     * The Conversation has been deleted.
     *
     * Called from WebsocketManager and from layer.Conversation.delete();
     *
     * Destroy must be called separately, and handles most cleanup.
     *
     * @method _deleted
     * @protected
     */

  }, {
    key: '_deleted',
    value: function _deleted() {
      this.trigger('conversations:delete');
    }

    /**
     * Create a new layer.Message instance within this conversation
     *
     *      var message = conversation.createMessage('hello');
     *
     *      var message = conversation.createMessage({
     *          parts: [new layer.MessagePart({
     *                      body: 'hello',
     *                      mimeType: 'text/plain'
     *                  })]
     *      });
     *
     * See layer.Message for more options for creating the message.
     *
     * @method createMessage
     * @param  {string|Object} options - If its a string, a MessagePart is created around that string.
     * @param {layer.MessagePart[]} options.parts - An array of MessageParts.  There is some tolerance for
     *                                               it not being an array, or for it being a string to be turned
     *                                               into a MessagePart.
     * @return {layer.Message}
     */

  }, {
    key: 'createMessage',
    value: function createMessage() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var messageConfig = typeof options === 'string' ? {
        parts: [{ body: options, mimeType: 'text/plain' }]
      } : options;
      messageConfig.clientId = this.clientId;
      messageConfig.conversationId = this.id;

      return new Message(messageConfig);
    }

    /**
     * Accepts json-patch operations for modifying participants or metadata
     *
     * @method _handlePatchEvent
     * @private
     * @param  {Object[]} data - Array of operations
     */

  }, {
    key: '_handlePatchEvent',
    value: function _handlePatchEvent(newValue, oldValue, paths) {
      // Certain types of __update handlers are disabled while values are being set by
      // layer patch parser because the difference between setting a value (triggers an event)
      // and change a property of a value (triggers only this callback) result in inconsistent
      // behaviors.  Enable them long enough to allow __update calls to be made
      this._inLayerParser = false;
      try {
        var events = this._disableEvents;
        this._disableEvents = false;
        if (paths[0].indexOf('metadata') === 0) {
          this.__updateMetadata(newValue, oldValue, paths);
        } else if (paths[0] === 'participants') {
          this.__updateParticipants(newValue, oldValue);
        }
        this._disableEvents = events;
      } catch (err) {
        // do nothing
      }
      this._inLayerParser = true;
    }

    /**
     * Given the oldValue and newValue for participants,
     * generate a list of whom was added and whom was removed.
     *
     * @method _getParticipantChange
     * @private
     * @param  {string[]} newValue
     * @param  {string[]} oldValue
     * @return {Object} Returns changes in the form of `{add: [...], remove: [...]}`
     */

  }, {
    key: '_getParticipantChange',
    value: function _getParticipantChange(newValue, oldValue) {
      var change = {};
      change.add = newValue.filter(function (participant) {
        return oldValue.indexOf(participant) === -1;
      });
      change.remove = oldValue.filter(function (participant) {
        return newValue.indexOf(participant) === -1;
      });
      return change;
    }

    /**
     * Updates specified metadata keys.
     *
     * Updates the local object's metadata and syncs the change to the server.
     *
     *      conversation.setMetadataProperties({
     *          'title': 'I am a title',
     *          'colors.background': 'red',
     *          'colors.text': {
     *              'fill': 'blue',
     *              'shadow': 'black'
     *           },
     *           'colors.title.fill': 'red'
     *      });
     *
     * Use setMetadataProperties to specify the path to a property, and a new value for that property.
     * Multiple properties can be changed this way.  Whatever value was there before is
     * replaced with the new value; so in the above example, whatever other keys may have
     * existed under `colors.text` have been replaced by the new object `{fill: 'blue', shadow: 'black'}`.
     *
     * Note also that only string and subobjects are accepted as values.
     *
     * Keys with '.' will update a field of an object (and create an object if it wasn't there):
     *
     * Initial metadata: {}
     *
     *      conversation.setMetadataProperties({
     *          'colors.background': 'red',
     *      });
     *
     * Metadata is now: `{colors: {background: 'red'}}`
     *
     *      conversation.setMetadataProperties({
     *          'colors.foreground': 'black',
     *      });
     *
     * Metadata is now: `{colors: {background: 'red', foreground: 'black'}}`
     *
     * Executes as follows:
     *
     * 1. Updates the metadata property of the local object
     * 2. Triggers a conversations:change event
     * 3. Submits a request to be sent to the server to update the server's object
     * 4. If there is an error, no errors are fired except by layer.SyncManager, but another
     *    conversations:change event is fired as the change is rolled back.
     *
     * @method setMetadataProperties
     * @param  {Object} properties
     * @return {layer.Conversation} this
     *
     */

  }, {
    key: 'setMetadataProperties',
    value: function setMetadataProperties(props) {
      var _this6 = this;

      var layerPatchOperations = [];
      Object.keys(props).forEach(function (name) {
        var fullName = name;
        if (name) {
          if (name !== 'metadata' && name.indexOf('metadata.') !== 0) {
            fullName = 'metadata.' + name;
          }
          layerPatchOperations.push({
            operation: 'set',
            property: fullName,
            value: props[name]
          });
        }
      });

      this._inLayerParser = true;

      // Do this before setSyncing as if there are any errors, we should never even
      // start setting up a request.
      Util.layerParse({
        object: this,
        type: 'Conversation',
        operations: layerPatchOperations,
        client: this.getClient()
      });
      this._inLayerParser = false;

      this._xhr({
        url: '',
        method: 'PATCH',
        data: JSON.stringify(layerPatchOperations),
        headers: {
          'content-type': 'application/vnd.layer-patch+json'
        }
      }, function (result) {
        if (!result.success) _this6._load();
      });

      return this;
    }

    /**
     * Deletes specified metadata keys.
     *
     * Updates the local object's metadata and syncs the change to the server.
     *
     *      conversation.deleteMetadataProperties(
     *          ['title', 'colors.background', 'colors.title.fill']
     *      );
     *
     * Use deleteMetadataProperties to specify paths to properties to be deleted.
     * Multiple properties can be deleted.
     *
     * Executes as follows:
     *
     * 1. Updates the metadata property of the local object
     * 2. Triggers a conversations:change event
     * 3. Submits a request to be sent to the server to update the server's object
     * 4. If there is an error, no errors are fired except by layer.SyncManager, but another
     *    conversations:change event is fired as the change is rolled back.
     *
     * @method deleteMetadataProperties
     * @param  {string[]} properties
     * @return {layer.Conversation}
     *
     */

  }, {
    key: 'deleteMetadataProperties',
    value: function deleteMetadataProperties(props) {
      var _this7 = this;

      var layerPatchOperations = [];
      props.forEach(function (property) {
        if (property !== 'metadata' && property.indexOf('metadata.') !== 0) {
          property = 'metadata.' + property;
        }
        layerPatchOperations.push({
          operation: 'delete',
          property: property
        });
      }, this);

      this._inLayerParser = true;

      // Do this before setSyncing as if there are any errors, we should never even
      // start setting up a request.
      Util.layerParse({
        object: this,
        type: 'Conversation',
        operations: layerPatchOperations,
        client: this.getClient()
      });
      this._inLayerParser = false;

      this._xhr({
        url: '',
        method: 'PATCH',
        data: JSON.stringify(layerPatchOperations),
        headers: {
          'content-type': 'application/vnd.layer-patch+json'
        }
      }, function (result) {
        if (!result.success) _this7._load();
      });

      return this;
    }

    /**
     * Any xhr method called on this conversation uses the conversation's url.
     *
     * For details on parameters see {@link layer.ClientAuthenticator#xhr}
     *
     * @method _xhr
     * @protected
     * @return {layer.Conversation} this
     */

  }, {
    key: '_xhr',
    value: function _xhr(args, callback) {
      var _this8 = this;

      var client = this.getClient();

      // Validation
      if (this.isDestroyed) throw new Error(LayerError.dictionary.isDestroyed);
      if (!client) throw new Error(LayerError.dictionary.clientMissing);
      if (!('url' in args)) throw new Error(LayerError.dictionary.urlRequired);
      if (args.method !== 'POST' && this.syncState === Constants.SYNC_STATE.NEW) return this;

      if (args.sync !== false) {
        if (!args.sync) args.sync = {};
        if (!args.sync.target) {
          args.sync.target = this.id;
        }
      }

      if (args.url && !args.url.match(/^(\/|\?)/)) args.url = '/' + args.url;
      if (!args.sync) args.url = this.url + args.url;

      if (args.method && args.method !== 'GET') {
        this._setSyncing();
      }

      client.xhr(args, function (result) {
        if (args.method && args.method !== 'GET' && !_this8.isDestroyed) {
          _this8._setSynced();
        }
        if (callback) callback(result);
      });

      return this;
    }
  }, {
    key: '_getUrl',
    value: function _getUrl(url) {
      return this.url + (url || '');
    }
  }, {
    key: '_loaded',
    value: function _loaded(data) {
      this.getClient()._addConversation(this);
    }

    /**
     * Standard `on()` provided by layer.Root.
     *
     * Adds some special handling of 'conversations:loaded' so that calls such as
     *
     *      var c = client.getConversation('layer:///conversations/123', true)
     *      .on('conversations:loaded', function() {
     *          myrerender(c);
     *      });
     *      myrender(c); // render a placeholder for c until the details of c have loaded
     *
     * can fire their callback regardless of whether the client loads or has
     * already loaded the Conversation.
     *
     * @method on
     * @param  {string} eventName
     * @param  {Function} callback
     * @param  {Object} context
     * @return {layer.Conversation} this
     */

  }, {
    key: 'on',
    value: function on(name, callback, context) {
      var hasLoadedEvt = name === 'conversations:loaded' || name && (typeof name === 'undefined' ? 'undefined' : _typeof(name)) === 'object' && name['conversations:loaded'];

      if (hasLoadedEvt && !this.isLoading) {
        (function () {
          var callNow = name === 'conversations:loaded' ? callback : name['conversations:loaded'];
          Util.defer(function () {
            return callNow.apply(context);
          });
        })();
      }
      _get(Object.getPrototypeOf(Conversation.prototype), 'on', this).call(this, name, callback, context);

      return this;
    }

    /*
     * Insure that conversation.unreadCount-- can never reduce the value to negative values.
     */

  }, {
    key: '__adjustUnreadCount',
    value: function __adjustUnreadCount(newValue) {
      if (newValue < 0) return 0;
    }

    /**
     * __ Methods are automatically called by property setters.
     *
     * Any change in the unreadCount property will call this method and fire a
     * change event.
     *
     * Any triggering of this from a websocket patch unread_message_count should wait a second before firing any events
     * so that if there are a series of these updates, we don't see a lot of jitter.
     *
     * NOTE: _oldUnreadCount is used to pass data to _updateUnreadCountEvent because this method can be called many times
     * a second, and we only want to trigger this with a summary of changes rather than each individual change.
     *
     * @method __updateUnreadCount
     * @private
     * @param  {number} newValue
     * @param  {number} oldValue
     */

  }, {
    key: '__updateUnreadCount',
    value: function __updateUnreadCount(newValue, oldValue) {
      var _this9 = this;

      if (this._inLayerParser) {
        if (this._oldUnreadCount === undefined) this._oldUnreadCount = oldValue;
        if (this._updateUnreadCountTimeout) clearTimeout(this._updateUnreadCountTimeout);
        this._updateUnreadCountTimeout = setTimeout(function () {
          return _this9._updateUnreadCountEvent();
        }, 1000);
      } else {
        this._updateUnreadCountEvent();
      }
    }

    /**
     * Fire events related to changes to unreadCount
     *
     * @method _updateUnreadCountEvent
     * @private
     */

  }, {
    key: '_updateUnreadCountEvent',
    value: function _updateUnreadCountEvent() {
      if (this.isDestroyed) return;
      var oldValue = this._oldUnreadCount;
      var newValue = this.__unreadCount;
      this._oldUnreadCount = undefined;

      if (newValue === oldValue) return;
      this._triggerAsync('conversations:change', {
        newValue: newValue,
        oldValue: oldValue,
        property: 'unreadCount'
      });
    }

    /**
     * __ Methods are automatically called by property setters.
     *
     * Any change in the lastMessage pointer will call this method and fire a
     * change event.  Changes to properties within the lastMessage object will
     * not trigger this call.
     *
     * @method __updateLastMessage
     * @private
     * @param  {layer.Message} newValue
     * @param  {layer.Message} oldValue
     */

  }, {
    key: '__updateLastMessage',
    value: function __updateLastMessage(newValue, oldValue) {
      if (newValue && oldValue && newValue.id === oldValue.id) return;
      this._triggerAsync('conversations:change', {
        property: 'lastMessage',
        newValue: newValue,
        oldValue: oldValue
      });
    }

    /**
     * __ Methods are automatically called by property setters.
     *
     * Any change in the participants property will call this method and fire a
     * change event.  Changes to the participants array that don't replace the array
     * with a new array will require directly calling this method.
     *
     * @method __updateParticipants
     * @private
     * @param  {string[]} newValue
     * @param  {string[]} oldValue
     */

  }, {
    key: '__updateParticipants',
    value: function __updateParticipants(newValue, oldValue) {
      if (this._inLayerParser) return;
      var change = this._getParticipantChange(newValue, oldValue);
      if (change.add.length || change.remove.length) {
        change.property = 'participants';
        change.oldValue = oldValue;
        change.newValue = newValue;
        this._triggerAsync('conversations:change', change);
      }
    }

    /**
     * __ Methods are automatically called by property setters.
     *
     * Any change in the metadata property will call this method and fire a
     * change event.  Changes to the metadata object that don't replace the object
     * with a new object will require directly calling this method.
     *
     * @method __updateMetadata
     * @private
     * @param  {Object} newValue
     * @param  {Object} oldValue
     */

  }, {
    key: '__updateMetadata',
    value: function __updateMetadata(newValue, oldValue, paths) {
      if (this._inLayerParser) return;
      if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
        this._triggerAsync('conversations:change', {
          property: 'metadata',
          newValue: newValue,
          oldValue: oldValue,
          paths: paths
        });
      }
    }

    /**
     * Returns a plain object.
     *
     * Object will have all the same public properties as this
     * Conversation instance.  New object is returned any time
     * any of this object's properties change.
     *
     * @method toObject
     * @return {Object} POJO version of this.
     */

  }, {
    key: 'toObject',
    value: function toObject() {
      if (!this._toObject) {
        this._toObject = _get(Object.getPrototypeOf(Conversation.prototype), 'toObject', this).call(this);
        this._toObject.metadata = Util.clone(this.metadata);
        this._toObject.isNew = this.isNew();
        this._toObject.isSaving = this.isSaving();
        this._toObject.isSaved = this.isSaved();
        this._toObject.isSynced = this.isSynced();
      }
      return this._toObject;
    }
  }, {
    key: '_triggerAsync',
    value: function _triggerAsync(evtName, args) {
      this._clearObject();
      _get(Object.getPrototypeOf(Conversation.prototype), '_triggerAsync', this).call(this, evtName, args);
    }
  }, {
    key: 'trigger',
    value: function trigger(evtName, args) {
      this._clearObject();
      _get(Object.getPrototypeOf(Conversation.prototype), 'trigger', this).call(this, evtName, args);
    }

    /**
     * Create a conversation instance from a server representation of the conversation.
     *
     * If the Conversation already exists, will update the existing copy with
     * presumably newer values.
     *
     * @method _createFromServer
     * @protected
     * @static
     * @param  {Object} conversation - Server representation of a Conversation
     * @param  {layer.Client} client [description]
     * @return {layer.Conversation}        [description]
     */

  }], [{
    key: '_createFromServer',
    value: function _createFromServer(conversation, client) {
      // If the Conversation already exists in cache, update the cache
      return new Conversation({
        client: client,
        fromServer: conversation,
        _fromDB: conversation._fromDB
      });
    }

    /**
     * Find or create a new converation.
     *
     *      var conversation = layer.Conversation.create({
     *          participants: ['a', 'b'],
     *          distinct: true,
     *          metadata: {
     *              title: 'I am not a title!'
     *          },
     *          client: client,
     *          'conversations:loaded': function(evt) {
     *
     *          }
     *      });
     *
     * Only tries to find a Conversation if its a Distinct Conversation.
     * Distinct defaults to true.
     *
     * Recommend using `client.createConversation({...})`
     * instead of `Conversation.create({...})`.
     *
     * @method create
     * @static
     * @protected
     * @param  {Object} options
     * @param  {layer.Client} options.client
     * @param  {string[]} options.participants - Array of participant ids
     * @param {boolean} [options.distinct=false] - Create a distinct conversation
     * @param {Object} [options.metadata={}] - Initial metadata for Conversation
     * @return {layer.Conversation}
     */

  }, {
    key: 'create',
    value: function create(options) {
      if (!options.client) throw new Error(LayerError.dictionary.clientMissing);
      if (options.distinct) {
        var conv = this._createDistinct(options);
        if (conv) return conv;
      }

      return new Conversation(options);
    }

    /**
     * Create or Find a Distinct Conversation.
     *
     * If the static Conversation.create method gets a request for a Distinct Conversation,
     * see if we have one cached.
     *
     * Will fire the 'conversations:loaded' event if one is provided in this call,
     * and a Conversation is found.
     *
     * @method _createDistinct
     * @static
     * @private
     * @param  {Object} options - See layer.Conversation.create options
     * @return {layer.Conversation}
     */

  }, {
    key: '_createDistinct',
    value: function _createDistinct(options) {
      if (options.participants.indexOf(options.client.userId) === -1) {
        options.participants.push(options.client.userId);
      }

      var participants = options.participants.sort();
      var pString = participants.join(',');

      var conv = options.client.findCachedConversation(function (aConv) {
        if (aConv.distinct && aConv.participants.length === participants.length) {
          var participants2 = aConv.participants.sort();
          return participants2.join(',') === pString;
        }
      });

      if (conv) {
        conv._sendDistinctEvent = new LayerEvent({
          target: conv,
          result: !options.metadata || Util.doesObjectMatch(options.metadata, conv.metadata) ? Conversation.FOUND : Conversation.FOUND_WITHOUT_REQUESTED_METADATA
        }, 'conversations:sent');
        return conv;
      }
    }

    /**
     * Identifies whether a Conversation receiving the specified patch data should be loaded from the server.
     *
     * Any change to a Conversation indicates that the Conversation is active and of potential interest; go ahead and load that
     * Conversation in case the app has need of it.  In the future we may ignore changes to unread count.  Only relevant
     * when we get Websocket events for a Conversation that has not been loaded/cached on Client.
     *
     * @method _loadResourceForPatch
     * @static
     * @private
     */

  }, {
    key: '_loadResourceForPatch',
    value: function _loadResourceForPatch(patchData) {
      return true;
    }
  }]);

  return Conversation;
}(Syncable);

/**
 * Array of participant ids.
 *
 * Do not directly manipulate;
 * use addParticipants, removeParticipants and replaceParticipants
 * to manipulate the array.
 *
 * @type {string[]}
 */


Conversation.prototype.participants = null;

/**
 * layer.Client that the conversation belongs to.
 *
 * Actual value of this string matches the appId.
 * @type {string}
 */
Conversation.prototype.clientId = '';

/**
 * Time that the conversation was created on the server.
 *
 * @type {Date}
 */
Conversation.prototype.createdAt = null;

/**
 * Conversation unique identifier.
 *
 * @type {string}
 */
Conversation.prototype.id = '';

/**
 * URL to access the conversation on the server.
 *
 * @type {string}
 */
Conversation.prototype.url = '';

/**
 * Number of unread messages in the conversation.
 *
 * @type {number}
 */
Conversation.prototype.unreadCount = 0;

/**
 * This is a Distinct Conversation.
 *
 * You can have 1 distinct conversation among a set of participants.
 * There are no limits to how many non-distinct Conversations you have have
 * among a set of participants.
 *
 * @type {boolean}
 */
Conversation.prototype.distinct = true;

/**
 * Metadata for the conversation.
 *
 * Metadata values can be plain objects and strings, but
 * no arrays, numbers, booleans or dates.
 * @type {Object}
 */
Conversation.prototype.metadata = null;

/**
 * Time that the conversation object was instantiated
 * in the current client.
 * @type {Date}
 */
Conversation.prototype.localCreatedAt = null;

/**
 * The authenticated user is a current participant in this Conversation.
 *
 * Set to false if the authenticated user has been removed from this conversation.
 *
 * A removed user can see messages up to the time they were removed,
 * but can no longer interact with the conversation.
 *
 * A removed user can no longer see the participant list.
 *
 * Read and Delivery receipts will fail on any Message in such a Conversation.
 *
 * @type {Boolean}
 */
Conversation.prototype.isCurrentParticipant = true;

/**
 * The last layer.Message to be sent/received for this Conversation.
 *
 * Value may be a Message that has been locally created but not yet received by server.
 * @type {layer.Message}
 */
Conversation.prototype.lastMessage = null;

/**
 * Caches last result of toObject()
 * @type {Object}
 * @private
 */
Conversation.prototype._toObject = null;

Conversation.eventPrefix = 'conversations';

/**
 * Cache's a Distinct Event.
 *
 * On creating a Distinct Conversation that already exists,
 * when the send() method is called, we should trigger
 * specific events detailing the results.  Results
 * may be determined locally or on the server, but same Event may be needed.
 *
 * @type {layer.LayerEvent}
 * @private
 */
Conversation.prototype._sendDistinctEvent = null;

Conversation.prototype._fromDB = false;

/**
 * Prefix to use when generating an ID for instances of this class
 * @type {String}
 * @static
 * @private
 */
Conversation.prefixUUID = 'layer:///conversations/';

/**
 * Property to look for when bubbling up events.
 * @type {String}
 * @static
 * @private
 */
Conversation.bubbleEventParent = 'getClient';

/**
 * The Conversation that was requested has been created.
 *
 * Used in 'conversations:sent' events.
 * @type {String}
 * @static
 */
Conversation.CREATED = 'Created';

/**
 * The Conversation that was requested has been found.
 *
 * This means that it did not need to be created.
 *
 * Used in 'conversations:sent' events.
 * @type {String}
 * @static
 */
Conversation.FOUND = 'Found';

/**
 * The Conversation that was requested has been found, but there was a mismatch in metadata.
 *
 * If the createConversation request contained metadata and it did not match the Distinct Conversation
 * that matched the requested participants, then this value is passed to notify your app that the Conversation
 * was returned but does not exactly match your request.
 *
 * Used in 'conversations:sent' events.
 * @type {String}
 * @static
 */
Conversation.FOUND_WITHOUT_REQUESTED_METADATA = 'FoundMismatch';

Conversation._supportedEvents = [

/**
 * The conversation is now on the server.
 *
 * Called after successfully creating the conversation
 * on the server.  The Result property is one of:
 *
 * * Conversation.CREATED: A new Conversation has been created
 * * Conversation.FOUND: A matching Distinct Conversation has been found
 * * Conversation.FOUND_WITHOUT_REQUESTED_METADATA: A matching Distinct Conversation has been found
 *                       but note that the metadata is NOT what you requested.
 *
 * All of these results will also mean that the updated property values have been
 * copied into your Conversation object.  That means your metadata property may no
 * longer be its initial value; it may be the value found on the server.
 *
 * @event
 * @param {layer.LayerEvent} event
 * @param {string} event.result
 */
'conversations:sent',

/**
 * An attempt to send this conversation to the server has failed.
 * @event
 * @param {layer.LayerEvent} event
 * @param {layer.LayerError} event.error
 */
'conversations:sent-error',

/**
 * The conversation is now loaded from the server.
 *
 * Note that this is only used in response to the layer.Conversation.load() method.
 * from the server.
 * @event
 * @param {layer.LayerEvent} event
 */
'conversations:loaded',

/**
 * An attempt to load this conversation from the server has failed.
 *
 * Note that this is only used in response to the layer.Conversation.load() method.
 * @event
 * @param {layer.LayerEvent} event
 * @param {layer.LayerError} event.error
 */
'conversations:loaded-error',

/**
 * The conversation has been deleted from the server.
 *
 * Caused by either a successful call to delete() on this instance
 * or by a remote user.
 * @event
 * @param {layer.LayerEvent} event
 */
'conversations:delete',

/**
 * This conversation has changed.
 *
 * @event
 * @param {layer.LayerEvent} event
 * @param {Object[]} event.changes - Array of changes reported by this event
 * @param {Mixed} event.changes.newValue
 * @param {Mixed} event.changes.oldValue
 * @param {string} event.changes.property - Name of the property that changed
 * @param {layer.Conversation} event.target
 */
'conversations:change'].concat(Syncable._supportedEvents);

Root.initClass.apply(Conversation, [Conversation, 'Conversation']);
Syncable.subclasses.push(Conversation);
module.exports = Conversation;

},{"./client-registry":9,"./client-utils":10,"./const":12,"./layer-error":16,"./layer-event":17,"./logger":18,"./message":20,"./root":24,"./syncable":27}],15:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Persistence manager.
 *
 * This class manages all indexedDB access.  It is not responsible for any localStorage access, though it may
 * receive configurations related to data stored in localStorage.  It will simply ignore those configurations.
 *
 * TODO:
 * 0. Redesign this so that knowledge of the data is not hard-coded in
 * 1. JSDuck this class
 * 2. Update documentation repo
 * @class layer.db-manager
 * @protected
 */

var DB_VERSION = 13;
var Root = require('./root');
var logger = require('./logger');
var SyncEvent = require('./sync-event');
var Constants = require('./const');
var Util = require('./client-utils');

function getDate(inDate) {
  return inDate ? inDate.toISOString() : null;
}

var DbManager = function (_Root) {
  _inherits(DbManager, _Root);

  /**
   * Create the DB Manager
   *
   * Key configuration is the layer.DbManager.persistenceFeatures property.
   *
   * @param {Object} options
   * @param {layer.Client} options.client
   * @param {Object} options.persistenceFeatures
   * @return {layer.DbManager} this
   */

  function DbManager(options) {
    _classCallCheck(this, DbManager);

    // If Client is a layer.ClientAuthenticator, it won't support these events; this affects Unit Tests

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(DbManager).call(this, options));

    if (_this.client.constructor._supportedEvents.indexOf('conversations:add') !== -1) {
      _this.client.on('conversations:add', function (evt) {
        return _this.writeConversations(evt.conversations, false);
      });
      _this.client.on('conversations:change', function (evt) {
        return _this.writeConversations([evt.target], true);
      });
      _this.client.on('conversations:delete', function (evt) {
        return _this.deleteObjects('conversations', [evt.target]);
      });

      _this.client.on('messages:add', function (evt) {
        return _this.writeMessages(evt.messages, false);
      });
      _this.client.on('messages:change', function (evt) {
        return _this.writeMessages([evt.target], true);
      });
      _this.client.on('messages:delete', function (evt) {
        return _this.deleteObjects('messages', [evt.target]);
      });
    }

    _this.client.syncManager.on('sync:add', function (evt) {
      return _this.writeSyncEvents([evt.request], false);
    });
    _this.client.syncManager.on('sync:abort sync:error', function (evt) {
      return _this.deleteObjects('syncQueue', [evt.request]);
    });

    // If no indexedDB, treat everything as disabled.
    if (!window.indexedDB) {
      _this.tables = {
        identities: true,
        conversations: true,
        messages: true,
        syncQueue: true
      };
    }

    // Sync Queue only really works properly if we have the Messages and Conversations written to the DB; turn it off
    // if that won't be the case.
    if (!_this.tables.conversations || !_this.tables.messages) {
      _this.tables.syncQueue = false;
    }
    _this._open();
    return _this;
  }

  /**
   * Open the Database Connection.
   *
   * This is only called by the constructor.
   * @method _open
   * @private
   */


  _createClass(DbManager, [{
    key: '_open',
    value: function _open() {
      var _this2 = this;

      // Abort if all tables are disabled
      if (Object.keys(this.tables).filter(function (key) {
        return _this2.tables[key];
      }).length === 0) return;

      // Open the database
      var request = window.indexedDB.open('LayerWebSDK_' + this.client.appId + '_' + this.client.userId, DB_VERSION);

      request.onerror = function (evt) {
        return console.error('Database Unable to Open: ', evt.target.error);
      };
      request.onupgradeneeded = function (evt) {
        return _this2._onUpgradeNeeded(evt);
      };
      request.onsuccess = function (evt) {
        _this2.db = evt.target.result;
        _this2.isOpen = true;
        _this2.trigger('open');

        _this2.db.onversionchange = function () {
          _this2.db.close();
          _this2.isOpen = false;
        };

        _this2.db.error = function (err) {
          logger.error('db-manager Error: ', err);
        };
      };
    }

    /**
     * Use this to setup a call to happen as soon as the database is open.
     *
     * Typically, this call will immediately, synchronously call your callback.
     * But if the DB is not open yet, your callback will be called once its open.
     * @method onOpen
     * @param {Function} callback
     */

  }, {
    key: 'onOpen',
    value: function onOpen(callback) {
      if (this.isOpen) callback();else this.once('open', callback);
    }

    /**
     * The onUpgradeNeeded function is called by IndexedDB any time DB_VERSION is incremented.
     *
     * This invocation is part of the built-in lifecycle of IndexedDB.
     *
     * @method _onUpgradeNeeded
     * @param {IDBVersionChangeEvent} event
     * @private
     */
    /* istanbul ignore next */

  }, {
    key: '_onUpgradeNeeded',
    value: function _onUpgradeNeeded(event) {
      var db = event.target.result;
      try {
        db.deleteObjectStore('conversations');
      } catch (e) {
        // Noop
      }
      try {
        db.deleteObjectStore('identities');
      } catch (e) {
        // Noop
      }
      try {
        db.deleteObjectStore('messages');
      } catch (e) {
        // Noop
      }
      try {
        db.deleteObjectStore('syncQueue');
      } catch (e) {
        // Noop
      }
      var stores = [db.createObjectStore('conversations', { keyPath: 'id' }), db.createObjectStore('messages', { keyPath: 'id' }), db.createObjectStore('identities', { keyPath: 'id' }), db.createObjectStore('syncQueue', { keyPath: 'id' })];

      stores[1].createIndex('conversation', 'conversation', { unique: false });

      var completeCount = 0;
      function onComplete() {
        completeCount++;
        if (completeCount === stores.length) {
          this.isOpen = true;
          this.trigger('open');
        }
      }

      stores.forEach(function (store) {
        return store.transaction.oncomplete = onComplete;
      });
    }

    /**
     * Convert array of Conversation instances into Conversation DB Entries.
     *
     * A Conversation DB entry looks a lot like the server representation, but
     * includes a sync_state property, and `last_message` contains a message ID not
     * a Message object.
     *
     * @method _getConversationData
     * @private
     * @param {layer.Conversation[]} conversations
     * @return {Object[]} conversations
     */

  }, {
    key: '_getConversationData',
    value: function _getConversationData(conversations) {
      return conversations.filter(function (conversation) {
        if (conversation._fromDB) {
          conversation._fromDB = false;
          return false;
        } else if (conversation.isLoading) {
          return false;
        } else {
          return true;
        }
      }).map(function (conversation) {
        var item = {
          id: conversation.id,
          url: conversation.url,
          participants: conversation.participants,
          distinct: conversation.distinct,
          created_at: getDate(conversation.createdAt),
          metadata: conversation.metadata,
          unread_message_count: conversation.unreadCount,
          last_message: conversation.lastMessage ? conversation.lastMessage.id : '',
          sync_state: conversation.syncState
        };
        return item;
      });
    }

    /**
     * Writes an array of Conversations to the Database.
     *
     * There are times when you will not know if this is an Insert or Update operation;
     * if there is uncertainy, set `isUpdate` to false, and the correct end result will
     * still be achieved (but less efficiently).
     *
     * @method writeConversations
     * @param {layer.Conversation[]} conversations - Array of Conversations to write
     * @param {boolean} isUpdate - If true, then update an entry; if false, insert an entry... and if one is found to already exist, update it.
     * @param {Function} [callback]
     */

  }, {
    key: 'writeConversations',
    value: function writeConversations(conversations, isUpdate, callback) {
      this._writeObjects('conversations', this._getConversationData(conversations.filter(function (conversation) {
        return !conversation.isDestroyed;
      })), isUpdate, callback);
    }

    /**
     * Convert array of Message instances into Message DB Entries.
     *
     * A Message DB entry looks a lot like the server representation, but
     * includes a sync_state property.
     *
     * @method _getMessageData
     * @private
     * @param {layer.Message[]} messages
     * @return {Object[]} messages
     */

  }, {
    key: '_getMessageData',
    value: function _getMessageData(messages) {
      return messages.filter(function (message) {
        if (message._fromDB) {
          message._fromDB = false;
          return false;
        } else if (message.syncState === Constants.SYNC_STATE.LOADING) {
          return false;
        } else {
          return true;
        }
      }).map(function (message) {
        return {
          id: message.id,
          url: message.url,
          parts: message.parts.map(function (part) {
            return {
              id: part.id,
              body: part.body,
              encoding: part.encoding,
              mime_type: part.mimeType,
              content: !part._content ? null : {
                id: part._content.id,
                download_url: part._content.downloadUrl,
                expiration: part._content.expiration,
                refresh_url: part._content.refreshUrl,
                size: part._content.size
              }
            };
          }),
          position: message.position,
          sender: {
            name: message.sender.name,
            user_id: message.sender.userId
          },
          recipient_status: message.recipientStatus,
          sent_at: getDate(message.sentAt),
          received_at: getDate(message.receivedAt),
          conversation: message.constructor.prefixUUID === 'layer:///announcements/' ? 'announcement' : message.conversationId,
          sync_state: message.syncState
        };
      });
    }

    /**
     * Writes an array of Messages to the Database.
     *
     * There are times when you will not know if this is an Insert or Update operation;
     * if there is uncertainy, set `isUpdate` to false, and the correct end result will
     * still be achieved (but less efficiently).
     *
     * @method writeMessages
     * @param {layer.Message[]} messages - Array of Messages to write
     * @param {boolean} isUpdate - If true, then update an entry; if false, insert an entry... and if one is found to already exist, update it.
     * @param {Function} [callback]
     */

  }, {
    key: 'writeMessages',
    value: function writeMessages(messages, isUpdate, callback) {
      this._writeObjects('messages', this._getMessageData(messages.filter(function (message) {
        return !message.isDestroyed;
      })), isUpdate, callback);
    }

    /**
     * Convert array of SyncEvent instances into SyncEvent DB Entries.
     *
     * @method _getSyncEventData
     * @param {layer.SyncEvent[]} syncEvents
     * @return {Object[]} syncEvents
     * @private
     */

  }, {
    key: '_getSyncEventData',
    value: function _getSyncEventData(syncEvents) {
      return syncEvents.filter(function (syncEvt) {
        if (syncEvt.fromDB) {
          syncEvt.fromDB = false;
          return false;
        } else {
          return true;
        }
      }).map(function (syncEvent) {
        var item = {
          id: syncEvent.id,
          target: syncEvent.target,
          depends: syncEvent.depends,
          isWebsocket: syncEvent instanceof SyncEvent.WebsocketSyncEvent,
          operation: syncEvent.operation,
          data: syncEvent.data,
          url: syncEvent.url || '',
          headers: syncEvent.headers || null,
          method: syncEvent.method || null,
          created_at: syncEvent.createdAt
        };
        return item;
      });
    }

    /**
     * Writes an array of SyncEvent to the Database.
     *
     * @method writeSyncEvents
     * @param {layer.SyncEvent[]} syncEvents - Array of Sync Events to write
     * @param {boolean} isUpdate - If true, then update an entry; if false, insert an entry... and if one is found to already exist, update it.
     * @param {Function} [callback]
     */

  }, {
    key: 'writeSyncEvents',
    value: function writeSyncEvents(syncEvents, isUpdate, callback) {
      this._writeObjects('syncQueue', this._getSyncEventData(syncEvents), isUpdate, callback);
    }

    /**
     * Write an array of data to the specified Database table.
     *
     * @method _writeObjects
     * @param {string} tableName - The name of the table to write to
     * @param {Object[]} data - Array of POJO data to write
     * @param {Boolean} isUpdate - If true, then update an entry; if false, insert an entry... and if one is found to already exist, update it.
     * @param {Function} [callback] - Called when all data is written
     * @protected
     */

  }, {
    key: '_writeObjects',
    value: function _writeObjects(tableName, data, isUpdate, callback) {
      var _this3 = this;

      // Just quit if no data to write
      if (!data.length) {
        if (callback) callback();
        return;
      }

      // transactionComplete will call the callback after all writes are done.
      // Note that the number of transactions is 1 + number of failed inserts
      var transactionCount = 1,
          transactionCompleteCount = 0;
      function transactionComplete() {
        transactionCompleteCount++;
        if (transactionCompleteCount === transactionCount && callback) callback();
      }

      // PUT (udpate) or ADD (insert) each item of data one at a time, but all as part of one large transaction.
      this.onOpen(function () {
        var transaction = _this3.db.transaction([tableName], 'readwrite');
        var store = transaction.objectStore(tableName);
        transaction.oncomplete = transaction.onerror = transactionComplete;

        data.forEach(function (item) {
          var req = isUpdate ? store.put(item) : store.add(item);

          // If the request fails, and we were doing an insert, try an update instead.
          // This will create one transaction per error.
          // TODO: Investigate capturing all errors and then using a single transaction to update all failed items.
          req.onerror = function () {
            if (!isUpdate) {
              transactionCount++;
              var transaction2 = _this3.db.transaction([tableName], 'readwrite');
              var store2 = transaction2.objectStore(tableName);
              transaction2.oncomplete = transaction2.onerror = transactionComplete;
              store2.put(item);
            }
          };
        });
      });
    }

    /**
     * Load all conversations from the database.
     *
     * @method loadConversations
     * @param {Function} callback
     * @param {layer.Conversation[]} callback.result
     */

  }, {
    key: 'loadConversations',
    value: function loadConversations(callback) {
      var _this4 = this;

      // Step 1: Get all Conversations
      this._loadAll('conversations', function (data) {

        // Step 2: Gather all Message IDs needed to initialize these Conversation's lastMessage properties.
        var messagesToLoad = data.map(function (item) {
          return item.last_message;
        }).filter(function (messageId) {
          return messageId && !_this4.client.getMessage(messageId);
        });

        // Step 3: Load all Messages needed to initialize these Conversation's lastMessage properties.
        _this4.getObjects('messages', messagesToLoad, function (messages) {
          _this4._loadConversationsResult(data, messages, callback);
        });
      });
    }

    /**
     * Assemble all LastMessages and Conversation POJOs into layer.Message and layer.Conversation instances.
     *
     * @method _loadConversationsResult
     * @private
     * @param {Object[]} conversations
     * @param {Object[]} messages
     * @param {Function} callback
     * @param {layer.Conversation[]} callback.result
     */

  }, {
    key: '_loadConversationsResult',
    value: function _loadConversationsResult(conversations, messages, callback) {
      var _this5 = this;

      // Instantiate and Register each Message
      messages.forEach(function (message) {
        return _this5._createMessage(message);
      });

      // Instantiate and Register each Conversation; will find any lastMessage that was registered.
      conversations.forEach(function (conversation) {
        return _this5._createConversation(conversation);
      });
      var newData = conversations.map(function (conversation) {
        return _this5.client.getConversation(conversation.id);
      }).filter(function (conversation) {
        return conversation;
      });

      // Return the data
      if (callback) callback(newData);
    }

    /**
     * Load all messages for a given Conversation ID from the database.
     *
     * Use _loadAll if loading All Messages rather than all Messages for a Conversation.
     *
     * @method loadMessages
     * @param {string} conversationId - ID of the Conversation whose Messages are of interest.
     * @param {Function} callback
     * @param {layer.Message[]} callback.result
     */

  }, {
    key: 'loadMessages',
    value: function loadMessages(conversationId, callback) {
      var _this6 = this;

      this._loadByIndex('messages', 'conversation', conversationId, function (data) {
        _this6._loadMessagesResult(data, callback);
      });
    }

    /**
     * Load all Announcements from the database.
     *
     * @method loadAnnouncements
     * @param {Function} callback
     * @param {layer.Announcement[]} callback.result
     */

  }, {
    key: 'loadAnnouncements',
    value: function loadAnnouncements(callback) {
      var _this7 = this;

      this._loadByIndex('messages', 'conversation', 'announcement', function (data) {
        _this7._loadMessagesResult(data, callback);
      });
    }

    /**
     * Registers and sorts the message objects from the database.
     *
     * TODO: Encode limits on this, else we are sorting tens of thousands
     * of messages in javascript.
     *
     * @method _loadMessagesResult
     * @private
     * @param {Object[]} Message objects from the database.
     * @param {Function} callback
     * @param {layer.Message} callback.result - Message instances created from the database
     */

  }, {
    key: '_loadMessagesResult',
    value: function _loadMessagesResult(messages, callback) {
      var _this8 = this;

      // Instantiate and Register each Message
      messages.forEach(function (message) {
        return _this8._createMessage(message);
      });

      // Retrieve all Messages registered or preregistered in this way
      var newData = messages.map(function (message) {
        return _this8.client.getMessage(message.id);
      }).filter(function (message) {
        return message;
      });

      // Sort the results by position
      Util.sortBy(newData, function (item) {
        return item.position;
      });

      // Return the results
      if (callback) callback(newData);
    }

    /**
     * Instantiate and Register the Conversation from a conversation DB Entry.
     *
     * If the layer.Conversation already exists, then its presumed that whatever is in
     * javascript cache is more up to date than whats in IndexedDB cache.
     *
     * Attempts to assign the lastMessage property to refer to appropriate Message.  If it fails,
     * it will be set to null.
     *
     * @method _createConversation
     * @param {Object} conversation
     * @returns {layer.Conversation}
     */

  }, {
    key: '_createConversation',
    value: function _createConversation(conversation) {
      if (!this.client.getConversation(conversation.id)) {
        conversation._fromDB = true;
        var lastMessage = conversation.last_message;
        conversation.last_message = '';
        var newConversation = this.client._createObject(conversation);
        newConversation.syncState = conversation.sync_state;
        newConversation.lastMessage = this.client.getMessage(lastMessage) || null;
        return newConversation;
      }
    }

    /**
     * Instantiate and Register the Message from a message DB Entry.
     *
     * If the layer.Message already exists, then its presumed that whatever is in
     * javascript cache is more up to date than whats in IndexedDB cache.
     *
     * @method _createMessage
     * @param {Object} message
     * @returns {layer.Message}
     */

  }, {
    key: '_createMessage',
    value: function _createMessage(message) {
      if (!this.client.getMessage(message.id)) {
        message._fromDB = true;
        message.conversation = { id: message.conversation };
        var newMessage = this.client._createObject(message);
        newMessage.syncState = message.sync_state;
        return newMessage;
      }
    }

    /**
     * Load all Sync Events from the database.
     *
     * @method loadSyncQueue
     * @param {Function} callback
     * @param {layer.SyncEvent[]} callback.result
     */

  }, {
    key: 'loadSyncQueue',
    value: function loadSyncQueue(callback) {
      var _this9 = this;

      this._loadAll('syncQueue', function (syncEvents) {
        _this9._loadSyncEventRelatedData(syncEvents, callback);
      });
    }

    /**
     * Validate that we have appropriate data for each SyncEvent and instantiate it.
     *
     * Any operation that is not a DELETE must have a valid target found in the database or javascript cache,
     * otherwise it can not be executed.
     *
     * TODO: Need to cleanup sync entries that have invalid targets
     *
     * @method _loadSyncEventRelatedData
     * @private
     * @param {Object[]} syncEvents
     * @param {layer.SyncEvent[]} callback.result
     */

  }, {
    key: '_loadSyncEventRelatedData',
    value: function _loadSyncEventRelatedData(syncEvents, callback) {
      var _this10 = this;

      // Gather all Message IDs that are targets of operations.
      var messageIds = syncEvents.filter(function (item) {
        return item.operation !== 'DELETE' && item.target && item.target.match(/messages/);
      }).map(function (item) {
        return item.target;
      });

      // Gather all Conversation IDs that are targets of operations.
      var conversationIds = syncEvents.filter(function (item) {
        return item.operation !== 'DELETE' && item.target && item.target.match(/conversations/);
      }).map(function (item) {
        return item.target;
      });

      // Load any Messages/Conversations that are targets of operations.
      // Call _createMessage or _createConversation on all targets found.
      this.getObjects('messages', messageIds, function (messages) {
        messages.forEach(function (message) {
          return _this10._createMessage(message);
        });
        _this10.getObjects('conversations', conversationIds, function (conversations) {
          conversations.forEach(function (conversation) {
            return _this10._createConversation(conversation);
          });
          _this10._loadSyncEventResults(syncEvents, callback);
        });
      });
    }

    /**
     * Turn an array of Sync Event DB Entries into an array of layer.SyncEvent.
     *
     * @method _loadSyncEventResults
     * @private
     * @param {Object[]} syncEvents
     * @param {layer.SyncEvent[]} callback.result
     */

  }, {
    key: '_loadSyncEventResults',
    value: function _loadSyncEventResults(syncEvents, callback) {
      var _this11 = this;

      // If the target is present in the sync event, but does not exist in the system,
      // do NOT attempt to instantiate this event... unless its a DELETE operation.
      var newData = syncEvents.filter(function (syncEvent) {
        var hasTarget = Boolean(syncEvent.target && _this11.client._getObject(syncEvent.target));
        return syncEvent.operation === 'DELETE' || hasTarget;
      }).map(function (syncEvent) {
        if (syncEvent.isWebsocket) {
          return new SyncEvent.WebsocketSyncEvent({
            target: syncEvent.target,
            depends: syncEvent.depends,
            operation: syncEvent.operation,
            id: syncEvent.id,
            data: syncEvent.data,
            fromDB: true,
            createdAt: syncEvent.created_at
          });
        } else {
          return new SyncEvent.XHRSyncEvent({
            target: syncEvent.target,
            depends: syncEvent.depends,
            operation: syncEvent.operation,
            id: syncEvent.id,
            data: syncEvent.data,
            method: syncEvent.method,
            headers: syncEvent.headers,
            url: syncEvent.url,
            fromDB: true,
            createdAt: syncEvent.created_at
          });
        }
      });

      // Sort the results and then return them.
      Util.sortBy(newData, function (item) {
        return item.createdAt;
      });
      callback(newData);
    }

    /**
     * Load all data from the specified table.
     *
     * @method _loadAll
     * @protected
     * @param {String} tableName
     * @param {Function} callback
     * @param {Object[]} callback.result
     */

  }, {
    key: '_loadAll',
    value: function _loadAll(tableName, callback) {
      var _this12 = this;

      if (!this.tables[tableName]) return callback([]);
      this.onOpen(function () {
        var data = [];
        _this12.db.transaction([tableName], 'readonly').objectStore(tableName).openCursor().onsuccess = function (evt) {
          var cursor = evt.target.result;
          if (cursor) {
            data.push(cursor.value);
            cursor.continue();
          } else {
            if (!_this12.isDestroyed) callback(data);
          }
        };
      });
    }

    /**
     * Load all data from the specified table and with the specified index value.
     *
     * @method _loadByIndex
     * @protected
     * @param {String} tableName
     * @param {String} indexName
     * @param {String} indexValue
     * @param {Function} callback
     * @param {Object[]} callback.result
     */

  }, {
    key: '_loadByIndex',
    value: function _loadByIndex(tableName, indexName, indexValue, callback) {
      var _this13 = this;

      if (!this.tables[tableName]) return callback([]);
      this.onOpen(function () {
        var data = [];
        var range = window.IDBKeyRange.only(indexValue);
        _this13.db.transaction([tableName], 'readonly').objectStore(tableName).index(indexName).openCursor(range).onsuccess = function (evt) {
          var cursor = evt.target.result;
          if (cursor) {
            data.push(cursor.value);
            cursor.continue();
          } else {
            if (!_this13.isDestroyed) callback(data);
          }
        };
      });
    }

    /**
     * Deletes the specified objects from the specified table.
     *
     * Currently takes an array of data to delete rather than an array of IDs;
     * If you only have an ID, [{id: myId}] should work.
     *
     * @method deleteObjects
     * @param {String} tableName
     * @param {Object[]} data
     * @param {Function} [callback]
     */

  }, {
    key: 'deleteObjects',
    value: function deleteObjects(tableName, data, callback) {
      var _this14 = this;

      if (!this.tables[tableName]) return callback ? callback() : null;
      this.onOpen(function () {
        var transaction = _this14.db.transaction([tableName], 'readwrite');
        var store = transaction.objectStore(tableName);
        transaction.oncomplete = callback;
        data.forEach(function (item) {
          return store.delete(item.id);
        });
      });
    }

    /**
     * Retrieve the identified objects from the specified database table.
     *
     * Turning these into instances is the responsibility of the caller.
     *
     * Inspired by http://www.codeproject.com/Articles/744986/How-to-do-some-magic-with-indexedDB
     *
     * @method getObjects
     * @param {String} tableName
     * @param {String[]} ids
     * @param {Function} callback
     * @param {Object[]} callback.result
     */

  }, {
    key: 'getObjects',
    value: function getObjects(tableName, ids, callback) {
      var _this15 = this;

      if (!this.tables[tableName]) return callback([]);
      var data = [];

      // Gather, sort, and filter replica IDs
      var sortedIds = ids.sort();
      for (var i = sortedIds.length - 1; i > 0; i--) {
        if (sortedIds[i] === sortedIds[i - 1]) sortedIds.splice(i, 1);
      }
      var index = 0;

      // Iterate over the table searching for the specified IDs
      this.onOpen(function () {
        _this15.db.transaction([tableName], 'readonly').objectStore(tableName).openCursor().onsuccess = function (evt) {
          var cursor = evt.target.result;
          if (!cursor) {
            callback(data);
            return;
          }
          var key = cursor.key;

          // The cursor has passed beyond this key. Check next.
          while (key > sortedIds[index]) {
            index++;
          } // The cursor is pointing at one of our IDs, get it and check next.
          if (key === sortedIds[index]) {
            data.push(cursor.value);
            index++;
          }

          // Done or check next
          if (index === sortedIds.length) {
            if (!_this15.isDestroyed) callback(data);
          } else {
            cursor.continue(sortedIds[index]);
          }
        };
      });
    }

    /**
     * Claim a Sync Event.
     *
     * A sync event is claimed by locking the table,  validating that it is still in the table... and then deleting it from the table.
     *
     * @method claimSyncEvent
     * @param {layer.SyncEvent} syncEvent
     * @param {Function} callback
     * @param {Boolean} callback.result
     */

  }, {
    key: 'claimSyncEvent',
    value: function claimSyncEvent(syncEvent, callback) {
      var _this16 = this;

      if (!this.tables.syncQueue) return callback(true);
      this.onOpen(function () {
        var transaction = _this16.db.transaction(['syncQueue'], 'readwrite');
        var store = transaction.objectStore('syncQueue');
        store.get(syncEvent.id).onsuccess = function (evt) {
          return callback(Boolean(evt.target.result));
        };
        store.delete(syncEvent.id);
      });
    }

    /**
     * Delete all data from all tables.
     *
     * This should be called from layer.Client.logout()
     *
     * @method deleteTables
     * @param {Function} [calllback]
     */

  }, {
    key: 'deleteTables',
    value: function deleteTables(callback) {
      var _this17 = this;

      this.onOpen(function () {
        try {
          var transaction = _this17.db.transaction(['conversations', 'identities', 'messages', 'syncQueue'], 'readwrite');
          transaction.objectStore('conversations').clear();
          transaction.objectStore('identities').clear();
          transaction.objectStore('messages').clear();
          transaction.objectStore('syncQueue').clear();
          transaction.oncomplete = callback;
        } catch (e) {
          // Noop
        }
      });
    }
  }]);

  return DbManager;
}(Root);

/**
 * @type {layer.Client} Layer Client instance
 */


DbManager.prototype.client = null;

/**
 * @type {boolean} is the db connection open
 */
DbManager.prototype.isOpen = false;

/**
 * @type {Object} A list of tables that are enabled.
 *
 * Disabled tables are omitted or false.
 * sync-events can only be enabled IF conversations and messages are enabled
 */
DbManager.prototype.tables = null;

/**
 * @type IDBDatabase
 */
DbManager.prototype.db = null;

DbManager._supportedEvents = ['open'];

Root.initClass.apply(DbManager, [DbManager, 'DbManager']);
module.exports = DbManager;

},{"./client-utils":10,"./const":12,"./logger":18,"./root":24,"./sync-event":25}],16:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * This class represents a Layer Error.
 *
 * At this point, a LayerError is only used in response to an error from the server.
 * It may be extended to report on internal errors... but typically internal errors
 * are reported via `throw new Error(...);`
 *
 * Layer Error is passed as part of the layer.LayerEvent's data property.
 *
 *     object.trigger('xxx-error', new LayerEvent({
 *       data: new LayerError()
 *     }));
 *
 * @class layer.LayerError
 */
var Logger = require('./logger');

var LayerError = function () {
  function LayerError(options) {
    var _this = this;

    _classCallCheck(this, LayerError);

    if (options instanceof LayerError) {
      options = {
        errType: options.errType,
        httpStatus: options.httpStatus,
        message: options.message,
        code: options.code,
        url: options.url,
        data: options.data
      };
    } else if (options && (typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object') {
      options.errType = options.id;
    } else {
      options = {
        message: options
      };
    }

    Object.keys(options).forEach(function (name) {
      return _this[name] = options[name];
    });
    if (!this.data) this.data = {};
  }

  /**
   * Returns either '' or a nonce.
   *
   * If a nonce has been returned
   * by the server as part of a session-expiration error,
   * then this method will return that nonce.
   *
   * @method getNonce
   * @return {string} nonce
   */


  _createClass(LayerError, [{
    key: 'getNonce',
    value: function getNonce() {
      return this.data && this.data.nonce ? this.data.nonce : '';
    }

    /**
     * String representation of the error
     *
     * @method toString
     * @return {string}
     */

  }, {
    key: 'toString',
    value: function toString() {
      return this.code + ' (' + this.id + '): ' + this.message + '; (see ' + this.url + ')';
    }

    /**
     * Log the errors
     *
     * @method log
     * @deprecated see layer.Logger
     */

  }, {
    key: 'log',
    value: function log() {
      Logger.error('Layer-Error: ' + this.toString());
    }
  }]);

  return LayerError;
}();

/**
 * A string name for the event; these names are paired with codes.
 *
 * Codes can be looked up at https://github.com/layerhq/docs/blob/web-api/specs/rest-api.md#client-errors
 * @type {String}
 */


LayerError.prototype.errType = '';

/**
 * Numerical error code.
 *
 * https://developer.layer.com/docs/client/rest#full-list
 * @type {Number}
 */
LayerError.prototype.code = 0;

/**
 * URL to go to for more information on this error.
 * @type {String}
 */
LayerError.prototype.url = '';

/**
 * Detailed description of the error.
 * @type {String}
 */
LayerError.prototype.message = '';

/**
 * Http error code; no value if its a websocket response.
 * @type {Number}
 */
LayerError.prototype.httpStatus = 0;

/**
 * Contains data from the xhr request object.
 *
 *  * url: the url to the service endpoint
 *  * data: xhr.data,
 *  * xhr: XMLHttpRequest object
 *
 * @type {Object}
 */
LayerError.prototype.request = null;

/**
 * Any additional details about the error sent as additional properties.
 * @type {Object}
 */
LayerError.prototype.data = null;

/**
 * Pointer to the xhr object that fired the actual request and contains the response.
 * @type {XMLHttpRequest}
 */
LayerError.prototype.xhr = null;

/**
 * Dictionary of error messages
 * @property {Object} [dictionary={}]
 */
LayerError.dictionary = {
  appIdMissing: 'Property missing: appId is required',
  identityTokenMissing: 'Identity Token missing: answerAuthenticationChallenge requires an identity token',
  sessionTokenMissing: 'Session Token missing: _authComplete requires a {session_token: value} input',
  clientMissing: 'Property missing: client is required',
  conversationMissing: 'Property missing: conversation is required',
  partsMissing: 'Property missing: parts is required',
  moreParticipantsRequired: 'Conversation needs participants other than the current user',
  isDestroyed: 'Object is destroyed',
  urlRequired: 'Object needs a url property',
  invalidUrl: 'URL is invalid',
  invalidId: 'Identifier is invalid',
  idParamRequired: 'The ID Parameter is required',
  wrongClass: 'Parameter class error; should be: ',
  inProgress: 'Operation already in progress',
  cantChangeIfConnected: 'You can not change value after connecting',
  alreadySent: 'Already sent or sending',
  contentRequired: 'MessagePart requires rich content for this call',
  alreadyDestroyed: 'This object has already been destroyed',
  deletionModeUnsupported: 'Call to deletion was made with an unsupported deletion mode',
  sessionAndUserRequired: 'connectWithSession requires both a userId and a sessionToken'
};

module.exports = LayerError;

},{"./logger":18}],17:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * This class represents a Layer Event, and is used as the parameter for all event handlers.
 *
 * Calls to
 *
 *      obj.trigger('eventName2', {hey: 'ho'});
 *
 * results in:
 *
 *      obj.on('eventName2', function(layerEvent) {
 *          alert(layerEvent.target.toString() + ' has fired a value of ' + layerEvent.hey);
 *      });
 *
 * Change events (events ending in ':change') get special handling:
 *
 *      obj.trigger('obj:change', {
 *          newValue: 55,
 *          oldValue: 25,
 *          property: 'hey'
 *      });
 *
 * results in your event data being wrapped in a `changes` array:
 *
 *      obj.on('obj:change', function(layerEvent) {
 *          layerEvent.changes.forEach(function(change) {
 *              alert(layerEvent.target.toString() + ' changed ' +
 *                    change.property + ' from ' + change.oldValue +
 *                    ' to ' + change.newValue);
 *          });
 *      });
 *
 * The `layer.LayerEvent.getChangesFor()` and `layer.LayerEvent.hasProperty()` methods
 * simplify working with xxx:change events so you don't need
 * to iterate over the `changes` array.
 *
 * @class layer.LayerEvent
 */

var LayerEvent = function () {
  /**
   * Constructor for LayerEvent.
   *
   * @method
   * @param  {Object} args - Properties to mixin to the event
   * @param  {string} eventName - Name of the event that generated this LayerEvent.
   * @return {layer.LayerEvent}
   */

  function LayerEvent(args, eventName) {
    var _this = this;

    _classCallCheck(this, LayerEvent);

    var ptr = this;

    // Is it a change event?  if so, setup the change properties.
    if (eventName.match(/:change$/)) {
      this.changes = [{}];
      // All args get copied into the changes object instead of this
      ptr = this.changes[0];
      this.isChange = true;
    } else {
      this.isChange = false;
    }

    // Copy the args into either this Event object... or into the change object.
    // Wouldn't be needed if this inherited from Root.
    Object.keys(args).forEach(function (name) {
      // Even if we are copying properties into the change object, target remains
      // a property of LayerEvent.
      if (ptr !== _this && name === 'target') {
        _this.target = args.target;
      } else {
        ptr[name] = args[name];
      }
    });
    this.eventName = eventName;
  }

  /**
   * Returns true if the specified property was changed.
   *
   * Returns false if this is not a change event.
   *
   *      if (layerEvent.hasProperty('age')) {
   *          handleAgeChange(obj.age);
   *      }
   *
   * @method hasProperty
   * @param  {string}  name - Name of the property
   * @return {Boolean}
   */


  _createClass(LayerEvent, [{
    key: 'hasProperty',
    value: function hasProperty(name) {
      if (!this.isChange) return false;
      return Boolean(this.changes.filter(function (change) {
        return change.property === name;
      }).length);
    }

    /**
     * Get all changes to the property.
     *
     * Returns an array of changes.
     * If this is not a change event, will return []
     * Changes are typically of the form:
     *
     *      layerEvent.getChangesFor('age');
     *      > [{
     *          oldValue: 10,
     *          newValue: 5,
     *          property: 'age'
     *      }]
     *
     * @method getChangesFor
     * @param  {string} name - Name of the property whose changes are of interest
     * @return {Object[]}
     */

  }, {
    key: 'getChangesFor',
    value: function getChangesFor(name) {
      if (!this.isChange) return [];
      return this.changes.filter(function (change) {
        return change.property === name;
      });
    }

    /**
     * Merge changes into a single changes array.
     *
     * The other event will need to be deleted.
     *
     * @method _mergeChanges
     * @protected
     * @param  {layer.LayerEvent} evt
     */

  }, {
    key: '_mergeChanges',
    value: function _mergeChanges(evt) {
      this.changes = this.changes.concat(evt.changes);
    }
  }]);

  return LayerEvent;
}();

/**
 * Indicates that this is a change event.
 *
 * If the event name ends with ':change' then
 * it is treated as a change event;  such
 * events are assumed to come with `newValue`, `oldValue` and `property` in the layer.LayerEvent.changes property.
 * @type {Boolean}
 */


LayerEvent.prototype.isChange = false;

/**
 * Array of changes (Change Events only).
 *
 * If its a Change Event, then the changes property contains an array of change objects
 * which each contain:
 *
 * * oldValue
 * * newValue
 * * property
 *
 * @type {Object[]}
 */
LayerEvent.prototype.changes = null;

/**
 * Component that was the source of the change.
 *
 * If one calls
 *
 *      obj.trigger('event');
 *
 * then obj will be the target.
 * @type {layer.Root}
 */
LayerEvent.prototype.target = null;

/**
 * The name of the event that created this instance.
 *
 * If one calls
 *
 *      obj.trigger('myevent');
 *
 * then eventName = 'myevent'
 *
 * @type {String}
 */
LayerEvent.prototype.eventName = '';

module.exports = LayerEvent;

},{}],18:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @class layer.Logger
 * @private
 *
 */

var _require$LOG = require('./const').LOG;

var DEBUG = _require$LOG.DEBUG;
var INFO = _require$LOG.INFO;
var WARN = _require$LOG.WARN;
var ERROR = _require$LOG.ERROR;
var NONE = _require$LOG.NONE;

var _require = require('./client-utils');

var isEmpty = _require.isEmpty;

// Pretty arbitrary test that IE/edge fails and others don't.  Yes I could do a more direct
// test for IE/edge but its hoped that MS will fix this around the time they cleanup their internal console object.

var supportsConsoleFormatting = Boolean(console.assert && console.assert.toString().match(/assert/));
var LayerCss = 'color: #888; font-weight: bold;';
var Black = 'color: black';
/* istanbulify ignore next */

var Logger = function () {
  function Logger() {
    _classCallCheck(this, Logger);
  }

  _createClass(Logger, [{
    key: 'log',
    value: function log(msg, obj, type, color) {
      /* istanbul ignore else */
      if (typeof msg === 'string') {
        var timestamp = new Date().toLocaleTimeString();
        if (supportsConsoleFormatting) {
          console.log('%cLayer%c ' + type + '%c [' + timestamp + ']: ' + msg, LayerCss, 'color: ' + color, Black);
        } else {
          console.log('Layer ' + type + ' [' + timestamp + ']: ' + msg);
        }
      } else {
        this._logObj(msg, type, color);
      }
      if (obj) this._logObj(obj, type, color);
    }
  }, {
    key: '_logObj',
    value: function _logObj(obj, type, color) {
      /* istanbul ignore next */
      if (!obj || isEmpty(obj)) return;
      /* istanbul ignore next */
      if (obj.constructor.name === 'Object') {
        if (supportsConsoleFormatting) {
          console.log('%cLayer%c ' + type + '%c: ' + JSON.stringify(obj, null, 4), LayerCss, 'color: ' + color, Black);
        } else {
          console.log('Layer ' + type + ': ' + JSON.stringify(obj, null, 4));
        }
      } else {
        if (supportsConsoleFormatting) {
          console.log('%cLayer%c ' + type + '%c: %O', LayerCss, 'color: ' + color, Black, obj);
        } else {
          console.log('Layer ' + type + ':', obj);
        }
      }
    }
  }, {
    key: 'debug',
    value: function debug(msg, obj) {
      /* istanbul ignore next */
      if (this.level >= DEBUG) this.log(msg, obj, 'DEBUG', '#888');
    }
  }, {
    key: 'info',
    value: function info(msg, obj) {
      /* istanbul ignore next */
      if (this.level >= INFO) this.log(msg, obj, 'INFO', 'black');
    }
  }, {
    key: 'warn',
    value: function warn(msg, obj) {
      /* istanbul ignore next */
      if (this.level >= WARN) this.log(msg, obj, 'WARN', 'orange');
    }
  }, {
    key: 'error',
    value: function error(msg, obj) {
      /* istanbul ignore next */
      if (this.level >= ERROR) this.log(msg, obj, 'ERROR', 'red');
    }
  }]);

  return Logger;
}();

/* istanbul ignore next */


Logger.prototype.level = typeof jasmine === 'undefined' ? ERROR : NONE;

var logger = new Logger();

module.exports = logger;

},{"./client-utils":10,"./const":12}],19:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * The MessagePart class represents an element of a message.
 *
 *      // Create a Message Part with any mimeType
 *      var part = new layer.MessagePart({
 *          body: "hello",
 *          mimeType: "text/plain"
 *      });
 *
 *      // Create a text/plain only Message Part
 *      var part = new layer.MessagePart("Hello I am text/plain");
 *
 * You can also create a Message Part from a File Input dom node:
 *
 *      var fileInputNode = document.getElementById("myFileInput");
 *      var part = new layer.MessagePart(fileInputNode.files[0]);
 *
 * You can also create Message Parts from a file drag and drop operation:
 *
 *      onFileDrop: function(evt) {
 *           var files = evt.dataTransfer.files;
 *           var m = conversation.createMessage({
 *               parts: files.map(function(file) {
 *                  return new layer.MessagePart({body: file, mimeType: file.type});
 *               }
 *           });
 *      });
 *
 * You can also use base64 encoded data:
 *
 *      var part = new layer.MessagePart({
 *          encoding: 'base64',
 *          mimeType: 'image/png',
 *          body: 'iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAECElEQVR4Xu2ZO44TURREa0SAWBASKST8xCdDQMAq+OyAzw4ISfmLDBASISERi2ADEICEWrKlkYWny6+77fuqalJfz0zVOXNfv/ER8mXdwJF1+oRHBDCXIAJEAPMGzONnA0QA8wbM42cDRADzBszjZwNEAPMGzONnA0QA8wbM42cDRADzBszjZwNEAPMGzONnA0QA8wbM42cDRADzBszjZwNEAPMGzONnA0QA8wbM42cDRADzBszjZwNEAPMGzONnA0QA8wbM42cDRADzBszjZwNEAPMGzONnA0QA8wbM42cDRADzBszjZwNEAPMGzONnA0QA8waWjX8OwHcAv5f9Me3fPRugvbuxd14C8B7AVwA3q0oQAcYwtr2+hn969faPVSWIAG2AT3rXJvz17CcAN6ptgggwrwDb4JeVIALMJ8AY/JISRIB5BGDhr3/aZwDXKxwHEWC6AJcBvAOwfuBjvuNfABcBfGGGl5yJANPabYV/B8DLaT96nndHgPYeu4c/RI8AbQJIwO9FgDMAfrVxWuRdMvB7EOA+gHsALgD4uQjO3b6pFPzqAjwA8HTF5weA8weWQA5+ZQGOw1//jR5SAkn4VQV4CODJls18CAmuAHjbcM8vc9U76ZSrdgt4BODxyLG8Twla4P8BcLfKPX/sEaeSAAz8fR4H8vArHQHXAHwYs3Xj9SU3gQX8SgKcAvBitTp38WAJCWzgVxJg+F0qSGAFv5oAh5bADn5FAQ4lwVUAb3a86nX1tL/tXK10Czj+O+7zOLCFX3UDrEXYhwTW8KsLsPRx0Ap/+A/fq12uKpVnqx4BSx8Hgb9quAcB5t4EgX/sz6sXAeaSIPA3zqOeBJgqwTMAzxuuelJn/ubzSG8CTJFg12ex4Z4vDb+HW8A2aK1XRFYCC/g9C7DkJrCB37sAS0hgBV9BgDklGODfBvCaPScU5np8CPxf71OfCSzhq2yAqZ8d2MJXE6DlOLCGryjALhLYw1cVgJEg8Dv7MKjlgXvbg2Hgd/ph0BwSBH7nHwZNkeCW4z1/rDCV/wOM5RyOg7MAvo0Nur3uIoAbVzpvBKCr0hyMAJpc6VQRgK5KczACaHKlU0UAuirNwQigyZVOFQHoqjQHI4AmVzpVBKCr0hyMAJpc6VQRgK5KczACaHKlU0UAuirNwQigyZVOFQHoqjQHI4AmVzpVBKCr0hyMAJpc6VQRgK5KczACaHKlU0UAuirNwQigyZVOFQHoqjQHI4AmVzpVBKCr0hyMAJpc6VQRgK5KczACaHKlU0UAuirNwQigyZVOFQHoqjQHI4AmVzpVBKCr0hyMAJpc6VQRgK5KczACaHKlU0UAuirNwQigyZVOFQHoqjQHI4AmVzpVBKCr0hz8BzIXtYE3VcPnAAAAAElFTkSuQmCC'
 *      });
 *
 * ### Accesing Rich Content
 *
 * There are two ways of accessing rich content
 *
 * 1. Access the data directly: `part.fetchContent(function(data) {myRenderData(data);})`. This approach downloads the data,
 *    writes it to the the `body` property, writes a Data URI to the part's `url` property, and then calls your callback.
 *    By downloading the data and storing it in `body`, the data does not expire.
 * 2. Access the URL rather than the data: `part.fetchStream(callback)`.  URLs are needed for streaming, and for content that doesn't
 *    yet need to be rendered (hyperlinks to data that will render when clicked).  These URLs expire.  The url property will return a
 *    string if the url is valid, or '' if its expired and fetchStream must be called to update the url.
 *    The following pattern is recommended:
 *
 *        if (!part.url) {
 *          part.fetchStream(function(url) {myRenderUrl(url)});
 *        } else {
 *          myRenderUrl(part.url);
 *        }
 *
 * NOTE: `layer.MessagePart.url` should have a value when the message is first received, and will only fail `if (!part.url)` once the url has expired.
 *
 * @class  layer.MessagePart
 * @extends layer.Root
 * @author Michael Kantor
 */

var Root = require('./root');
var Content = require('./content');
var xhr = require('./xhr');
var ClientRegistry = require('./client-registry');
var LayerError = require('./layer-error');
var HasBlob = typeof Blob !== 'undefined';

/* istanbul ignore next */
var LocalFileReader = typeof window === 'undefined' ? require('filereader') : FileReader;

var MessagePart = function (_Root) {
  _inherits(MessagePart, _Root);

  /**
   * Constructor
   *
   * @method constructor
   * @param  {Object} options - Can be an object with body and mimeType, or it can be a string, or a Blob/File
   * @param  {string} options.body - To send binary, use base64 encoded string
   * @param  {string} [options.mimeType=text/plain] - Mime type; can be anything; if your client doesn't have a renderer for it, it will be ignored.
   * @param  {string} [options.encoding=] - Encoding for your MessagePart; use 'base64' if the body is a base64 string; else leave blank.
   * @param  {number} [options.size=0] - Size of your part. Will be calculated for you if not provided.
   *
   * @return {layer.MessagePart}
   */

  function MessagePart(options) {
    _classCallCheck(this, MessagePart);

    var newOptions = options;
    if (typeof options === 'string') {
      newOptions = { body: options };
      if (arguments.length - 1 > 0) {
        newOptions.mimeType = arguments.length <= 1 ? undefined : arguments[1];
      } else {
        newOptions.mimeType = 'text/plain';
      }
    } else if (HasBlob && (options instanceof Blob || options.body instanceof Blob)) {
      var bodyBlob = options instanceof Blob ? options : options.body;
      newOptions = {
        mimeType: bodyBlob.type,
        body: bodyBlob,
        size: bodyBlob.size,
        hasContent: true
      };
    }

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(MessagePart).call(this, newOptions));

    if (!_this.size && _this.body) _this.size = _this.body.length;
    if (HasBlob && _this.body instanceof Blob) {
      _this.url = URL.createObjectURL(_this.body);
    }
    return _this;
  }

  _createClass(MessagePart, [{
    key: 'destroy',
    value: function destroy() {
      if (this.__url) {
        URL.revokeObjectURL(this.__url);
        this.__url = null;
      }
      this.body = null;
      _get(Object.getPrototypeOf(MessagePart.prototype), 'destroy', this).call(this);
    }

    /**
     * Get the layer.Client associated with this layer.MessagePart.
     *
     * Uses the layer.MessagePart.clientId property.
     *
     * @method _getClient
     * @private
     * @return {layer.Client}
     */

  }, {
    key: '_getClient',
    value: function _getClient() {
      return ClientRegistry.get(this.clientId);
    }

    /**
     * Get the layer.Message associated with this layer.MessagePart.
     *
     * @method _getMessage
     * @private
     * @return {layer.Message}
     */

  }, {
    key: '_getMessage',
    value: function _getMessage() {
      return this._getClient().getMessage(this.id.replace(/\/parts.*$/, ''));
    }

    /**
     * Download Rich Content from cloud server.
     *
     * For MessageParts with rich content, will load the data from google's cloud storage.
     * The body property of this MessagePart is set to the result.
     *
     *      messagepart.fetchContent()
     *      .on("content-loaded", function() {
     *          render(messagepart.body);
     *      });
     *
     * @method fetchContent
     * @param {Function} [callback]
     * @param {Mixed} callback.data - Either a string (mimeType=text/plain) or a Blob (all other mimeTypes)
     */

  }, {
    key: 'fetchContent',
    value: function fetchContent(callback) {
      var _this2 = this;

      if (this._content && !this.isFiring) {
        this.isFiring = true;
        var type = this.mimeType === 'image/jpeg+preview' ? 'image/jpeg' : this.mimeType;
        this._content.loadContent(type, function (err, result) {
          return _this2._fetchContentCallback(err, result, callback);
        });
      }
      return this;
    }
  }, {
    key: '_fetchContentCallback',
    value: function _fetchContentCallback(err, result, callback) {
      var _this3 = this;

      if (err) {
        this.trigger('content-loaded-error', err);
      } else {
        this.url = URL.createObjectURL(result);
        this.isFiring = false;
        if (this.mimeType === 'text/plain') {
          (function () {
            var reader = new LocalFileReader();
            reader.addEventListener('loadend', function () {
              _this3._fetchContentComplete(reader.result, callback);
            });
            reader.readAsText(result);
          })();
        } else {
          this._fetchContentComplete(result, callback);
        }
      }
    }
  }, {
    key: '_fetchContentComplete',
    value: function _fetchContentComplete(body, callback) {
      var message = this._getMessage();

      this.body = body;

      this.trigger('content-loaded');
      message._triggerAsync('messages:change', {
        oldValue: message.parts,
        newValue: message.parts,
        property: 'parts'
      });
      if (callback) callback(this.body);
    }

    /**
     * Access the URL to the remote resource.
     *
     * For MessageParts with Rich Content, will lookup a URL to your Rich Content.
     * Useful for streaming and content so that you don't have to download the entire file before rendering it.
     *
     *      messagepart.fetchStream(function(url) {
     *          render(url);
     *      });
     *
     * @method fetchStream
     * @param {Function} [callback]
     * @param {Mixed} callback.url
     */

  }, {
    key: 'fetchStream',
    value: function fetchStream(callback) {
      var _this4 = this;

      if (!this._content) throw new Error(LayerError.dictionary.contentRequired);
      if (this._content.isExpired()) {
        this._content.refreshContent(this._getClient(), function (url) {
          return _this4._fetchStreamComplete(url, callback);
        });
      } else {
        this._fetchStreamComplete(this._content.downloadUrl, callback);
      }
    }

    // Does not set this.url; instead relies on fact that this._content.downloadUrl has been updated

  }, {
    key: '_fetchStreamComplete',
    value: function _fetchStreamComplete(url, callback) {
      var message = this._getMessage();

      this.trigger('url-loaded');
      message._triggerAsync('messages:change', {
        oldValue: message.parts,
        newValue: message.parts,
        property: 'parts'
      });
      if (callback) callback(url);
    }

    /**
     * Preps a MessagePart for sending.  Normally that is trivial.
     * But if there is rich content, then the content must be uploaded
     * and then we can trigger a "parts:send" event indicating that
     * the part is ready to send.
     *
     * @method _send
     * @protected
     * @param  {layer.Client} client
     * @fires parts:send
     */

  }, {
    key: '_send',
    value: function _send(client) {
      // There is already a Content object, presumably the developer
      // already took care of this step for us.
      if (this._content) {
        this._sendWithContent();
      }

      // If the size is large, Create and upload the Content
      if (this.size > 2048) {
        this._generateContentAndSend(client);
      }

      // If the body is a blob either base64 encode it
      else if (typeof Blob !== 'undefined' && this.body instanceof Blob) {
          this._sendBlob(client);
        }

        // Else the message part can be sent as is.
        else {
            this._sendBody();
          }
    }
  }, {
    key: '_sendBody',
    value: function _sendBody() {
      var obj = {
        mime_type: this.mimeType,
        body: this.body
      };
      if (this.encoding) obj.encoding = this.encoding;
      this.trigger('parts:send', obj);
    }
  }, {
    key: '_sendWithContent',
    value: function _sendWithContent() {
      this.trigger('parts:send', {
        mime_type: this.mimeType,
        content: {
          size: this.size,
          id: this._content.id
        }
      });
    }
  }, {
    key: '_sendBlob',
    value: function _sendBlob(client) {
      var _this5 = this;

      /* istanbul ignore else */
      var reader = new LocalFileReader();
      reader.onloadend = function () {
        var base64data = reader.result;
        if (base64data.length < 2048) {
          _this5.body = base64data;
          _this5.body = _this5.body.substring(_this5.body.indexOf(',') + 1);
          _this5.encoding = 'base64';
          _this5._sendBody(client);
        } else {
          _this5._generateContentAndSend(client);
        }
      };
      reader.readAsDataURL(this.body); // encodes to base64
    }

    /**
     * Create an rich Content object on the server
     * and then call _processContentResponse
     *
     * @method _generateContentAndSend
     * @private
     * @param  {layer.Client} client
     */

  }, {
    key: '_generateContentAndSend',
    value: function _generateContentAndSend(client) {
      var _this6 = this;

      this.hasContent = true;
      client.xhr({
        url: '/content',
        method: 'POST',
        headers: {
          'Upload-Content-Type': this.mimeType,
          'Upload-Content-Length': this.size,
          'Upload-Origin': typeof location !== 'undefined' ? location.origin : ''
        },
        sync: {}
      }, function (result) {
        _this6._processContentResponse(result.data, client);
      });
    }

    /**
     * Creates a layer.Content object from the server's
     * Content object, and then uploads the data to google cloud storage.
     *
     * @method _processContentResponse
     * @private
     * @param  {Object} response
     * @param  {layer.Client} client
     */

  }, {
    key: '_processContentResponse',
    value: function _processContentResponse(response, client) {
      var _this7 = this;

      this._content = new Content(response.id);
      this.hasContent = true;
      xhr({
        url: response.upload_url,
        method: 'PUT',
        data: this.body,
        headers: {
          'Upload-Content-Length': this.size,
          'Upload-Content-Type': this.mimeType
        }
      }, function (result) {
        return _this7._processContentUploadResponse(result, response, client);
      });
    }
  }, {
    key: '_processContentUploadResponse',
    value: function _processContentUploadResponse(uploadResult, contentResponse, client) {
      if (!uploadResult.success) {
        if (!client.onlineManager.isOnline) {
          client.onlineManager.once('connected', this._processContentResponse.bind(this, contentResponse, client), this);
        } else {
          console.error('We don\'t yet handle this!');
        }
      } else {
        this.trigger('parts:send', {
          mime_type: this.mimeType,
          content: {
            size: this.size,
            id: this._content.id
          }
        });
      }
    }

    /**
     * Returns the text for any text/plain part.
     *
     * Returns '' if its not a text/plain part.
     *
     * @method getText
     * @return {string}
     */

  }, {
    key: 'getText',
    value: function getText() {
      if (this.mimeType === 'text/plain') {
        return this.body;
      } else {
        return '';
      }
    }

    /**
     * Updates the MessagePart with new data from the server.
     *
     * Currently, MessagePart properties do not update... however,
     * the layer.Content object that Rich Content MessageParts contain
     * do get updated with refreshed expiring urls.
     *
     * @method _populateFromServer
     * @param  {Object} part - Server representation of a part
     * @private
     */

  }, {
    key: '_populateFromServer',
    value: function _populateFromServer(part) {
      if (part.content && this._content) {
        this._content.downloadUrl = part.content.download_url;
        this._content.expiration = new Date(part.content.expiration);
      }
    }

    /**
     * Creates a MessagePart from a server representation of the part
     *
     * @method _createFromServer
     * @private
     * @static
     * @param  {Object} part - Server representation of a part
     */

  }], [{
    key: '_createFromServer',
    value: function _createFromServer(part) {
      var content = part.content ? Content._createFromServer(part.content) : null;

      return new MessagePart({
        id: part.id,
        mimeType: part.mime_type,
        body: part.body || '',
        _content: content,
        hasContent: Boolean(content),
        size: part.size || 0,
        encoding: part.encoding || ''
      });
    }
  }]);

  return MessagePart;
}(Root);

/**
 * layer.Client that the conversation belongs to.
 *
 * Actual value of this string matches the appId.
 * @type {string}
 */


MessagePart.prototype.clientId = '';

/**
 * Server generated identifier for the part
 * @type {string}
 */
MessagePart.prototype.id = '';

/**
 * Body of your message part.
 *
 * This is the core data of your part.
 * @type {string}
 */
MessagePart.prototype.body = null;

/**
 * Rich content object.
 *
 * This will be automatically created for you if your layer.MessagePart.body
 * is large.
 * @type {layer.Content}
 * @private
 */
MessagePart.prototype._content = null;

/**
 * The Part has rich content
 * @type {Boolean}
 */
MessagePart.prototype.hasContent = false;

/**
 * URL to rich content object.
 *
 * Parts with rich content will be initialized with this property set.  But its value will expire.
 *
 * Will contain an expiring url at initialization time and be refreshed with calls to `layer.MessagePart.fetchStream()`.
 * Will contain a non-expiring url to a local resource if `layer.MessagePart.fetchContent()` is called.
 *
 * @type {layer.Content}
 */
Object.defineProperty(MessagePart.prototype, 'url', {
  enumerable: true,
  get: function get() {
    // Its possible to have a url and no content if it has been instantiated but not yet sent.
    // If there is a __url then its a local url generated from the body property and does not expire.
    if (this.__url) return this.__url;
    if (this._content) return this._content.isExpired() ? '' : this._content.downloadUrl;
    return '';
  },
  set: function set(inValue) {
    this.__url = inValue;
  }
});

/**
 * Mime Type for the data in layer.MessagePart.body.
 *
 * @type {String}
 */
MessagePart.prototype.mimeType = 'text/plain';

/**
 * Encoding used for the body of this part.
 *
 * No value is the default encoding.  'base64' is also a common value.
 * @type {String}
 */
MessagePart.prototype.encoding = '';

/**
 * Size of the layer.MessagePart.body.
 *
 * Will be set for you if not provided.
 * Only needed for use with rich content.
 *
 * @type {number}
 */
MessagePart.prototype.size = 0;

MessagePart._supportedEvents = ['parts:send', 'content-loaded', 'url-loaded', 'content-loaded-error'].concat(Root._supportedEvents);
Root.initClass.apply(MessagePart, [MessagePart, 'MessagePart']);

module.exports = MessagePart;

},{"./client-registry":9,"./content":13,"./layer-error":16,"./root":24,"./xhr":36,"filereader":3}],20:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * The Message Class represents Messages sent amongst participants
 * of of a Conversation.
 *
 * The simplest way to create and send a message is:
 *
 *      var m = conversation.createMessage('Hello there').send();
 *
 * For conversations that involve notifications (primarily for Android and IOS), the more common pattern is:
 *
 *      var m = conversation.createMessage('Hello there').send({text: "Message from Fred: Hello there"});
 *
 * Typically, rendering would be done as follows:
 *
 *      // Create a layer.Query that loads Messages for the
 *      // specified Conversation.
 *      var query = client.createQuery({
 *        model: Query.Message,
 *        predicate: 'conversation = "' + conversation.id + '"'
 *      });
 *
 *      // Any time the Query's data changes the 'change'
 *      // event will fire.
 *      query.on('change', function(layerEvt) {
 *        renderNewMessages(query.data);
 *      });
 *
 *      // This will call will cause the above event handler to receive
 *      // a change event, and will update query.data.
 *      conversation.createMessage('Hello there').send();
 *
 * The above code will trigger the following events:
 *
 *  * Message Instance fires
 *    * messages:sending: An event that lets you modify the message prior to sending
 *    * messages:sent: The message was received by the server
 *  * Query Instance fires
 *    * change: The query has received a new Message
 *    * change:add: Same as the change event but more specific
 *
 * When creating a Message there are a number of ways to structure it.
 * All of these are valid and create the same exact Message:
 *
 *      // Full API style:
 *      var m = conversation.createMessage({
 *          parts: [new layer.MessagePart({
 *              body: 'Hello there',
 *              mimeType: 'text/plain'
 *          })]
 *      });
 *
 *      // Option 1: Pass in an Object instead of an array of layer.MessageParts
 *      var m = conversation.createMessage({
 *          parts: {
 *              body: 'Hello there',
 *              mimeType: 'text/plain'
 *          }
 *      });
 *
 *      // Option 2: Pass in an array of Objects instead of an array of layer.MessageParts
 *      var m = conversation.createMessage({
 *          parts: [{
 *              body: 'Hello there',
 *              mimeType: 'text/plain'
 *          }]
 *      });
 *
 *      // Option 3: Pass in a string (automatically assumes mimeType is text/plain)
 *      // instead of an array of objects.
 *      var m = conversation.createMessage({
 *          parts: 'Hello'
 *      });
 *
 *      // Option 4: Pass in an array of strings (automatically assumes mimeType is text/plain)
 *      var m = conversation.createMessage({
 *          parts: ['Hello']
 *      });
 *
 *      // Option 5: Pass in just a string and nothing else
 *      var m = conversation.createMessage('Hello');
 *
 *      // Option 6: Use addPart.
 *      var m = converseation.createMessage();
 *      m.addPart({body: "hello", mimeType: "text/plain"});
 *
 * Key methods, events and properties for getting started:
 *
 * Properties:
 *
 * * layer.Message.id: this property is worth being familiar with; it identifies the
 *   Message and can be used in `client.getMessage(id)` to retrieve it
 *   at any time.
 * * layer.Message.internalId: This property makes for a handy unique ID for use in dom nodes.
 *   It is gaurenteed not to change during this session.
 * * layer.Message.isRead: Indicates if the Message has been read yet; set `m.isRead = true`
 *   to tell the client and server that the message has been read.
 * * layer.Message.parts: An array of layer.MessagePart classes representing the contents of the Message.
 * * layer.Message.sentAt: Date the message was sent
 * * layer.Message.sender's `userId` property: Conversation participant who sent the Message. You may
 *   need to do a lookup on this id in your own servers to find a
 *   displayable name for it.
 *
 * Methods:
 *
 * * layer.Message.send(): Sends the message to the server and the other participants.
 * * layer.Message.on() and layer.Message.off(); event listeners built on top of the `backbone-events-standalone` npm project
 *
 * Events:
 *
 * * `messages:sent`: The message has been received by the server. Can also subscribe to
 *   this event from the layer.Client which is usually simpler.
 *
 * @class  layer.Message
 * @extends layer.Syncable
 */

var Root = require('./root');
var Syncable = require('./syncable');
var MessagePart = require('./message-part');
var LayerError = require('./layer-error');
var Constants = require('./const');
var Util = require('./client-utils');
var ClientRegistry = require('./client-registry');

var Message = function (_Syncable) {
  _inherits(Message, _Syncable);

  /**
   * See layer.Conversation.createMessage()
   *
   * @method constructor
   * @return {layer.Message}
   */

  function Message() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Message);

    // Unless this is a server representation, this is a developer's shorthand;
    // fill in the missing properties around isRead/isUnread before initializing.
    if (!options.fromServer) {
      if ('isUnread' in options) {
        options.isRead = !options.isUnread && !options.is_unread;
      } else {
        options.isRead = true;
      }
    } else {
      options.id = options.fromServer.id;
    }

    if (options.client) options.clientId = options.client.appId;
    if (!options.clientId) throw new Error('clientId property required to create a Message');
    if (options.conversation) options.conversationId = options.conversation.id;

    // Insure __adjustParts is set AFTER clientId is set.
    var parts = options.parts;
    options.parts = null;

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Message).call(this, options));

    _this.parts = parts;

    var client = _this.getClient();
    _this.isInitializing = true;
    if (options && options.fromServer) {
      _this._populateFromServer(options.fromServer);
    } else {
      _this.sender = { userId: '', name: '' };
      _this.sentAt = new Date();
    }

    if (!_this.parts) _this.parts = [];
    _this.localCreatedAt = new Date();

    _this._disableEvents = true;
    if (!options.fromServer) _this.recipientStatus = {};else _this.__updateRecipientStatus(_this.recipientStatus);
    _this._disableEvents = false;

    _this.isInitializing = false;
    if (options && options.fromServer) {
      client._addMessage(_this);
      var status = _this.recipientStatus[client.userId];
      if (status !== Constants.RECEIPT_STATE.READ && status !== Constants.RECEIPT_STATE.DELIVERED) {
        _this._sendReceipt('delivery');
      }
    }
    return _this;
  }

  /**
   * Get the layer.Client associated with this layer.Message.
   *
   * Uses the layer.Message.clientId property.
   *
   * @method getClient
   * @return {layer.Client}
   */


  _createClass(Message, [{
    key: 'getClient',
    value: function getClient() {
      return ClientRegistry.get(this.clientId);
    }

    /**
     * Get the layer.Conversation associated with this layer.Message.
     *
     * Uses the layer.Message.conversationId.
     *
     * @method getConversation
     * @return {layer.Conversation}
     */

  }, {
    key: 'getConversation',
    value: function getConversation(load) {
      if (this.conversationId) {
        return ClientRegistry.get(this.clientId).getConversation(this.conversationId, load);
      }
    }

    /**
     * Turn input into valid layer.MessageParts.
     *
     * This method is automatically called any time the parts
     * property is set (including during intialization).  This
     * is where we convert strings into MessageParts, and instances
     * into arrays.
     *
     * @method __adjustParts
     * @private
     * @param  {Mixed} parts -- Could be a string, array, object or MessagePart instance
     * @return {layer.MessagePart[]}
     */

  }, {
    key: '__adjustParts',
    value: function __adjustParts(parts) {
      var _this2 = this;

      if (typeof parts === 'string') {
        return [new MessagePart({
          body: parts,
          mimeType: 'text/plain',
          clientId: this.clientId
        })];
      } else if (Array.isArray(parts)) {
        return parts.map(function (part) {
          var result = undefined;
          if (part instanceof MessagePart) {
            result = part;
          } else {
            result = new MessagePart(part);
          }
          result.clientId = _this2.clientId;
          return result;
        });
      } else if (parts && (typeof parts === 'undefined' ? 'undefined' : _typeof(parts)) === 'object') {
        parts.clientId = this.clientId;
        return [new MessagePart(parts)];
      }
    }

    /**
     * Add a layer.MessagePart to this Message.
     *
     * Should only be called on an unsent Message.
     *
     * @method addPart
     * @param  {layer.MessagePart/Object} part - A layer.MessagePart instance or a `{mimeType: 'text/plain', body: 'Hello'}` formatted Object.
     */

  }, {
    key: 'addPart',
    value: function addPart(part) {
      if (part) {
        part.clientId = this.clientId;
        if ((typeof part === 'undefined' ? 'undefined' : _typeof(part)) === 'object') {
          this.parts.push(new MessagePart(part));
        } else if (part instanceof MessagePart) {
          this.parts.push(part);
        }
      }
      return this;
    }

    /**
     * Accessor called whenever the app accesses `message.recipientStatus`.
     *
     * Insures that participants who haven't yet been sent the Message are marked as layer.Constants.RECEIPT_STATE.PENDING
     *
     * @method __getRecipientStatus
     * @param {string} pKey - The actual property key where the value is stored
     * @private
     * @return {Object}
     */

  }, {
    key: '__getRecipientStatus',
    value: function __getRecipientStatus(pKey) {
      var _this3 = this;

      var value = this[pKey] || {};
      var client = this.getClient();
      if (client) {
        (function () {
          var userId = client.userId;
          var conversation = _this3.getConversation(false);
          if (conversation) {
            conversation.participants.forEach(function (participant) {
              if (!value[participant]) {
                value[participant] = participant === userId ? Constants.RECEIPT_STATE.READ : Constants.RECEIPT_STATE.PENDING;
              }
            });
          }
        })();
      }
      return value;
    }

    /**
     * Handle changes to the recipientStatus property.
     *
     * Any time the recipientStatus property is set,
     * Recalculate all of the receipt related properties:
     *
     * 1. isRead
     * 2. readStatus
     * 3. deliveryStatus
     *
     * @method __updateRecipientStatus
     * @private
     * @param  {Object} status - Object describing the delivered/read/sent value for each participant
     *
     */

  }, {
    key: '__updateRecipientStatus',
    value: function __updateRecipientStatus(status, oldStatus) {
      var conversation = this.getConversation(false);
      var client = this.getClient();

      if (!conversation || Util.doesObjectMatch(status, oldStatus)) return;

      var userId = client.userId;
      var isSender = this.sender.userId === userId;
      var userHasRead = status[userId] === Constants.RECEIPT_STATE.READ;

      try {
        // -1 so we don't count this user
        var userCount = conversation.participants.length - 1;

        // If sent by this user or read by this user, update isRead/unread
        if (!this.__isRead && (isSender || userHasRead)) {
          this.__isRead = true; // no __updateIsRead event fired
        }

        // Update the readStatus/deliveryStatus properties

        var _getReceiptStatus2 = this._getReceiptStatus(status, userId);

        var readCount = _getReceiptStatus2.readCount;
        var deliveredCount = _getReceiptStatus2.deliveredCount;

        this._setReceiptStatus(readCount, deliveredCount, userCount);
      } catch (error) {}
      // Do nothing


      // Only trigger an event
      // 1. we're not initializing a new Message
      // 2. the user's state has been updated to read; we don't care about updates from other users if we aren't the sender.
      //    We also don't care about state changes to delivered; these do not inform rendering as the fact we are processing it
      //    proves its delivered.
      // 3. The user is the sender; in that case we do care about rendering receipts from other users
      if (!this.isInitializing && oldStatus) {
        var usersStateUpdatedToRead = userHasRead && oldStatus[userId] !== Constants.RECEIPT_STATE.READ;
        if (usersStateUpdatedToRead || isSender) {
          this._triggerAsync('messages:change', {
            oldValue: oldStatus,
            newValue: status,
            property: 'recipientStatus'
          });
        }
      }
    }

    /**
     * Get the number of participants who have read and been delivered
     * this Message
     *
     * @method _getReceiptStatus
     * @private
     * @param  {Object} status - Object describing the delivered/read/sent value for each participant
     * @param  {string} userId - User ID for this user; not counted when reporting on how many people have read/received.
     * @return {Object} result
     * @return {number} result.readCount
     * @return {number} result.deliveredCount
     */

  }, {
    key: '_getReceiptStatus',
    value: function _getReceiptStatus(status, userId) {
      var readCount = 0,
          deliveredCount = 0;
      Object.keys(status).filter(function (participant) {
        return participant !== userId;
      }).forEach(function (participant) {
        if (status[participant] === Constants.RECEIPT_STATE.READ) {
          readCount++;
          deliveredCount++;
        } else if (status[participant] === Constants.RECEIPT_STATE.DELIVERED) {
          deliveredCount++;
        }
      });

      return {
        readCount: readCount,
        deliveredCount: deliveredCount
      };
    }

    /**
     * Sets the layer.Message.readStatus and layer.Message.deliveryStatus properties.
     *
     * @method _setReceiptStatus
     * @private
     * @param  {number} readCount
     * @param  {number} deliveredCount
     * @param  {number} userCount
     */

  }, {
    key: '_setReceiptStatus',
    value: function _setReceiptStatus(readCount, deliveredCount, userCount) {
      if (readCount === userCount) {
        this.readStatus = Constants.RECIPIENT_STATE.ALL;
      } else if (readCount > 0) {
        this.readStatus = Constants.RECIPIENT_STATE.SOME;
      } else {
        this.readStatus = Constants.RECIPIENT_STATE.NONE;
      }
      if (deliveredCount === userCount) {
        this.deliveryStatus = Constants.RECIPIENT_STATE.ALL;
      } else if (deliveredCount > 0) {
        this.deliveryStatus = Constants.RECIPIENT_STATE.SOME;
      } else {
        this.deliveryStatus = Constants.RECIPIENT_STATE.NONE;
      }
    }

    /**
     * Handle changes to the isRead property.
     *
     * If someone called m.isRead = true, AND
     * if it was previously false, AND
     * if the call didn't come from layer.Message.__updateRecipientStatus,
     * Then notify the server that the message has been read.
     *
     *
     * @method __updateIsRead
     * @private
     * @param  {boolean} value - True if isRead is true.
     */

  }, {
    key: '__updateIsRead',
    value: function __updateIsRead(value) {
      if (value) {
        this._sendReceipt(Constants.RECEIPT_STATE.READ);
        this._triggerAsync('messages:read');
        var conversation = this.getConversation(false);
        if (conversation) conversation.unreadCount--;
      }
    }

    /**
     * Send a Read or Delivery Receipt to the server.
     *
     * @method sendReceipt
     * @param {string} [type=layer.Constants.RECEIPT_STATE.READ] - One of layer.Constants.RECEIPT_STATE.READ or layer.Constants.RECEIPT_STATE.DELIVERY
     * @return {layer.Message} this
     */

  }, {
    key: 'sendReceipt',
    value: function sendReceipt() {
      var type = arguments.length <= 0 || arguments[0] === undefined ? Constants.RECEIPT_STATE.READ : arguments[0];

      if (type === Constants.RECEIPT_STATE.READ) {
        if (this.isRead) {
          return this;
        } else {
          // Without triggering the event, clearObject isn't called,
          // which means those using the toObject() data will have an isRead that doesn't match
          // this instance.  Which typically leads to lots of extra attempts
          // to mark the message as read.
          this.__isRead = true;
          this._triggerAsync('messages:read');
          var conversation = this.getConversation(false);
          if (conversation) conversation.unreadCount--;
        }
      }
      this._sendReceipt(type);
      return this;
    }

    /**
     * Send a Read or Delivery Receipt to the server.
     *
     * This bypasses any validation and goes direct to sending to the server.
     *
     * NOTE: Server errors are not handled; the local receipt state is suitable even
     * if out of sync with the server.
     *
     * @method _sendReceipt
     * @private
     * @param {string} [type=read] - One of layer.Constants.RECEIPT_STATE.READ or layer.Constants.RECEIPT_STATE.DELIVERY
     */

  }, {
    key: '_sendReceipt',
    value: function _sendReceipt(type) {
      var _this4 = this;

      // This little test exists so that we don't send receipts on Conversations we are no longer
      // participants in (participants = [] if we are not a participant)
      var conversation = this.getConversation(false);
      if (conversation && conversation.participants.length === 0) return;

      this._setSyncing();
      this._xhr({
        url: '/receipts',
        method: 'POST',
        data: {
          type: type
        },
        sync: {
          // This should not be treated as a POST/CREATE request on the Message
          operation: 'RECEIPT'
        }
      }, function () {
        return _this4._setSynced();
      });
    }

    /**
     * Send the message to all participants of the Conversation.
     *
     * Message must have parts and a valid conversation to send successfully.
     *
     * @method send
     * @param {Object} [notification] - Parameters for controling how the phones manage notifications of the new Message.
     *                          See IOS and Android docs for details.
     * @param {string} [notification.text] - Text of your notification
     * @param {string} [notification.sound] - Name of an audio file or other sound-related hint
     * @return {layer.Message} this
     */

  }, {
    key: 'send',
    value: function send(notification) {
      var _this5 = this;

      var client = this.getClient();
      if (!client) {
        throw new Error(LayerError.dictionary.clientMissing);
      }

      var conversation = this.getConversation(true);

      if (!conversation) {
        throw new Error(LayerError.dictionary.conversationMissing);
      }

      if (this.syncState !== Constants.SYNC_STATE.NEW) {
        throw new Error(LayerError.dictionary.alreadySent);
      }

      if (conversation.isLoading) {
        return conversation.once('conversations:loaded', function () {
          return _this5.send(notification);
        });
      }

      if (!this.parts || !this.parts.length) {
        throw new Error(LayerError.dictionary.partsMissing);
      }

      this.sender.userId = client.userId;
      this._setSyncing();
      client._addMessage(this);

      // Make sure that the Conversation has been created on the server
      // and update the lastMessage property
      conversation.send(this);

      // allow for modification of message before sending
      this.trigger('messages:sending');

      var data = {
        parts: new Array(this.parts.length),
        id: this.id
      };
      if (notification) data.notification = notification;

      this._preparePartsForSending(data);
      return this;
    }

    /**
     * Insures that each part is ready to send before actually sending the Message.
     *
     * @method _preparePartsForSending
     * @private
     * @param  {Object} structure to be sent to the server
     */

  }, {
    key: '_preparePartsForSending',
    value: function _preparePartsForSending(data) {
      var _this6 = this;

      var client = this.getClient();
      var count = 0;
      this.parts.forEach(function (part, index) {
        part.once('parts:send', function (evt) {
          data.parts[index] = {
            mime_type: evt.mime_type
          };
          if (evt.content) data.parts[index].content = evt.content;
          if (evt.body) data.parts[index].body = evt.body;
          if (evt.encoding) data.parts[index].encoding = evt.encoding;

          count++;
          if (count === _this6.parts.length) {
            _this6._send(data);
          }
        }, _this6);
        part._send(client);
      });
    }

    /**
     * Handle the actual sending.
     *
     * layer.Message.send has some potentially asynchronous
     * preprocessing to do before sending (Rich Content); actual sending
     * is done here.
     *
     * @method _send
     * @private
     */

  }, {
    key: '_send',
    value: function _send(data) {
      var _this7 = this;

      var client = this.getClient();
      var conversation = this.getConversation(false);

      this.sentAt = new Date();
      client.sendSocketRequest({
        method: 'POST',
        body: {
          method: 'Message.create',
          object_id: conversation.id,
          data: data
        },
        sync: {
          depends: [this.conversationId, this.id],
          target: this.id
        }
      }, function (success, socketData) {
        return _this7._sendResult(success, socketData);
      });
    }
  }, {
    key: '_getSendData',
    value: function _getSendData(data) {
      data.object_id = this.conversationId;
      return data;
    }

    /**
      * layer.Message.send() Success Callback.
      *
      * If successfully sending the message; triggers a 'sent' event,
      * and updates the message.id/url
      *
      * @method _sendResult
      * @private
      * @param {Object} messageData - Server description of the message
      */

  }, {
    key: '_sendResult',
    value: function _sendResult(_ref) {
      var success = _ref.success;
      var data = _ref.data;

      if (this.isDestroyed) return;

      if (success) {
        this._populateFromServer(data);
        this._triggerAsync('messages:sent');
      } else {
        this.trigger('messages:sent-error', { error: data });
        this.destroy();
      }
      this._setSynced();
    }

    /**
       * Standard `on()` provided by layer.Root.
       *
       * Adds some special handling of 'messages:loaded' so that calls such as
       *
       *      var m = client.getMessage('layer:///messages/123', true)
       *      .on('messages:loaded', function() {
       *          myrerender(m);
       *      });
       *      myrender(m); // render a placeholder for m until the details of m have loaded
       *
       * can fire their callback regardless of whether the client loads or has
       * already loaded the Message.
       *
       * @method on
       * @param  {string} eventName
       * @param  {Function} eventHandler
       * @param  {Object} context
       * @return {layer.Message} this
       */

  }, {
    key: 'on',
    value: function on(name, callback, context) {
      var hasLoadedEvt = name === 'messages:loaded' || name && (typeof name === 'undefined' ? 'undefined' : _typeof(name)) === 'object' && name['messages:loaded'];

      if (hasLoadedEvt && !this.isLoading) {
        (function () {
          var callNow = name === 'messages:loaded' ? callback : name['messages:loaded'];
          Util.defer(function () {
            return callNow.apply(context);
          });
        })();
      }
      _get(Object.getPrototypeOf(Message.prototype), 'on', this).call(this, name, callback, context);
      return this;
    }

    /**
     * Delete the Message from the server.
     *
     * This call will support various deletion modes.  Calling without a deletion mode is deprecated.
     *
     * Deletion Modes:
     *
     * * layer.Constants.DELETION_MODE.ALL: This deletes the local copy immediately, and attempts to also
     *   delete the server's copy.
     *
     * @method delete
     * @param {number} deletionMode - layer.Constants.DELETION_MODE.ALL is only supported mode at this time
     */

  }, {
    key: 'delete',
    value: function _delete(mode) {
      if (this.isDestroyed) throw new Error(LayerError.dictionary.isDestroyed);

      var queryStr = undefined;
      switch (mode) {
        case Constants.DELETION_MODE.ALL:
        case true:
          queryStr = 'mode=all_participants';
          break;
        case Constants.DELETION_MODE.MY_DEVICES:
          queryStr = 'mode=my_devices';
          break;
        default:
          throw new Error(LayerError.dictionary.deletionModeUnsupported);
      }

      var id = this.id;
      var client = this.getClient();
      this._xhr({
        url: '?' + queryStr,
        method: 'DELETE'
      }, function (result) {
        if (!result.success && (!result.data || result.data.id !== 'not_found')) Message.load(id, client);
      });

      this._deleted();
      this.destroy();
    }

    /**
     * The Message has been deleted.
     *
     * Called from layer.Websockets.ChangeManager and from layer.Message.delete();
     *
     * Destroy must be called separately, and handles most cleanup.
     *
     * @method _deleted
     * @protected
     */

  }, {
    key: '_deleted',
    value: function _deleted() {
      this.trigger('messages:delete');
    }

    /**
     * Remove this Message from the system.
     *
     * This will deregister the Message, remove all events
     * and allow garbage collection.
     *
     * @method destroy
     */

  }, {
    key: 'destroy',
    value: function destroy() {
      var client = this.getClient();
      if (client) client._removeMessage(this);
      this.parts.forEach(function (part) {
        return part.destroy();
      });
      this.__parts = null;

      _get(Object.getPrototypeOf(Message.prototype), 'destroy', this).call(this);
    }

    /**
     * Populates this instance with the description from the server.
     *
     * Can be used for creating or for updating the instance.
     *
     * @method _populateFromServer
     * @protected
     * @param  {Object} m - Server description of the message
     */

  }, {
    key: '_populateFromServer',
    value: function _populateFromServer(message) {
      var _this8 = this;

      this.id = message.id;
      this.url = message.url;
      var oldPosition = this.position;
      this.position = message.position;

      // Assign IDs to preexisting Parts so that we can call getPartById()
      if (this.parts) {
        this.parts.forEach(function (part, index) {
          if (!part.id) part.id = _this8.id + '/parts/' + index;
        });
      }

      this.parts = message.parts.map(function (part) {
        var existingPart = _this8.getPartById(part.id);
        if (existingPart) {
          existingPart._populateFromServer(part);
          return existingPart;
        } else {
          return MessagePart._createFromServer(part);
        }
      });

      this.recipientStatus = message.recipient_status || {};

      this.isRead = !message.is_unread;

      this.sentAt = new Date(message.sent_at);
      this.receivedAt = message.received_at ? new Date(message.received_at) : undefined;

      this.sender = {
        userId: message.sender.user_id || '',
        name: message.sender.name || ''
      };

      this._setSynced();

      if (oldPosition && oldPosition !== this.position) {
        this._triggerAsync('messages:change', {
          oldValue: oldPosition,
          newValue: this.position,
          property: 'position'
        });
      }
    }

    /**
     * Returns the Message's layer.MessagePart with the specified the part ID.
     *
     * @method getPartById
     * @param {string} partId
     * @return {layer.MessagePart}
     */

  }, {
    key: 'getPartById',
    value: function getPartById(partId) {
      return this.parts ? this.parts.filter(function (part) {
        return part.id === partId;
      })[0] : null;
    }

    /**
     * Accepts json-patch operations for modifying recipientStatus.
     *
     * @method _handlePatchEvent
     * @private
     * @param  {Object[]} data - Array of operations
     */

  }, {
    key: '_handlePatchEvent',
    value: function _handlePatchEvent(newValue, oldValue, paths) {
      this._inLayerParser = false;
      if (paths[0].indexOf('recipient_status') === 0) {
        this.__updateRecipientStatus(this.recipientStatus, oldValue);
      }
      this._inLayerParser = true;
    }

    /**
     * Any xhr method called on this message uses the message's url.
     *
     * For more info on xhr method parameters see {@link layer.ClientAuthenticator#xhr}
     *
     * @method _xhr
     * @protected
     * @return {layer.Message} this
     */

  }, {
    key: '_xhr',
    value: function _xhr(options, callback) {
      // initialize
      var inUrl = options.url;
      var client = this.getClient();

      // Validatation
      if (this.isDestroyed) throw new Error(LayerError.dictionary.isDestroyed);
      if (!('url' in options)) throw new Error(LayerError.dictionary.urlRequired);

      if (inUrl && !inUrl.match(/^(\/|\?)/)) options.url = inUrl = '/' + options.url;
      if (!options.sync) options.url = this.url + options.url;

      // Setup sync structure
      options.sync = this._setupSyncObject(options.sync);

      client.xhr(options, callback);
      return this;
    }
  }, {
    key: '_getUrl',
    value: function _getUrl(url) {
      return this.url + (url || '');
    }
  }, {
    key: '_setupSyncObject',
    value: function _setupSyncObject(sync) {
      if (sync !== false) {
        if (!sync) sync = {};
        if (!sync.target) sync.target = this.id;
        if (!sync.depends) {
          sync.depends = [this.conversationId];
        } else if (sync.depends.indexOf(this.id) === -1) {
          sync.depends.push(this.conversationId);
        }
      }
      return sync;
    }

    /**
     * Get all text parts of the Message.
     *
     * Utility method for extracting all of the text/plain parts
     * and concatenating all of their bodys together into a single string.
     *
     * @method getText
     * @param {string} [joinStr='.  '] If multiple message parts of type text/plain, how do you want them joined together?
     * @return {string}
     */

  }, {
    key: 'getText',
    value: function getText() {
      var joinStr = arguments.length <= 0 || arguments[0] === undefined ? '. ' : arguments[0];

      var textArray = this.parts.filter(function (part) {
        return part.mimeType === 'text/plain';
      }).map(function (part) {
        return part.body;
      });
      textArray = textArray.filter(function (data) {
        return data;
      });
      return textArray.join(joinStr);
    }

    /**
     * Returns a plain object.
     *
     * Object will have all the same public properties as this
     * Message instance.  New object is returned any time
     * any of this object's properties change.
     *
     * @method toObject
     * @return {Object} POJO version of this object.
     */

  }, {
    key: 'toObject',
    value: function toObject() {
      if (!this._toObject) {
        this._toObject = _get(Object.getPrototypeOf(Message.prototype), 'toObject', this).call(this);
        this._toObject.recipientStatus = Util.clone(this.recipientStatus);
        this._toObject.isNew = this.isNew();
        this._toObject.isSaving = this.isSaving();
        this._toObject.isSaved = this.isSaved();
        this._toObject.isSynced = this.isSynced();
      }
      return this._toObject;
    }
  }, {
    key: '_triggerAsync',
    value: function _triggerAsync(evtName, args) {
      this._clearObject();
      _get(Object.getPrototypeOf(Message.prototype), '_triggerAsync', this).call(this, evtName, args);
    }
  }, {
    key: 'trigger',
    value: function trigger(evtName, args) {
      this._clearObject();
      _get(Object.getPrototypeOf(Message.prototype), 'trigger', this).call(this, evtName, args);
    }

    /**
     * Creates a message from the server's representation of a message.
     *
     * Similar to _populateFromServer, however, this method takes a
     * message description and returns a new message instance using _populateFromServer
     * to setup the values.
     *
     * @method _createFromServer
     * @protected
     * @static
     * @param  {Object} message - Server's representation of the message
     * @param  {string} conversationId - Conversation for the message
     * @param  {layer.Client} client
     * @return {layer.Message}
     */

  }, {
    key: '_loaded',
    value: function _loaded(data) {
      this.conversationId = data.conversation.id;
      this.getClient()._addMessage(this);
    }

    /**
     * Identifies whether a Message receiving the specified patch data should be loaded from the server.
     *
     * Applies only to Messages that aren't already loaded; used to indicate if a change event is
     * significant enough to load the Message and trigger change events on that Message.
     *
     * At this time there are no properties that are patched on Messages via websockets
     * that would justify loading the Message from the server so as to notify the app.
     *
     * Only recipient status changes and maybe is_unread changes are sent;
     * neither of which are relevant to an app that isn't rendering that message.
     *
     * @method _loadResourceForPatch
     * @static
     * @private
     */

  }], [{
    key: '_createFromServer',
    value: function _createFromServer(message, client) {
      var fromWebsocket = message.fromWebsocket;
      return new Message({
        conversationId: message.conversation.id,
        fromServer: message,
        clientId: client.appId,
        _fromDB: message._fromDB,
        _notify: fromWebsocket && message.is_unread && message.sender.user_id !== client.userId
      });
    }
  }, {
    key: '_loadResourceForPatch',
    value: function _loadResourceForPatch(patchData) {
      return false;
    }
  }]);

  return Message;
}(Syncable);

/**
 * Client that the Message belongs to.
 *
 * Actual value of this string matches the appId.
 * @type {string}
 */


Message.prototype.clientId = '';

/**
 * Conversation that this Message belongs to.
 *
 * Actual value is the ID of the Conversation's ID.
 *
 * @type {string}
 */
Message.prototype.conversationId = '';

/**
 * Array of layer.MessagePart objects
 *
 * @type {layer.MessagePart[]}
 */
Message.prototype.parts = null;

/**
 * Message Identifier.
 *
 * This value is shared by all participants and devices.
 *
 * @type {String}
 */
Message.prototype.id = '';

/**
 * URL to the server endpoint for operating on the message.
 * @type {String}
 */
Message.prototype.url = '';

/**
 * Time that the message was sent.
 * @type {Date}
 */
Message.prototype.sentAt = null;

/**
 * Time that the first delivery receipt was sent by your
 * user acknowledging receipt of the message.
 * @type {Date}
 */
Message.prototype.receivedAt = null;

/**
 * Object representing the sender of the Message.
 *
 * Contains `userId` property which is
 * populated when the message was sent by a participant (or former participant)
 * in the Conversation.  Contains a `name` property which is
 * used when the Message is sent via a Named Platform API sender
 * such as "Admin", "Moderator", "Robot Jerking you Around".
 *
 *      <span class='sent-by'>
 *        {message.sender.name || getDisplayNameForId(message.sender.userId)}
 *      </span>
 *
 * @type {Object}
 */
Message.prototype.sender = null;

/**
 * Position of this message within the conversation.
 *
 * NOTES:
 *
 * 1. Deleting a message does not affect position of other Messages.
 * 2. A position is not gaurenteed to be unique (multiple messages sent at the same time could
 * all claim the same position)
 * 3. Each successive message within a conversation should expect a higher position.
 *
 * @type {Number}
 */
Message.prototype.position = 0;

/**
 * Hint used by layer.Client on whether to trigger a messages:notify event.
 *
 * @type {boolean}
 * @private
 */
Message.prototype._notify = false;

/* Recipient Status */

/**
 * Read/delivery State of all participants.
 *
 * This is an object containing keys for each participant,
 * and a value of:
 * * layer.RECEIPT_STATE.SENT
 * * layer.RECEIPT_STATE.DELIVERED
 * * layer.RECEIPT_STATE.READ
 * * layer.RECEIPT_STATE.PENDING
 *
 * @type {Object}
 */
Message.prototype.recipientStatus = null;

/**
 * True if this Message has been read by this user.
 *
 * You can change isRead programatically
 *
 *      m.isRead = true;
 *
 * This will automatically notify the server that the message was read by your user.
 * @type {Boolean}
 */
Message.prototype.isRead = false;

/**
 * This property is here for convenience only; it will always be the opposite of isRead.
 * @type {Boolean}
 * @readonly
 */
Object.defineProperty(Message.prototype, 'isUnread', {
  enumerable: true,
  get: function get() {
    return !this.isRead;
  }
});

/**
 * Have the other participants read this Message yet.
 *
 * This value is one of:
 *
 *  * layer.Constants.RECIPIENT_STATE.ALL
 *  * layer.Constants.RECIPIENT_STATE.SOME
 *  * layer.Constants.RECIPIENT_STATE.NONE
 *
 *  This value is updated any time recipientStatus changes.
 *
 * @type {String}
 */
Message.prototype.readStatus = Constants.RECIPIENT_STATE.NONE;

/**
 * Have the other participants received this Message yet.
 *
  * This value is one of:
 *
 *  * layer.Constants.RECIPIENT_STATE.ALL
 *  * layer.Constants.RECIPIENT_STATE.SOME
 *  * layer.Constants.RECIPIENT_STATE.NONE
 *
 *  This value is updated any time recipientStatus changes.
 *
 *
 * @type {String}
 */
Message.prototype.deliveryStatus = Constants.RECIPIENT_STATE.NONE;

/**
 * The time that this client created this instance.
 * @type {Date}
 */
Message.prototype.localCreatedAt = null;

Message.prototype._toObject = null;

Message.prototype._fromDB = false;

Message.eventPrefix = 'messages';

Message.prefixUUID = 'layer:///messages/';

Message.inObjectIgnore = Syncable.inObjectIgnore;

Message.bubbleEventParent = 'getClient';

Message.imageTypes = ['image/gif', 'image/png', 'image/jpeg', 'image/jpg'];

Message._supportedEvents = [

/**
 * Message has been loaded from the server.
 *
 * Note that this is only used in response to the layer.Message.load() method.
 * @event
 * @param {layer.LayerEvent} evt
 */
'messages:loaded',

/**
 * The load method failed to load the message from the server.
 *
 * Note that this is only used in response to the layer.Message.load() method.
 * @event
 * @param {layer.LayerEvent} evt
 */
'messages:loaded-error',

/**
 * Message deleted from the server.
 *
 * Caused by a call to layer.Message.delete() or a websocket event.
 * @param {layer.LayerEvent} evt
 * @event
 */
'messages:delete',

/**
 * Message is about to be sent.
 *
 * Last chance to modify or validate the message prior to sending.
 *
 *     message.on('messages:sending', function(evt) {
 *        message.addPart({mimeType: 'application/location', body: JSON.stringify(getGPSLocation())});
 *     });
 *
 * Typically, you would listen to this event more broadly using `client.on('messages:sending')`
 * which would trigger before sending ANY Messages.
 *
 * @event
 * @param {layer.LayerEvent} evt
 */
'messages:sending',

/**
 * Message has been received by the server.
 *
 * It does NOT indicate delivery to other users.
 *
 * It does NOT indicate messages sent by other users.
 *
 * @event
 * @param {layer.LayerEvent} evt
 */
'messages:sent',

/**
 * Server failed to receive the Message.
 *
 * Message will be deleted immediately after firing this event.
 *
 * @event
 * @param {layer.LayerEvent} evt
 * @param {layer.LayerError} evt.error
 */
'messages:sent-error',

/**
 * Fired when message.isRead is set to true.
 *
 * Sometimes this event is triggered by marking the Message as read locally; sometimes its triggered
 * by your user on a separate device/browser marking the Message as read remotely.
 *
 * Useful if you style unread messages in bold, and need an event to tell you when
 * to unbold the message.
 *
 * @event
 * @param {layer.LayerEvent} evt
 * @param {layer.Message[]} evt.messages - Array of messages that have just been marked as read
 */
'messages:read',

/**
 * The recipientStatus property has changed.
 *
 * This happens in response to an update
 * from the server... but is also caused by marking the current user has having read
 * or received the message.
 * @event
 * @param {layer.LayerEvent} evt
 */
'messages:change'].concat(Syncable._supportedEvents);

Root.initClass.apply(Message, [Message, 'Message']);
Syncable.subclasses.push(Message);
module.exports = Message;

},{"./client-registry":9,"./client-utils":10,"./const":12,"./layer-error":16,"./message-part":19,"./root":24,"./syncable":27}],21:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * This class manages a state variable for whether we are online/offline, triggers events
 * when the state changes, and determines when to perform tests to validate our online status.
 *
 * It performs the following tasks:
 *
 * 1. Any time we go more than this.pingFrequency (100 seconds) without any data from the server, flag us as being offline.
 *    Rationale: The websocket manager is calling `getCounter` every 30 seconds; so it would have had to fail to get any response
 *    3 times before we give up.
 * 2. While we are offline, ping the server until we determine we are in fact able to connect to the server
 * 3. Trigger events `connected` and `disconnected` to let the rest of the system know when we are/are not connected.
 *    NOTE: The Websocket manager will use that to reconnect its websocket, and resume its `getCounter` call every 30 seconds.
 *
 * NOTE: Apps that want to be notified of changes to online/offline state should see layer.Client's `online` event.
 *
 * NOTE: One iteration of this class treated navigator.onLine = false as fact.  If onLine is false, then we don't need to test
 * anything.  If its true, then this class verifies it can reach layer's servers.  However, https://code.google.com/p/chromium/issues/detail?id=277372 has replicated multiple times in chrome; this bug causes one tab of chrome to have navigator.onLine=false while all other tabs
 * correctly report navigator.onLine=true.  As a result, we can't rely on this value and this class must continue to poll the server while
 * offline and to ignore values from navigator.onLine.  Future Work: Allow non-chrome browsers to use navigator.onLine.
 *
 * @class  layer.OnlineStateManager
 * @private
 * @extends layer.Root
 *
 */
var Root = require('./root');
var xhr = require('./xhr');
var logger = require('./logger');
var Utils = require('./client-utils');

var OnlineStateManager = function (_Root) {
  _inherits(OnlineStateManager, _Root);

  /**
   * Creates a new OnlineStateManager.
   *
   * An Application is expected to only have one of these.
   *
   *      var onlineStateManager = new layer.OnlineStateManager({
   *          socketManager: socketManager,
   *          testUrl: 'https://api.layer.com/nonces'
   *      });
   *
   * @method constructor
   * @param  {Object} options
   * @param  {layer.Websockets.SocketManager} options.socketManager - A websocket manager to monitor for messages
   * @param  {string} options.testUrl - A url to send requests to when testing if we are online
   */

  function OnlineStateManager(options) {
    _classCallCheck(this, OnlineStateManager);

    // Listen to all xhr events and websocket messages for online-status info

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(OnlineStateManager).call(this, options));

    xhr.addConnectionListener(function (evt) {
      return _this._connectionListener(evt);
    });
    _this.socketManager.on('message', function () {
      return _this._connectionListener({ status: 'connection:success' });
    }, _this);

    // Any change in online status reported by the browser should result in
    // an immediate update to our online/offline state
    /* istanbul ignore else */
    if (typeof window !== 'undefined') {
      window.addEventListener('online', _this._handleOnlineEvent.bind(_this));
      window.addEventListener('offline', _this._handleOnlineEvent.bind(_this));
    }
    return _this;
  }

  /**
   * We don't actually start managing our online state until after the client has authenticated.
   * Call start() when we are ready for the client to start managing our state.
   *
   * The client won't call start() without first validating that we have a valid session, so by definition,
   * calling start means we are online.
   *
   * @method start
   */


  _createClass(OnlineStateManager, [{
    key: 'start',
    value: function start() {
      logger.info('OnlineStateManager: start');
      this.isClientReady = true;
      this.isOnline = true;
      if (!this._firstStart) {
        this.trigger('connected', { offlineDuration: 0 });
      }
      this._firstStart = false;
      this._scheduleNextOnlineCheck();
    }

    /**
     * If the client becomes unauthenticated, stop checking if we are online, and announce that we are offline.
     *
     * @method stop
     */

  }, {
    key: 'stop',
    value: function stop() {
      logger.info('OnlineStateManager: stop');
      this.isClientReady = false;
      this._clearCheck();
      this._changeToOffline();
    }

    /**
     * Schedules our next call to _onlineExpired if online or checkOnlineStatus if offline.
     *
     * @method _scheduleNextOnlineCheck
     * @private
     */

  }, {
    key: '_scheduleNextOnlineCheck',
    value: function _scheduleNextOnlineCheck() {
      logger.debug('OnlineStateManager: skip schedule');
      if (this.isDestroyed || !this.isClientReady) return;

      // Replace any scheduled calls with the newly scheduled call:
      this._clearCheck();

      // If this is called while we are online, then we are using this to detect when we've gone without data for more than pingFrequency.
      // Call this._onlineExpired after pingFrequency of no server responses.
      if (this.isOnline) {
        logger.debug('OnlineStateManager: Scheduled onlineExpired');
        this.onlineCheckId = setTimeout(this._onlineExpired.bind(this), this.pingFrequency);
      }

      // If this is called while we are offline, we're doing exponential backoff pinging the server to see if we've come back online.
      else {
          logger.info('OnlineStateManager: Scheduled checkOnlineStatus');
          var duration = Utils.getExponentialBackoffSeconds(this.maxOfflineWait, Math.min(10, this.offlineCounter++));
          this.onlineCheckId = setTimeout(this.checkOnlineStatus.bind(this), Math.floor(duration * 1000));
        }
    }

    /**
     * Cancels any upcoming calls to checkOnlineStatus
     *
     * @method _clearCheck
     * @private
     */

  }, {
    key: '_clearCheck',
    value: function _clearCheck() {
      if (this.onlineCheckId) {
        clearTimeout(this.onlineCheckId);
        this.onlineCheckId = 0;
      }
    }

    /**
     * Respond to the browser's online/offline events.
     *
     * Our response is not to trust them, but to use them as
     * a trigger to indicate we should immediately do our own
     * validation.
     *
     * @method _handleOnlineEvent
     * @private
     * @param  {Event} evt - Browser online/offline event object
     */

  }, {
    key: '_handleOnlineEvent',
    value: function _handleOnlineEvent(evt) {
      // Reset the counter because our first request may fail as they may not be
      // fully connected yet
      this.offlineCounter = 0;
      this.checkOnlineStatus();
    }

    /**
     * Our online state has expired; we are now offline.
     *
     * If this method gets called, it means that our connection has gone too long without any data
     * and is now considered to be disconnected.  Start scheduling tests to see when we are back online.
     *
     * @method _onlineExpired
     * @private
     */

  }, {
    key: '_onlineExpired',
    value: function _onlineExpired() {
      this._clearCheck();
      this._changeToOffline();
      this._scheduleNextOnlineCheck();
    }

    /**
     * Get a nonce to see if we can reach the server.
     *
     * We don't care about the result,
     * we just care about triggering a 'connection:success' or 'connection:error' event
     * which connectionListener will respond to.
     *
     *      client.onlineManager.checkOnlineStatus(function(result) {
     *          alert(result ? 'We're online!' : 'Doh!');
     *      });
     *
     * @method checkOnlineStatus
     * @param {Function} callback
     * @param {boolean} callback.isOnline - Callback is called with true if online, false if not
     */

  }, {
    key: 'checkOnlineStatus',
    value: function checkOnlineStatus(callback) {
      var _this2 = this;

      this._clearCheck();

      logger.info('OnlineStateManager: Firing XHR for online check');
      this._lastCheckOnlineStatus = new Date();
      // Ping the server and see if we're connected.
      xhr({
        url: this.testUrl,
        method: 'POST',
        headers: {
          accept: 'application/vnd.layer+json; version=1.0'
        }
      }, function () {
        // this.isOnline will be updated via _connectionListener prior to this line executing
        if (callback) callback(_this2.isOnline);
      });
    }

    /**
     * On determining that we are offline, handles the state transition and logging.
     *
     * @method _changeToOffline
     * @private
     */

  }, {
    key: '_changeToOffline',
    value: function _changeToOffline() {
      if (this.isOnline) {
        this.isOnline = false;
        this.trigger('disconnected');
        logger.info('OnlineStateManager: Connection lost');
      }
    }

    /**
     * Called whenever a websocket event arrives, or an xhr call completes; updates our isOnline state.
     *
     * Any call to this method will reschedule our next is-online test
     *
     * @method _connectionListener
     * @private
     * @param  {string} evt - Name of the event; either 'connection:success' or 'connection:error'
     */

  }, {
    key: '_connectionListener',
    value: function _connectionListener(evt) {
      // If event is a success, change us to online
      if (evt.status === 'connection:success') {
        var lastTime = this.lastMessageTime;
        this.lastMessageTime = new Date();
        if (!this.isOnline) {
          this.isOnline = true;
          this.offlineCounter = 0;
          this.trigger('connected', { offlineDuration: lastTime ? Date.now() - lastTime : 0 });
          if (this.connectedCounter === undefined) this.connectedCounter = 0;
          this.connectedCounter++;
          logger.info('OnlineStateManager: Connected restored');
        }
      }

      // If event is NOT success, change us to offline.
      else {
          this._changeToOffline();
        }

      this._scheduleNextOnlineCheck();
    }

    /**
     * Cleanup/shutdown
     *
     * @method destroy
     */

  }, {
    key: 'destroy',
    value: function destroy() {
      this._clearCheck();
      this.socketManager = null;
      _get(Object.getPrototypeOf(OnlineStateManager.prototype), 'destroy', this).call(this);
    }
  }]);

  return OnlineStateManager;
}(Root);

OnlineStateManager.prototype.isClientReady = false;

/**
 * URL To fire when testing to see if we are online.
 * @type {String}
 */
OnlineStateManager.prototype.testUrl = '';

/**
 * A Websocket manager whose 'message' event we will listen to
 * in order to know that we are still online.
 * @type {layer.Websockets.SocketManager}
 */
OnlineStateManager.prototype.socketManager = null;

/**
 * Number of testUrl requests we've been offline for.
 *
 * Will stop growing once the number is suitably large (10-20).
 * @type {Number}
 */
OnlineStateManager.prototype.offlineCounter = 0;

/**
 * Maximum wait during exponential backoff while offline.
 *
 * While offline, exponential backoff is used to calculate how long to wait between checking with the server
 * to see if we are online again. This value determines the maximum wait; any higher value returned by exponential backoff
 * are ignored and this value used instead.
 * Value is measured in seconds.
 * @type {Number}
 */
OnlineStateManager.prototype.maxOfflineWait = 5 * 60;

/**
 * Minimum wait between tries in ms.
 * @type {Number}
 */
OnlineStateManager.prototype.minBackoffWait = 100;

/**
 * Time that the last successful message was observed.
 * @type {Date}
 */
OnlineStateManager.prototype.lastMessageTime = null;

/**
 * For debugging, tracks the last time we checked if we are online.
 * @type {Date}
 */
OnlineStateManager.prototype._lastCheckOnlineStatus = null;

/**
 * Are we currently online?
 * @type {Boolean}
 */
OnlineStateManager.prototype.isOnline = false;

/**
 * setTimeoutId for the next checkOnlineStatus() call.
 * @type {Number}
 */
OnlineStateManager.prototype.onlineCheckId = 0;

/**
 * True until the first time start() is called.
 * @type {boolean}
 */
OnlineStateManager.prototype._firstStart = true;

/**
 * If we are online, how often do we need to ping to verify we are still online.
 *
 * Value is reset any time we observe any messages from the server.
 * Measured in miliseconds. NOTE: Websocket has a separate ping which mostly makes
 * this one unnecessary.  May end up removing this one... though we'd keep the
 * ping for when our state is offline.
 * @type {Number}
 */
OnlineStateManager.prototype.pingFrequency = 100 * 1000;

OnlineStateManager._supportedEvents = [
/**
 * We appear to be online and able to send and receive
 * @event connected
 * @param {number} onlineDuration - Number of miliseconds since we were last known to be online
 */
'connected',

/**
 * We appear to be offline and unable to send or receive
 * @event disconnected
 */
'disconnected'].concat(Root._supportedEvents);
Root.initClass.apply(OnlineStateManager, [OnlineStateManager, 'OnlineStateManager']);
module.exports = OnlineStateManager;

},{"./client-utils":10,"./logger":18,"./root":24,"./xhr":36}],22:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Query = require('./query');
var LayerError = require('./layer-error');

/**
 * Query builder class generating queries for a set of messages.
 * Used in Creating and Updating layer.Query instances.
 *
 * Using the Query Builder, we should be able to instantiate a Query
 *
 *      var qBuilder = QueryBuilder
 *       .messages()
 *       .forConversation('layer:///conversations/ffffffff-ffff-ffff-ffff-ffffffffffff')
 *       .paginationWindow(100);
 *      var query = client.createQuery(qBuilder);
 *
 *
 * You can then create additional builders and update the query:
 *
 *      var qBuilder2 = QueryBuilder
 *       .messages()
 *       .forConversation('layer:///conversations/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb')
 *       .paginationWindow(200);
 *      query.update(qBuilder);
 *
 * @class layer.QueryBuilder.MessagesQuery
 */

var MessagesQuery = function () {

  /**
   * Creates a new query builder for a set of messages.
   *
   * Standard use is without any arguments.
   *
   * @method constructor
   * @param  {Object} [query=null]
   */

  function MessagesQuery(query) {
    _classCallCheck(this, MessagesQuery);

    if (query) {
      this._query = {
        model: query.model,
        returnType: query.returnType,
        dataType: query.dataType,
        paginationWindow: query.paginationWindow
      };
    } else {
      this._query = {
        model: Query.Message,
        returnType: 'object',
        dataType: 'object',
        paginationWindow: Query.prototype.paginationWindow
      };
    }

    // TODO remove when messages can be fetched via query API rather than `GET /messages`
    this._conversationIdSet = false;
  }

  /**
   * Query for messages in this Conversation.
   *
   * @method forConversation
   * @param  {String} conversationId
   */


  _createClass(MessagesQuery, [{
    key: 'forConversation',
    value: function forConversation(conversationId) {
      if (conversationId) {
        this._query.predicate = 'conversation.id = \'' + conversationId + '\'';
        this._conversationIdSet = true;
      } else {
        delete this._query.predicate;
        this._conversationIdSet = false;
      }
      return this;
    }

    /**
     * Sets the pagination window/number of messages to fetch from the local cache or server.
     *
     * Currently only positive integers are supported.
     *
     * @method paginationWindow
     * @param  {number} win
     */

  }, {
    key: 'paginationWindow',
    value: function paginationWindow(win) {
      this._query.paginationWindow = win;
      return this;
    }

    /**
     * Returns the built query object to send to the server.
     *
     * Called by layer.QueryBuilder. You should not need to call this.
     *
     * @method build
     */

  }, {
    key: 'build',
    value: function build() {
      if (!this._conversationIdSet) {
        throw new Error(LayerError.dictionary.conversationMissing);
      }

      return this._query;
    }
  }]);

  return MessagesQuery;
}();

var AnnouncementQuery = function (_MessagesQuery) {
  _inherits(AnnouncementQuery, _MessagesQuery);

  function AnnouncementQuery() {
    _classCallCheck(this, AnnouncementQuery);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(AnnouncementQuery).apply(this, arguments));
  }

  _createClass(AnnouncementQuery, [{
    key: 'build',
    value: function build() {
      return this._query;
    }
  }]);

  return AnnouncementQuery;
}(MessagesQuery);

/**
 * Query builder class generating queries for a set of Conversations.
 *
 * Used in Creating and Updating layer.Query instances.
 * Note that at this time, the only thing we can query for is
 * ALL Conversations; primary use for this is to page through the Conversations.
 *
 * To get started:
 *
 *      var qBuilder = QueryBuilder
 *       .conversations()
 *       .paginationWindow(100);
 *      var query = client.createQuery(qBuilder);
 *
 * You can then create additional builders and update the query:
 *
 *      var qBuilder2 = QueryBuilder
 *       .conversations()
 *       .paginationWindow(200);
 *      query.update(qBuilder);
 *
 * @class layer.QueryBuilder.ConversationsQuery
 */


var ConversationsQuery = function () {

  /**
   * Creates a new query builder for a set of conversations.
   *
   * Standard use is without any arguments.
   *
   * @method constructor
   * @param  {Object} [query=null]
   */

  function ConversationsQuery(query) {
    _classCallCheck(this, ConversationsQuery);

    if (query) {
      this._query = {
        model: query.model,
        returnType: query.returnType,
        dataType: query.dataType,
        paginationWindow: query.paginationWindow,
        sortBy: query.sortBy
      };
    } else {
      this._query = {
        model: Query.Conversation,
        returnType: 'object',
        dataType: 'object',
        paginationWindow: Query.prototype.paginationWindow,
        sortBy: null
      };
    }
  }

  /**
   * Sets the pagination window/number of messages to fetch from the local cache or server.
   *
   * Currently only positive integers are supported.
   *
   * @method paginationWindow
   * @param  {number} win
   * @return {layer.QueryBuilder} this
   */


  _createClass(ConversationsQuery, [{
    key: 'paginationWindow',
    value: function paginationWindow(win) {
      this._query.paginationWindow = win;
      return this;
    }

    /**
     * Sets the sorting options for the Conversation.
     *
     * Currently only supports descending order
     * Currently only supports fieldNames of "createdAt" and "lastMessage.sentAt"
     *
     * @method sortBy
     * @param  {string} fieldName  - field to sort by
     * @param  {boolean} asc - Is an ascending sort?
     * @return {layer.QueryBuilder} this
     */

  }, {
    key: 'sortBy',
    value: function sortBy(fieldName) {
      var asc = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      this._query.sortBy = [_defineProperty({}, fieldName, asc ? 'asc' : 'desc')];
      return this;
    }

    /**
     * Returns the built query object to send to the server.
     *
     * Called by layer.QueryBuilder. You should not need to call this.
     *
     * @method build
     */

  }, {
    key: 'build',
    value: function build() {
      return this._query;
    }
  }]);

  return ConversationsQuery;
}();

/**
 * Query builder class. Used with layer.Query to specify what local/remote
 * data changes to subscribe to.  For examples, see layer.QueryBuilder.MessagesQuery
 * and layer.QueryBuilder.ConversationsQuery.  This static class is used to instantiate
 * MessagesQuery and ConversationsQuery Builder instances:
 *
 *      var conversationsQueryBuilder = QueryBuilder.conversations();
 *      var messagesQueryBuidler = QueryBuilder.messages();
 *
 * Should you use these instead of directly using the layer.Query class?
 * That is a matter of programming style and preference, there is no
 * correct answer.
 *
 * @class layer.QueryBuilder
 */


var QueryBuilder = {

  /**
   * Create a new layer.MessagesQuery instance.
   *
   * @method messages
   * @static
   * @returns {layer.QueryBuilder.MessagesQuery}
   */

  messages: function messages() {
    return new MessagesQuery();
  },
  announcements: function announcements() {
    return new AnnouncementQuery();
  },


  /**
   * Create a new layer.ConversationsQuery instance.
   *
   * @method conversations
   * @static
   * @returns {layer.QueryBuilder.ConversationsQuery}
   */
  conversations: function conversations() {
    return new ConversationsQuery();
  },


  /**
   * Takes the return value of QueryBuilder.prototype.build and creates a
   * new QueryBuilder.
   *
   * Used within layer.Query.prototype.toBuilder.
   *
   * @method fromQueryObject
   * @private
   * @param {Object} obj
   * @static
   */
  fromQueryObject: function fromQueryObject(obj) {
    switch (obj.model) {
      case Query.Message:
        return new MessagesQuery(obj);
      case Query.Announcement:
        return new AnnouncementQuery(obj);
      case Query.Conversation:
        return new ConversationsQuery(obj);
      default:
        return null;
    }
  }
};

module.exports = QueryBuilder;

},{"./layer-error":16,"./query":23}],23:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * There are two ways to instantiate this class:
 *
 *      // 1. Using a Query Builder
 *      var queryBuilder = QueryBuilder.conversations().sortBy('lastMessage');
 *      var query = client.createQuery(client, queryBuilder);
 *
 *      // 2. Passing properties directly
 *      var query = client.createQuery({
 *        client: client,
 *        model: layer.Query.Conversation,
 *        sortBy: [{'createdAt': 'desc'}]
 *      });
 *
 * You can change the data selected by your query any time you want using:
 *
 *      query.update({
 *        paginationWindow: 200
 *      });
 *
 *      query.update({
 *        predicate: 'conversation.id = "' + conv.id + "'"
 *      });
 *
 *     // Or use the Query Builder:
 *     queryBuilder.paginationWindow(200);
 *     query.update(queryBuilder);
 *
 * You can release Conversations and Messages held in memory by your queries when done with them:
 *
 *      query.destroy();
 *
 * #### sortBy
 *
 * Note that the sortBy property is only supported for Conversations at this time and only
 * supports "createdAt" and "lastMessage.sentAt" as sort fields.
 *
 * #### dataType
 *
 * The layer.Query.dataType property lets you specify what type of data shows up in your results:
 *
 * ```javascript
 * var query = client.createQuery({
 *     model: layer.Query.Message,
 *     predicate: "conversation.id = 'layer:///conversations/uuid'",
 *     dataType: layer.Query.InstanceDataType
 * })
 *
 * var query = client.createQuery({
 *     model: layer.Query.Message,
 *     predicate: "conversation.id = 'layer:///conversations/uuid'",
 *     dataType: layer.Query.ObjectDataType
 * })
 * ```
 *
 * The property defaults to layer.Query.InstanceDataType.  Instances support methods and let you subscribe to events for direct notification
 * of changes to any of the results of your query:
 *
 * ```javascript
 * query.data[0].on('messages:read', function() {
 *     alert('The first message has been read!');
 * });
 * ```
 *
 * A value of layer.Query.ObjectDataType will cause the data to be an array of immutable objects rather than instances.  One can still get an instance from the POJO:
 *
 * ```javascript
 * var m = client.getMessage(query.data[0].id);
 * m.on('messages:read', function() {
 *     alert('The first message has been read!');
 * });
 * ```
 *
 * ## Query Events
 *
 * Queries fire events whenever their data changes.  There are 5 types of events;
 * all events are received by subscribing to the `change` event.
 *
 * ### 1. Data Events
 *
 * The Data event is fired whenever a request is sent to the server for new query results.  This could happen when first creating the query, when paging for more data, or when changing the query's properties, resulting in a new request to the server.
 *
 * The Event object will have an `evt.data` array of all newly added results.  But frequently you may just want to use the `query.data` array and get ALL results.
 *
 * ```javascript
 * query.on('change', function(evt) {
 *   if (evt.type === 'data') {
 *      var newData = evt.data;
 *      var allData = query.data;
 *   }
 * });
 * ```
 *
 * Note that `query.on('change:data', function(evt) {}` is also supported.
 *
 * ### 2. Insert Events
 *
 * A new Conversation or Message was created. It may have been created locally by your user, or it may have been remotely created, received via websocket, and added to the Query's results.
 *
 * The layer.LayerEvent.target property contains the newly inserted object.
 *
 * ```javascript
 *  query.on('change', function(evt) {
 *    if (evt.type === 'insert') {
 *       var newItem = evt.target;
 *       var allData = query.data;
 *    }
 *  });
 * ```
 *
 * Note that `query.on('change:insert', function(evt) {}` is also supported.
 *
 * ### 3. Remove Events
 *
 * A Conversation or Message was deleted. This may have been deleted locally by your user, or it may have been remotely deleted, a notification received via websocket, and removed from the Query results.
 *
 * The layer.LayerEvent.target property contains the removed object.
 *
 * ```javascript
 * query.on('change', function(evt) {
 *   if (evt.type === 'remove') {
 *       var removedItem = evt.target;
 *       var allData = query.data;
 *   }
 * });
 * ```
 *
 * Note that `query.on('change:remove', function(evt) {}` is also supported.
 *
 * ### 4. Reset Events
 *
 * Any time your query's model or predicate properties have been changed
 * the query is reset, and a new request is sent to the server.  The reset event informs your UI that the current result set is empty, and that the reason its empty is that it was `reset`.  This helps differentiate it from a `data` event that returns an empty array.
 *
 * ```javascript
 * query.on('change', function(evt) {
 *   if (evt.type === 'reset') {
 *       var allData = query.data; // []
 *   }
 * });
 * ```
 *
 * Note that `query.on('change:reset', function(evt) {}` is also supported.
 *
 * ### 5. Property Events
 *
 * If any properties change in any of the objects listed in your layer.Query.data property, a `property` event will be fired.
 *
 * The layer.LayerEvent.target property contains object that was modified.
 *
 * See layer.LayerEvent.changes for details on how changes are reported.
 *
 * ```javascript
 * query.on('change', function(evt) {
 *   if (evt.type === 'property') {
 *       var changedItem = evt.target;
 *       var isReadChanges = evt.getChangesFor('isRead');
 *       var recipientStatusChanges = evt.getChangesFor('recipientStatus');
 *       if (isReadChanges.length) {
 *           ...
 *       }
 *
 *       if (recipientStatusChanges.length) {
 *           ...
 *       }
 *   }
 * });
 *```
 * Note that `query.on('change:property', function(evt) {}` is also supported.
 *
 * @class  layer.Query
 * @extends layer.Root
 *
 */
var Root = require('./root');
var LayerError = require('./layer-error');
var Util = require('./client-utils');
var Logger = require('./logger');

var CONVERSATION = 'Conversation';
var MESSAGE = 'Message';
var ANNOUNCEMENT = 'Announcement';
var findConvIdRegex = new RegExp(/^conversation.id\s*=\s*['"](layer:\/\/\/conversations\/.{8}-.{4}-.{4}-.{4}-.{12})['"]$/);

var Query = function (_Root) {
  _inherits(Query, _Root);

  function Query() {
    _classCallCheck(this, Query);

    var options = undefined;
    if (arguments.length === 2) {
      options = (arguments.length <= 1 ? undefined : arguments[1]).build();
      options.client = arguments.length <= 0 ? undefined : arguments[0];
    } else {
      options = arguments.length <= 0 ? undefined : arguments[0];
    }
    if ('paginationWindow' in options) {
      var paginationWindow = options.paginationWindow;
      options.paginationWindow = Math.min(Query.MaxPageSize, options.paginationWindow);
      if (options.paginationWindow !== paginationWindow) {
        Logger.warn('paginationWindow value ' + paginationWindow + ' in Query constructor ' + ('excedes Query.MaxPageSize of ' + Query.MaxPageSize));
      }
    }

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Query).call(this, options));

    _this.data = [];
    _this._initialPaginationWindow = _this.paginationWindow;
    if (!_this.client) throw new Error(LayerError.dictionary.clientMissing);
    _this.client.on('all', _this._handleChangeEvents, _this);

    if (!_this.client.isReady) {
      _this.client.once('ready', function () {
        return _this._run();
      }, _this);
    } else {
      _this._run();
    }
    return _this;
  }

  /**
   * Cleanup and remove this Query, its subscriptions and data.
   *
   * @method destroy
   */


  _createClass(Query, [{
    key: 'destroy',
    value: function destroy() {
      this.client.off(null, null, this);
      this.client._removeQuery(this);
      this.data = null;
      _get(Object.getPrototypeOf(Query.prototype), 'destroy', this).call(this);
    }

    /**
     * Updates properties of the Query.
     *
     * Currently supports updating:
     *
     * * paginationWindow
     * * predicate
     * * model
     *
     * Any change to predicate or model results in clearing all data from the
     * query's results and triggering a change event with [] as the new data.
     *
     * @method update
     * @param  {Object} options
     * @param {string} [options.predicate] - A new predicate for the query
     * @param {string} [options.model] - A new model for the Query
     * @param {number} [paginationWindow] - Increase/decrease our result size to match this pagination window.
     * @return {layer.Query} this
     */

  }, {
    key: 'update',
    value: function update() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var needsRefresh = undefined,
          needsRecreate = undefined;

      var optionsBuilt = typeof options.build === 'function' ? options.build() : options;

      if ('paginationWindow' in optionsBuilt && this.paginationWindow !== optionsBuilt.paginationWindow) {
        this.paginationWindow = Math.min(Query.MaxPageSize + this.size, optionsBuilt.paginationWindow);
        if (this.paginationWindow < optionsBuilt.paginationWindow) {
          Logger.warn('paginationWindow value ' + optionsBuilt.paginationWindow + ' in Query.update() ' + ('increases size greater than Query.MaxPageSize of ' + Query.MaxPageSize));
        }
        needsRefresh = true;
      }
      if ('predicate' in optionsBuilt && this.predicate !== optionsBuilt.predicate) {
        this.predicate = optionsBuilt.predicate || '';
        needsRecreate = true;
      }
      if ('model' in optionsBuilt && this.model !== optionsBuilt.model) {
        this.model = optionsBuilt.model;
        needsRecreate = true;
      }
      if ('sortBy' in optionsBuilt && JSON.stringify(this.sortBy) !== JSON.stringify(optionsBuilt.sortBy)) {
        this.sortBy = optionsBuilt.sortBy;
        needsRecreate = true;
      }
      if (needsRecreate) {
        this._reset();
      }
      if (needsRecreate || needsRefresh) this._run();
      return this;
    }

    /**
     * After redefining the query, reset it: remove all data/reset all state.
     *
     * @method _reset
     * @private
     */

  }, {
    key: '_reset',
    value: function _reset() {
      this.totalSize = 0;
      var data = this.data;
      this.data = [];
      this.client._checkAndPurgeCache(data);
      this.isFiring = false;
      this._predicate = null;
      this.paginationWindow = this._initialPaginationWindow;
      this.isReset = true;
      this._triggerChange({
        data: [],
        type: 'reset'
      });
    }

    /**
     * Reset your query to its initial state and then rerun it.
     *
     * @method reset
     */

  }, {
    key: 'reset',
    value: function reset() {
      this._reset();
      this._run();
    }

    /**
     * Execute the query.
     *
     * No, don't murder it, just fire it.  No, don't make it unemployed,
     * just connect to the server and get the results.
     *
     * @method _run
     * @private
     */

  }, {
    key: '_run',
    value: function _run() {
      // Find the number of items we need to request.
      var pageSize = Math.min(this.paginationWindow - this.size, Query.MaxPageSize);

      // If there is a reduction in pagination window, then this variable will be negative, and we can shrink
      // the data.
      if (pageSize < 0) {
        var removedData = this.data.slice(this.paginationWindow);
        this.data = this.data.slice(0, this.paginationWindow);
        this.client._checkAndPurgeCache(removedData);
        this._triggerAsync('change', { data: [] });
      } else if (pageSize === 0) {
        // No need to load 0 results.
      } else if (this.model === CONVERSATION) {
          this._runConversation(pageSize);
        } else if (this.model === MESSAGE && this.predicate) {
          this._runMessage(pageSize);
        } else if (this.model === ANNOUNCEMENT) {
          this._runAnnouncement(pageSize);
        }
    }

    /**
     * Get Conversations from the server.
     *
     * @method _runConversation
     * @private
     * @param  {number} pageSize - Number of new results to request
     */

  }, {
    key: '_runConversation',
    value: function _runConversation(pageSize) {
      var _this2 = this;

      // If no data, retrieve data from db cache in parallel with loading data from server
      if (this.isReset) {
        this.client.dbManager.loadConversations(function (conversations) {
          return _this2._appendResults({ data: conversations });
        });
      }
      this.isReset = false;

      // This is a pagination rather than an initial request if there is already data; get the fromId
      // which is the id of the last result.
      var lastConversation = this.data[this.data.length - 1];
      var lastConversationInstance = !lastConversation ? null : this._getInstance(lastConversation);
      var fromId = lastConversationInstance && lastConversationInstance.isSaved() ? '&from_id=' + lastConversationInstance.id : '';
      var sortBy = this._getSortField();

      this.isFiring = true;
      var firingRequest = this._firingRequest = 'conversations?sort_by=' + sortBy + '&page_size=' + pageSize + fromId;
      this.client.xhr({
        url: firingRequest,
        method: 'GET',
        sync: false
      }, function (results) {
        return _this2._processRunResults(results, firingRequest);
      });
    }

    /**
     * Returns the sort field for the query.
     *
     * Returns One of:
     *
     * * 'position' (Messages only)
     * * 'last_message' (Conversations only)
     * * 'created_at' (Conversations only)
     * @method _getSortField
     * @private
     */

  }, {
    key: '_getSortField',
    value: function _getSortField() {
      if (this.model === MESSAGE || this.model === ANNOUNCEMENT) return 'position';
      if (this.sortBy && this.sortBy[0] && this.sortBy[0]['lastMessage.sentAt']) return 'last_message';
      return 'created_at';
    }

    /**
     * Get the Conversation UUID from the predicate property.
     *
     * Extract the Conversation's UUID from the predicate... or returned the cached value.
     *
     * @method _getConversationUUID
     * @private
     */

  }, {
    key: '_getConversationPredicateIds',
    value: function _getConversationPredicateIds() {
      if (this.predicate.match(findConvIdRegex)) {
        var conversationId = this.predicate.replace(findConvIdRegex, '$1');

        // We will already have a this._predicate if we are paging; else we need to extract the UUID from
        // the conversationId.
        var uuid = (this._predicate || conversationId).replace(/^layer\:\/\/\/conversations\//, '');
        if (uuid) {
          return {
            uuid: uuid,
            id: conversationId
          };
        }
      }
    }

    /**
     * Get Messages from the server.
     *
     * @method _runMessage
     * @private
     * @param  {number} pageSize - Number of new results to request
     */

  }, {
    key: '_runMessage',
    value: function _runMessage(pageSize) {
      var _this3 = this;

      // This is a pagination rather than an initial request if there is already data; get the fromId
      // which is the id of the last result.
      var lastMessage = this.data[this.data.length - 1];
      var lastMessageInstance = !lastMessage ? null : this._getInstance(lastMessage);
      var fromId = lastMessageInstance && lastMessageInstance.isSaved() ? '&from_id=' + lastMessageInstance.id : '';
      var predicateIds = this._getConversationPredicateIds();

      // Do nothing if we don't have a conversation to query on
      if (predicateIds) {
        (function () {
          var conversationId = 'layer:///conversations/' + predicateIds.uuid;
          if (!_this3._predicate) _this3._predicate = predicateIds.id;
          var conversation = _this3.client.getConversation(conversationId);

          // If no data, retrieve data from db cache in parallel with loading data from server
          if (_this3.isReset) {
            _this3.client.dbManager.loadMessages(conversationId, function (messages) {
              return _this3._appendResults({ data: messages });
            });
          }
          _this3.isReset = false;

          // If the only Message is the Conversation's lastMessage, then we probably got this
          // result from `GET /conversations`, and not from `GET /messages`.  Get ALL Messages,
          // not just messages after the `lastMessage` if we've never received any messages from
          // `GET /messages` (safety code, not required code).  This also means that the first
          // Query gets MAX_PAGE_SIZE results instead of MAX_PAGE_SIZE + 1 results.
          if (conversation && conversation.lastMessage && lastMessage && lastMessage.id === conversation.lastMessage.id) {
            fromId = '';
          }

          // If the last message we have loaded is already the Conversation's lastMessage, then just request data without paging,
          // common occurence when query is populated with only a single result: conversation.lastMessage.
          // if (conversation && conversation.lastMessage && lastMessage && lastMessage.id === conversation.lastMessage.id) fromId = '';
          var newRequest = 'conversations/' + predicateIds.uuid + '/messages?page_size=' + pageSize + fromId;

          // Don't query on unsaved conversations, nor repeat still firing queries
          if ((!conversation || conversation.isSaved()) && newRequest !== _this3._firingRequest) {
            _this3.isFiring = true;
            _this3._firingRequest = newRequest;
            _this3.client.xhr({
              url: newRequest,
              method: 'GET',
              sync: false
            }, function (results) {
              return _this3._processRunResults(results, newRequest);
            });
          }

          // If there are no results, then its a new query; automatically populate it with the Conversation's lastMessage.
          if (_this3.data.length === 0) {
            if (conversation && conversation.lastMessage) {
              _this3.data = [_this3._getData(conversation.lastMessage)];
              // Trigger the change event
              _this3._triggerChange({
                type: 'data',
                data: _this3._getData(conversation.lastMessage),
                query: _this3,
                target: _this3.client
              });
            }
          }
        })();
      } else if (!this.predicate.match(/['"]/)) {
        Logger.error('This query may need to quote its value');
      }
    }

    /**
     * Get Messages from the server.
     *
     * @method _runMessage
     * @private
     * @param  {number} pageSize - Number of new results to request
     */

  }, {
    key: '_runAnnouncement',
    value: function _runAnnouncement(pageSize) {
      var _this4 = this;

      // If no data, retrieve data from db cache in parallel with loading data from server
      if (this.isReset) {
        this.client.dbManager.loadAnnouncements(function (messages) {
          return _this4._appendResults({ data: messages });
        });
      }
      this.isReset = false;

      // This is a pagination rather than an initial request if there is already data; get the fromId
      // which is the id of the last result.
      var lastMessage = this.data[this.data.length - 1];
      var lastMessageInstance = !lastMessage ? null : this._getInstance(lastMessage);
      var fromId = lastMessageInstance && lastMessageInstance.isSaved() ? '&from_id=' + lastMessageInstance.id : '';

      // If the last message we have loaded is already the Conversation's lastMessage, then just request data without paging,
      // common occurence when query is populated with only a single result: conversation.lastMessage.
      // if (conversation && conversation.lastMessage && lastMessage && lastMessage.id === conversation.lastMessage.id) fromId = '';
      var newRequest = 'announcements?page_size=' + pageSize + fromId;

      // Don't repeat still firing queries
      if (newRequest !== this._firingRequest) {
        this.isFiring = true;
        this._firingRequest = newRequest;
        this.client.xhr({
          url: newRequest,
          method: 'GET',
          sync: false
        }, function (results) {
          return _this4._processRunResults(results, newRequest);
        });
      }
    }

    /**
     * Process the results of the `_run` method; calls __appendResults.
     *
     * @method _processRunResults
     * @private
     * @param  {Object} results - Full xhr response object with server results
     */

  }, {
    key: '_processRunResults',
    value: function _processRunResults(results, requestUrl) {
      if (requestUrl !== this._firingRequest || this.isDestroyed) return;

      this.isFiring = false;
      this._firingRequest = '';
      if (results.success) {
        this._appendResults(results);
        this.totalSize = results.xhr.getResponseHeader('Layer-Count');
      } else {
        this.trigger('error', { error: results.data });
      }
    }

    /**
     * Appends arrays of data to the Query results.
     *
     * @method  _appendResults
     * @private
     */

  }, {
    key: '_appendResults',
    value: function _appendResults(results) {
      var _this5 = this;

      // For all results, register them with the client
      // If already registered with the client, properties will be updated as needed
      results.data.forEach(function (item) {
        if (item instanceof Root) return item;
        return _this5.client._createObject(item);
      });

      // Filter results to just the new results
      var newResults = results.data.filter(function (item) {
        return _this5._getIndex(item.id) === -1;
      });

      // Update this.data
      if (this.dataType === Query.ObjectDataType) {
        this.data = [].concat(this.data);
      }
      var data = this.data;
      newResults.forEach(function (itemIn) {
        var index = undefined;
        var item = _this5.client._getObject(itemIn.id);
        if (_this5.model === MESSAGE || _this5.model === ANNOUNCEMENT) {
          index = _this5._getInsertMessageIndex(item, data);
        } else {
          index = _this5._getInsertConversationIndex(item, data);
        }
        data.splice(index, 0, _this5._getData(item));
      });

      // Trigger the change event
      this._triggerChange({
        type: 'data',
        data: newResults.map(function (item) {
          return _this5._getData(_this5.client._getObject(item.id));
        }),
        query: this,
        target: this.client
      });
    }

    /**
     * Returns a correctly formatted object representing a result.
     *
     * Format is specified by the `dataType` property.
     *
     * @method _getData
     * @private
     * @param  {layer.Root} item - Conversation or Message instance
     * @return {Object} - Conversation or Message instance or Object
     */

  }, {
    key: '_getData',
    value: function _getData(item) {
      if (this.dataType === Query.ObjectDataType) {
        return item.toObject();
      }
      return item;
    }

    /**
     * Returns an instance regardless of whether the input is instance or object
     * @method
     * @private
     * @param {layer.Root|Object} item - Conversation or Message object/instance
     * @return {layer.Root}
     */

  }, {
    key: '_getInstance',
    value: function _getInstance(item) {
      if (item instanceof Root) return item;
      return this.client._getObject(item.id);
    }

    /**
     * Ask the query for the item matching the ID.
     *
     * Returns undefined if the ID is not found.
     *
     * @method _getItem
     * @private
     * @param  {string} id
     * @return {Object} Conversation or Message object or instance
     */

  }, {
    key: '_getItem',
    value: function _getItem(id) {
      switch (Util.typeFromID(id)) {
        case 'announcements':
          if (this.model === ANNOUNCEMENT) {
            var index = this._getIndex(id);
            return index === -1 ? null : this.data[index];
          }
          break;
        case 'messages':
          if (this.model === MESSAGE) {
            var index = this._getIndex(id);
            return index === -1 ? null : this.data[index];
          } else if (this.model === CONVERSATION) {
            for (var index = 0; index < this.data.length; index++) {
              var conversation = this.data[index];
              if (conversation.lastMessage && conversation.lastMessage.id === id) return conversation.lastMessage;
            }
            return null;
          }
          break;
        case 'conversations':
          if (this.model === CONVERSATION) {
            var index = this._getIndex(id);
            return index === -1 ? null : this.data[index];
          }
          break;
      }
    }

    /**
     * Get the index of the item represented by the specified ID; or return -1.
     *
     * @method _getIndex
     * @private
     * @param  {string} id
     * @return {number}
     */

  }, {
    key: '_getIndex',
    value: function _getIndex(id) {
      for (var index = 0; index < this.data.length; index++) {
        if (this.data[index].id === id) return index;
      }
      return -1;
    }

    /**
     * Handle any change event received from the layer.Client.
     *
     * These can be caused by websocket events, as well as local
     * requests to create/delete/modify Conversations and Messages.
     *
     * The event does not necessarily apply to this Query, but the Query
     * must examine it to determine if it applies.
     *
     * @method _handleChangeEvents
     * @private
     * @param {string} eventName - "messages:add", "conversations:change"
     * @param {layer.LayerEvent} evt
     */

  }, {
    key: '_handleChangeEvents',
    value: function _handleChangeEvents(eventName, evt) {
      if (this.model === CONVERSATION) {
        this._handleConversationEvents(evt);
      } else if (this.model === MESSAGE || this.model === ANNOUNCEMENT) {
        this._handleMessageEvents(evt);
      }
    }
  }, {
    key: '_handleConversationEvents',
    value: function _handleConversationEvents(evt) {
      switch (evt.eventName) {

        // If a Conversation's property has changed, and the Conversation is in this
        // Query's data, then update it.
        case 'conversations:change':
          this._handleConversationChangeEvent(evt);
          break;

        // If a Conversation is added, and it isn't already in the Query,
        // add it and trigger an event
        case 'conversations:add':
          this._handleConversationAddEvent(evt);
          break;

        // If a Conversation is deleted, and its still in our data,
        // remove it and trigger an event.
        case 'conversations:remove':
          this._handleConversationRemoveEvent(evt);
          break;
      }
    }

    // TODO WEB-968: Refactor this into functions for instance, object, sortBy createdAt, sortBy lastMessage

  }, {
    key: '_handleConversationChangeEvent',
    value: function _handleConversationChangeEvent(evt) {
      var index = this._getIndex(evt.target.id);

      // If its an ID change (matching Distinct Conversation returned by server) make sure to update our data.
      // If dataType is an instance, its been updated for us.
      if (this.dataType === Query.ObjectDataType) {
        var idChanges = evt.getChangesFor('id');
        if (idChanges.length) {
          index = this._getIndex(idChanges[0].oldValue);
        }
      }

      // If dataType is "object" then update the object and our array;
      // else the object is already updated.
      // Ignore results that aren't already in our data; Results are added via
      // conversations:add events.  Websocket Manager automatically loads anything that receives an event
      // for which we have no object, so we'll get the add event at that time.
      if (index !== -1) {
        var sortField = this._getSortField();
        var reorder = evt.hasProperty('lastMessage') && sortField === 'last_message';

        if (this.dataType === Query.ObjectDataType) {
          if (!reorder) {
            // Replace the changed Conversation with a new immutable object
            this.data = [].concat(_toConsumableArray(this.data.slice(0, index)), [evt.target.toObject()], _toConsumableArray(this.data.slice(index + 1)));
          } else {
            var newIndex = this._getInsertConversationIndex(evt.target, this.data);
            this.data.splice(index, 1);
            this.data.splice(newIndex, 0, this._getData(evt.target));
            this.data = this.data.concat([]);
          }
        }

        // Else dataType is instance not object
        else {
            if (reorder) {
              var newIndex = this._getInsertConversationIndex(evt.target, this.data);
              if (newIndex !== index) {
                this.data.splice(index, 1);
                this.data.splice(newIndex, 0, evt.target);
              }
            }
          }

        // Trigger a 'property' event
        this._triggerChange({
          type: 'property',
          target: this._getData(evt.target),
          query: this,
          isChange: true,
          changes: evt.changes
        });
      }
    }
  }, {
    key: '_getInsertConversationIndex',
    value: function _getInsertConversationIndex(conversation, data) {
      var sortField = this._getSortField();
      var index = undefined;
      if (sortField === 'created_at') {
        for (index = 0; index < data.length; index++) {
          if (conversation.createdAt >= data[index].createdAt) break;
        }
        return index;
      } else {
        var d1 = conversation.lastMessage ? conversation.lastMessage.sentAt : conversation.createdAt;
        for (index = 0; index < data.length; index++) {
          var d2 = data[index].lastMessage ? data[index].lastMessage.sentAt : data[index].createdAt;
          if (d1 >= d2) break;
        }
        return index;
      }
    }
  }, {
    key: '_getInsertMessageIndex',
    value: function _getInsertMessageIndex(message, data) {
      var index = undefined;
      for (index = 0; index < data.length; index++) {
        if (message.position > data[index].position) {
          break;
        }
      }
      return index;
    }
  }, {
    key: '_handleConversationAddEvent',
    value: function _handleConversationAddEvent(evt) {
      var _this6 = this;

      // Filter out any Conversations already in our data
      var list = evt.conversations.filter(function (conversation) {
        return _this6._getIndex(conversation.id) === -1;
      });

      if (list.length) {
        (function () {
          var data = _this6.data;
          list.forEach(function (conversation) {
            var newIndex = _this6._getInsertConversationIndex(conversation, data);
            data.splice(newIndex, 0, _this6._getData(conversation));
          });

          // Whether sorting by last_message or created_at, new results go at the top of the list
          if (_this6.dataType === Query.ObjectDataType) {
            _this6.data = [].concat(data);
          }
          _this6.totalSize += list.length;

          // Trigger an 'insert' event for each item added;
          // typically bulk inserts happen via _appendResults().
          list.forEach(function (conversation) {
            var item = _this6._getData(conversation);
            _this6._triggerChange({
              type: 'insert',
              index: _this6.data.indexOf(item),
              target: item,
              query: _this6
            });
          });
        })();
      }
    }
  }, {
    key: '_handleConversationRemoveEvent',
    value: function _handleConversationRemoveEvent(evt) {
      var _this7 = this;

      var removed = [];
      evt.conversations.forEach(function (conversation) {
        var index = _this7._getIndex(conversation.id);
        if (index !== -1) {
          removed.push({
            data: conversation,
            index: index
          });
          if (_this7.dataType === Query.ObjectDataType) {
            _this7.data = [].concat(_toConsumableArray(_this7.data.slice(0, index)), _toConsumableArray(_this7.data.slice(index + 1)));
          } else {
            _this7.data.splice(index, 1);
          }
        }
      });

      this.totalSize -= removed.length;
      removed.forEach(function (removedObj) {
        _this7._triggerChange({
          type: 'remove',
          index: removedObj.index,
          target: _this7._getData(removedObj.data),
          query: _this7
        });
      });
    }
  }, {
    key: '_handleMessageEvents',
    value: function _handleMessageEvents(evt) {
      switch (evt.eventName) {

        // If a Conversation's ID has changed, check our predicate, and update it automatically if needed.
        case 'conversations:change':
          if (this.model === MESSAGE) this._handleMessageConvIdChangeEvent(evt);
          break;

        // If a Message has changed and its in our result set, replace
        // it with a new immutable object
        case 'messages:change':
        case 'messages:read':
          this._handleMessageChangeEvent(evt);
          break;

        // If Messages are added, and they aren't already in our result set
        // add them.
        case 'messages:add':
          this._handleMessageAddEvent(evt);
          break;

        // If a Message is deleted and its in our result set, remove it
        // and trigger an event
        case 'messages:remove':
          this._handleMessageRemoveEvent(evt);
          break;
      }
    }

    /**
     * A Conversation ID changes if a matching Distinct Conversation was found on the server.
     *
     * If this Query's Conversation's ID has changed, update the predicate.
     *
     * @method _handleMessageConvIdChangeEvent
     * @param {layer.LayerEvent} evt - A Message Change Event
     * @private
     */

  }, {
    key: '_handleMessageConvIdChangeEvent',
    value: function _handleMessageConvIdChangeEvent(evt) {
      var cidChanges = evt.getChangesFor('id');
      if (cidChanges.length) {
        if (this._predicate === cidChanges[0].oldValue) {
          this._predicate = cidChanges[0].newValue;
          this.predicate = "conversation.id = '" + this._predicate + "'";
          this._run();
        }
      }
    }

    /**
     * If the ID of the message has changed, then the position property has likely changed as well.
     *
     * This method tests to see if changes to the position property have impacted the message's position in the
     * data array... and updates the array if it has.
     *
     * @method _handleMessagePositionChange
     * @private
     * @param {layer.LayerEvent} evt  A Message Change event
     * @param {number} index  Index of the message in the current data array
     * @return {boolean} True if a data was changed and a change event was emitted
     */

  }, {
    key: '_handleMessagePositionChange',
    value: function _handleMessagePositionChange(evt, index) {
      // If the message is not in the current data, then there is no change to our query results.
      if (index === -1) return false;

      // Create an array without our data item and then find out where the data item Should be inserted.
      // Note: we could just lookup the position in our current data array, but its too easy to introduce
      // errors where comparing this message to itself may yield index or index + 1.
      var newData = [].concat(_toConsumableArray(this.data.slice(0, index)), _toConsumableArray(this.data.slice(index + 1)));
      var newIndex = this._getInsertMessageIndex(evt.target, newData);

      // If the data item goes in the same index as before, then there is no change to be handled here;
      // else insert the item at the right index, update this.data and fire a change event
      if (newIndex !== index) {
        newData.splice(newIndex, 0, this._getData(evt.target));
        this.data = newData;
        this._triggerChange({
          type: 'property',
          target: this._getData(evt.target),
          query: this,
          isChange: true,
          changes: evt.changes
        });
        return true;
      }
    }
  }, {
    key: '_handleMessageChangeEvent',
    value: function _handleMessageChangeEvent(evt) {
      var index = this._getIndex(evt.target.id);
      var positionChanges = evt.getChangesFor('position');

      // If there are position changes, handle them.  If all the changes are position changes,
      // exit when done.
      if (positionChanges.length) {
        if (this._handleMessagePositionChange(evt, index)) {
          if (positionChanges.length === evt.changes.length) return;
          index = this._getIndex(evt.target.id); // Get the updated position
        }
      }

      if (index !== -1) {
        if (this.dataType === Query.ObjectDataType) {
          this.data = [].concat(_toConsumableArray(this.data.slice(0, index)), [evt.target.toObject()], _toConsumableArray(this.data.slice(index + 1)));
        }
        this._triggerChange({
          type: 'property',
          target: this._getData(evt.target),
          query: this,
          isChange: true,
          changes: evt.changes
        });
      }
    }
  }, {
    key: '_handleMessageAddEvent',
    value: function _handleMessageAddEvent(evt) {
      var _this8 = this;

      // Only use added messages that are part of this Conversation
      // and not already in our result set
      var list = evt.messages.filter(function (message) {
        var type = Util.typeFromID(message.id);
        return type === 'messages' && _this8.model === MESSAGE || type === 'announcements' && _this8.model === ANNOUNCEMENT;
      }).filter(function (message) {
        var type = Util.typeFromID(message.id);
        return type === 'announcements' || message.conversationId === _this8._predicate;
      }).filter(function (message) {
        return _this8._getIndex(message.id) === -1;
      }).map(function (message) {
        return _this8._getData(message);
      });

      // Add them to our result set and trigger an event for each one
      if (list.length) {
        (function () {
          var data = _this8.data = _this8.dataType === Query.ObjectDataType ? [].concat(_this8.data) : _this8.data;
          list.forEach(function (item) {
            var index = _this8._getInsertMessageIndex(item, data);
            data.splice(index, 0, item);
          });

          _this8.totalSize += list.length;

          // Index calculated above may shift after additional insertions.  This has
          // to be done after the above insertions have completed.
          list.forEach(function (item) {
            _this8._triggerChange({
              type: 'insert',
              index: _this8.data.indexOf(item),
              target: item,
              query: _this8
            });
          });
        })();
      }
    }
  }, {
    key: '_handleMessageRemoveEvent',
    value: function _handleMessageRemoveEvent(evt) {
      var _this9 = this;

      var removed = [];
      evt.messages.forEach(function (message) {
        var index = _this9._getIndex(message.id);
        if (index !== -1) {
          removed.push({
            data: message,
            index: index
          });
          if (_this9.dataType === Query.ObjectDataType) {
            _this9.data = [].concat(_toConsumableArray(_this9.data.slice(0, index)), _toConsumableArray(_this9.data.slice(index + 1)));
          } else {
            _this9.data.splice(index, 1);
          }
        }
      });

      this.totalSize -= removed.length;
      removed.forEach(function (removedObj) {
        _this9._triggerChange({
          type: 'remove',
          target: _this9._getData(removedObj.data),
          index: removedObj.index,
          query: _this9
        });
      });
    }
  }, {
    key: '_triggerChange',
    value: function _triggerChange(evt) {
      this.trigger('change', evt);
      this.trigger('change:' + evt.type, evt);
    }
  }]);

  return Query;
}(Root);

Query.prefixUUID = 'layer:///queries/';

/**
 * Query for Conversations.
 *
 * Use this value in the model property.
 * @type {string}
 * @static
 */
Query.Conversation = CONVERSATION;

/**
 * Query for Messages.
 *
 * Use this value in the model property.
 * @type {string}
 * @static
 */
Query.Message = MESSAGE;

/**
 * Query for Announcements.
 *
 * Use this value in the model property.
 * @type {string}
 * @static
 */
Query.Announcement = ANNOUNCEMENT;

/**
 * Get data as POJOs/immutable objects.
 *
 * Your Query data and events will provide Messages/Conversations as objects.
 * @type {string}
 * @static
 */
Query.ObjectDataType = 'object';

/**
 * Get data as instances of layer.Message and layer.Conversation.
 *
 * Your Query data and events will provide Messages/Conversations as instances.
 * @type {string}
 * @static
 */
Query.InstanceDataType = 'instance';

/**
 * Set the maximum page size for queries.
 *
 * @type {number}
 * @static
 */
Query.MaxPageSize = 100;

/**
 * Access the number of results currently loaded.
 *
 * @type {Number}
 */
Object.defineProperty(Query.prototype, 'size', {
  enumerable: true,
  get: function get() {
    return !this.data ? 0 : this.data.length;
  }
});

/** Access the total number of results on the server.
 *
 * Will be 0 until the first query has successfully loaded results.
 *
 * @type {Number}
 */
Query.prototype.totalSize = 0;

/**
 * Access to the client so it can listen to websocket and local events.
 *
 * @type {layer.Client}
 * @protected
 */
Query.prototype.client = null;

/**
 * Query results.
 *
 * Array of data resulting from the Query; either a layer.Root subclass.
 *
 * or plain Objects
 * @type {Object[]}
 */
Query.prototype.data = null;

/**
 * Specifies the type of data being queried for.
 *
 * Model is one of
 * * layer.Query.Conversation
 * * layer.Query.Message
 *
 * @type {String}
 */
Query.prototype.model = CONVERSATION;

/**
 * What type of results to request of the server.
 *
 * Not yet supported; returnType is one of
 *
 * * object
 * * id
 * * count
 *
 * This Query API is designed only for use with 'object'.
 * @type {String}
 */
Query.prototype.returnType = 'object';

/**
 * Specify what kind of data array your application requires.
 *
 * Used to specify query dataType.  One of
 * * Query.ObjectDataType
 * * Query.InstanceDataType
 *
 * @type {String}
 */
Query.prototype.dataType = Query.InstanceDataType;

/**
 * Number of results from the server to request/cache.
 *
 * The pagination window can be increased to download additional items, or decreased to purge results
 * from the data property.
 *
 *     query.update({
 *       paginationWindow: 150
 *     })
 *
 * This call will load 150 results.  If it previously had 100,
 * then it will load 50 more. If it previously had 200, it will drop 50.
 *
 * Note that the server will only permit 100 at a time, so
 * setting a large pagination window may result in many
 * requests to the server to reach the specified page value.
 * @type {Number}
 */
Query.prototype.paginationWindow = 100;

/**
 * Sorting criteria for Conversation Queries.
 *
 * Only supports an array of one field/element.
 * Only supports the following options:
 *
 *     [{'createdAt': 'desc'}]
 *     [{'lastMessage.sentAt': 'desc'}]
 *
 * Why such limitations? Why this structure?  The server will be exposing a Query API at which point the
 * above sort options will make a lot more sense, and full sorting will be provided.
 *
 * @type {String}
 */
Query.prototype.sortBy = null;

/**
 * This value tells us what to reset the paginationWindow to when the query is redefined.
 *
 * @type {Number}
 * @private
 */
Query.prototype._initialPaginationWindow = 100;

/**
 * Your Query's WHERE clause.
 *
 * Currently, the only query supported is "conversation.id = 'layer:///conversations/uuid'"
 * Note that both ' and " are supported.
 * @type {string}
 */
Query.prototype.predicate = null;

Query.prototype.isReset = true;

/**
 * True if the Query is connecting to the server.
 *
 * It is not gaurenteed that every update(); for example, updating a paginationWindow to be smaller,
 * Or changing a value to the existing value would cause the request not to fire.
 * R ecommended pattern is:
 *
 *      query.update({paginationWindow: 50});
 *      if (!query.isFiring) {
 *        alert("Done");
 *      } else {
 *          query.on("change", function(evt) {
 *            if (evt.type == "data") alert("Done");
 *          });
 *      }
 *
 * @type {Boolean}
 */
Query.prototype.isFiring = false;

/**
 * The last request fired.
 *
 * If multiple requests are inflight, the response
 * matching this request is the ONLY response we will process.
 * @type {String}
 * @private
 */
Query.prototype._firingRequest = '';

Query._supportedEvents = [
/**
 * The query data has changed; any change event will cause this event to trigger.
 * @event change
 */
'change',

/**
 * A new page of data has been loaded from the server
 * @event 'change:data'
 */
'change:data',

/**
 * All data for this query has been reset due to a change in the Query predicate.
 * @event 'change:reset'
 */
'change:reset',

/**
 * An item of data within this Query has had a property change its value.
 * @event 'change:property'
 */
'change:property',

/**
 * A new item of data has been inserted into the Query. Not triggered by loading
 * a new page of data from the server, but is triggered by locally creating a matching
 * item of data, or receiving a new item of data via websocket.
 * @event 'change:insert'
 */
'change:insert',

/**
 * An item of data has been removed from the Query. Not triggered for every removal, but
 * is triggered by locally deleting a result, or receiving a report of deletion via websocket.
 * @event 'change:remove'
 */
'change:remove',

/**
 * The query data failed to load from the server.
 * @event error
 */
'error'].concat(Root._supportedEvents);

Root.initClass.apply(Query, [Query, 'Query']);

module.exports = Query;

},{"./client-utils":10,"./layer-error":16,"./logger":18,"./root":24}],24:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Utils = require('./client-utils');
var LayerEvent = require('./layer-event');
var LayerError = require('./layer-error');
var Events = require('backbone-events-standalone/backbone-events-standalone');
var Logger = require('./logger');

/*
 * Provides a system bus that can be accessed by all components of the system.
 * Currently used to listen to messages sent via postMessage, but envisioned to
 * do far more.
 */
function EventClass() {}
EventClass.prototype = Events;

var SystemBus = new EventClass();
if (typeof postMessage === 'function') {
  addEventListener('message', function (event) {
    if (event.data.type === 'layer-delayed-event') {
      SystemBus.trigger(event.data.internalId + '-delayed-event');
    }
  });
}

// Used to generate a unique internalId for every Root instance
var uniqueIds = {};

// Regex for splitting an event string such as obj.on('evtName1 evtName2 evtName3')
var eventSplitter = /\s+/;

/**
 * The root class of all layer objects. Provides the following utilities
 *
 * 1. Mixes in the Backbone event model
 *
 *        var person = new Person();
 *        person.on('destroy', function() {
 *            console.log('I have been destroyed!');
 *        });
 *
 *        // Fire the console log handler:
 *        person.trigger('destroy');
 *
 *        // Unsubscribe
 *        person.off('destroy');
 *
 * 2. Adds a subscriptions object so that any event handlers on an object can be quickly found and removed
 *
 *        var person1 = new Person();
 *        var person2 = new Person();
 *        person2.on('destroy', function() {
 *            console.log('I have been destroyed!');
 *        }, person1);
 *
 *        // Pointers to person1 held onto by person2 are removed
 *        person1.destroy();
 *
 * 3. Adds support for event listeners in the constructor
 *    Any event handler can be passed into the constructor
 *    just as though it were a property.
 *
 *        var person = new Person({
 *            age: 150,
 *            destroy: function() {
 *                console.log('I have been destroyed!');
 *            }
 *        });
 *
 * 4. A _disableEvents property
 *
 *        myMethod() {
 *          if (this.isInitializing) {
 *              this._disableEvents = true;
 *
 *              // Event only received if _disableEvents = false
 *              this.trigger('destroy');
 *              this._disableEvents = false;
 *          }
 *        }
 *
 * 5. A _supportedEvents static property for each class
 *
 *     This property defines which events can be triggered.
 *
 *     * Any attempt to trigger
 *       an event not in _supportedEvents will log an error.
 *     * Any attempt to register a listener for an event not in _supportedEvents will
 *     *throw* an error.
 *
 *     This allows us to insure developers only subscribe to valid events.
 *
 *     This allows us to control what events can be fired and which ones blocked.
 *
 * 6. Adds an internalId property
 *
 *        var person = new Person();
 *        console.log(person.internalId); // -> 'Person1'
 *
 * 7. Adds a toObject method to create a simplified Plain Old Javacript Object from your object
 *
 *        var person = new Person();
 *        var simplePerson = person.toObject();
 *
 * 8. Provides __adjustProperty method support
 *
 *     For any property of a class, an `__adjustProperty` method can be defined.  If its defined,
 *     it will be called prior to setting that property, allowing:
 *
 *     A. Modification of the value that is actually set
 *     B. Validation of the value; throwing errors if invalid.
 *
 * 9. Provides __udpateProperty method support
 *
 *     After setting any property for which there is an `__updateProperty` method defined,
 *     the method will be called, allowing the new property to be applied.
 *
 *     Typically used for
 *
 *     A. Triggering events
 *     B. Firing XHR requests
 *     C. Updating the UI to match the new property value
 *
 *
 * @class layer.Root
 * @abstract
 * @author Michael Kantor
 */

var Root = function (_EventClass) {
  _inherits(Root, _EventClass);

  /**
   * Superclass constructor handles copying in properties and registering event handlers.
   *
   * @method constructor
   * @param  {Object} options - a hash of properties and event handlers
   * @return {layer.Root}
   */

  function Root() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Root);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Root).call(this));

    _this._subscriptions = [];
    _this._delayedTriggers = [];
    _this._lastDelayedTrigger = Date.now();
    _this._events = {};

    // Generate an internalId
    var name = _this.constructor.name;
    if (!uniqueIds[name]) uniqueIds[name] = 0;
    _this.internalId = name + uniqueIds[name]++;

    // Every component listens to the SystemBus for postMessage (triggerAsync) events
    SystemBus.on(_this.internalId + '-delayed-event', _this._processDelayedTriggers, _this);

    // Generate a temporary id if there isn't an id
    if (!_this.id && !options.id && _this.constructor.prefixUUID) {
      _this.id = _this.constructor.prefixUUID + Utils.generateUUID();
    }

    // Copy in all properties; setup all event handlers
    var key = undefined;
    for (key in options) {
      if (_this.constructor._supportedEvents.indexOf(key) !== -1) {
        _this.on(key, options[key]);
      } else if (key in _this && typeof _this[key] !== 'function') {
        _this[key] = options[key];
      }
    }
    _this.isInitializing = false;
    return _this;
  }

  /**
   * Destroys the object.
   *
   * Cleans up all events / subscriptions
   * and marks the object as isDestroyed.
   *
   * @method destroy
   */


  _createClass(Root, [{
    key: 'destroy',
    value: function destroy() {
      var _this2 = this;

      if (this.isDestroyed) throw new Error(LayerError.dictionary.alreadyDestroyed);

      // If anyone is listening, notify them
      this.trigger('destroy');

      // Cleanup pointers to SystemBus. Failure to call destroy
      // will have very serious consequences...
      SystemBus.off(this.internalId + '-delayed-event', null, this);

      // Remove all events, and all pointers passed to this object by other objects
      this.off();

      // Find all of the objects that this object has passed itself to in the form
      // of event handlers and remove all references to itself.
      this._subscriptions.forEach(function (item) {
        return item.off(null, null, _this2);
      });

      this._subscriptions = null;
      this._delayedTriggers = null;
      this.isDestroyed = true;
    }

    /**
     * Convert class instance to Plain Javascript Object.
     *
     * Strips out all private members, and insures no datastructure loops.
     * Recursively converting all subobjects using calls to toObject.
     *
     *      console.dir(myobj.toObject());
     *
     * Note: While it would be tempting to have noChildren default to true,
     * this would result in Message.toObject() not outputing its MessageParts.
     *
     * Private data (_ prefixed properties) will not be output.
     *
     * @method toObject
     * @param  {boolean} [noChildren=false] Don't output sub-components
     * @return {Object}
     */

  }, {
    key: 'toObject',
    value: function toObject() {
      var _this3 = this;

      var noChildren = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

      this.__inToObject = true;
      var obj = {};

      // Iterate over all formally defined properties
      try {
        var keys = [];
        for (var key in this.constructor.prototype) {
          if (!(key in layer.Root.prototype)) keys.push(key);
        }keys.forEach(function (key) {
          var v = _this3[key];

          // Ignore private/protected properties and functions
          if (key.indexOf('_') === 0) return;
          if (typeof v === 'function') return;

          // Generate arrays...
          if (Array.isArray(v)) {
            obj[key] = [];
            v.forEach(function (item) {
              if (item instanceof Root) {
                if (noChildren) {
                  delete obj[key];
                } else if (!item.__inToObject) {
                  obj[key].push(item.toObject());
                }
              } else {
                obj[key].push(item);
              }
            });
          }

          // Generate subcomponents
          else if (v instanceof Root) {
              if (!v.__inToObject && !noChildren) {
                obj[key] = v.toObject();
              }
            }

            // Generate dates (creates a copy to separate it from the source object)
            else if (v instanceof Date) {
                obj[key] = new Date(v);
              }

              // Generate simple properties
              else {
                  obj[key] = v;
                }
        });
      } catch (e) {
        // no-op
      }
      this.__inToObject = false;
      return obj;
    }

    /**
     * Log a warning for attempts to subscribe to unsupported events.
     *
     * @method _warnForEvent
     * @private
     */

  }, {
    key: '_warnForEvent',
    value: function _warnForEvent(eventName) {
      if (!Utils.includes(this.constructor._supportedEvents, eventName)) {
        throw new Error('Event ' + eventName + ' not defined for ' + this.toString());
      }
    }

    /**
     * Prepare for processing an event subscription call.
     *
     * If context is a Root class, add this object to the context's subscriptions.
     *
     * @method _prepareOn
     * @private
     */

  }, {
    key: '_prepareOn',
    value: function _prepareOn(name, handler, context) {
      var _this4 = this;

      if (context instanceof Root) {
        if (context.isDestroyed) {
          throw new Error(LayerError.dictionary.isDestroyed);
        }
        context._subscriptions.push(this);
      }
      if (typeof name === 'string' && name !== 'all') {
        if (eventSplitter.test(name)) {
          var names = name.split(eventSplitter);
          names.forEach(function (n) {
            return _this4._warnForEvent(n);
          });
        } else {
          this._warnForEvent(name);
        }
      } else if (name && (typeof name === 'undefined' ? 'undefined' : _typeof(name)) === 'object') {
        Object.keys(name).forEach(function (keyName) {
          return _this4._warnForEvent(keyName);
        });
      }
    }

    /**
     * Subscribe to events.
     *
     * Note that the context parameter serves double importance here:
     *
     * 1. It determines the context in which to execute the event handler
     * 2. Create a backlink so that if either subscriber or subscribee is destroyed,
     *    all pointers between them can be found and removed.
     *
     *      obj.on('someEventName someOtherEventName', mycallback, mycontext);
     *
     *      obj.on({
     *          eventName1: callback1,
     *          eventName2: callback2
     *      }, mycontext);
     *
     * @method on
     * @param  {String} name - Name of the event
     * @param  {Function} handler - Event handler
     * @param  {layer.LayerEvent} handler.event - Event object delivered to the handler
     * @param  {Object} context - This pointer AND link to help with cleanup
     * @return {layer.Root} this
     */

  }, {
    key: 'on',
    value: function on(name, handler, context) {
      this._prepareOn(name, handler, context);
      Events.on.apply(this, [name, handler, context]);
      return this;
    }

    /**
     * Subscribe to the first occurance of the specified event.
     *
     * @method once
     */

  }, {
    key: 'once',
    value: function once(name, handler, context) {
      this._prepareOn(name, handler, context);
      Events.once.apply(this, [name, handler, context]);
      return this;
    }

    /**
     * Unsubscribe from events.
     *
     *      // Removes all event handlers for this event:
     *      obj.off('someEventName');
     *
     *      // Removes all event handlers using this function pointer as callback
     *      obj.off(null, f, null);
     *
     *      // Removes all event handlers that `this` has subscribed to; requires
     *      // obj.on to be called with `this` as its `context` parameter.
     *      obj.off(null, null, this);
     *
     * @method off
     * @param  {String} name - Name of the event; null for all event names
     * @param  {Function} handler - Event handler; null for all functions
     * @param  {Object} context - The context from the `on()` call to search for; null for all contexts
     */

    /**
     * Trigger an event for any event listeners.
     *
     * Events triggered this way will be blocked if _disableEvents = true
     *
     * @method trigger
     * @param {string} eventName    Name of the event that one should subscribe to in order to receive this event
     * @param {Mixed} arg           Values that will be placed within a layer.LayerEvent
     * @return {layer.Root} this
     */

  }, {
    key: 'trigger',
    value: function trigger() {
      if (this._disableEvents) return this;
      return this._trigger.apply(this, arguments);
    }

    /**
     * Triggers an event.
     *
     * @method trigger
     * @private
     * @param {string} eventName - Name of the event
     * @return {Object} Return *this* for chaining
     */

  }, {
    key: '_trigger',
    value: function _trigger() {
      if (!Utils.includes(this.constructor._supportedEvents, arguments.length <= 0 ? undefined : arguments[0])) {
        if (!Utils.includes(this.constructor._ignoredEvents, arguments.length <= 0 ? undefined : arguments[0])) {
          Logger.error(this.toString() + ' ignored ' + (arguments.length <= 0 ? undefined : arguments[0]));
        }
        return;
      }

      var computedArgs = this._getTriggerArgs.apply(this, arguments);

      Events.trigger.apply(this, computedArgs);

      var parentProp = this.constructor.bubbleEventParent;
      if (parentProp) {
        var _parentValue;

        var parentValue = this[parentProp];
        parentValue = typeof parentValue === 'function' ? parentValue.apply(this) : parentValue;
        if (parentValue) (_parentValue = parentValue).trigger.apply(_parentValue, _toConsumableArray(computedArgs));
      }
    }

    /**
     * Generates a layer.LayerEvent from a trigger call's arguments.
     *
     * * If parameter is already a layer.LayerEvent, we're done.
     * * If parameter is an object, a `target` property is added to that object and its delivered to all subscribers
     * * If the parameter is non-object value, it is added to an object with a `target` property, and the value is put in
     *   the `data` property.
     *
     * @method _getTriggerArgs
     * @private
     * @return {Mixed[]} - First element of array is eventName, second element is layer.LayerEvent.
     */

  }, {
    key: '_getTriggerArgs',
    value: function _getTriggerArgs() {
      var _this5 = this;

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var computedArgs = Array.prototype.slice.call(args);

      if (args[1]) {
        (function () {
          var newArg = { target: _this5 };

          if (computedArgs[1] instanceof LayerEvent) {
            // A LayerEvent will be an argument when bubbling events up; these args can be used as-is
          } else {
              if (_typeof(computedArgs[1]) === 'object') {
                Object.keys(computedArgs[1]).forEach(function (name) {
                  newArg[name] = computedArgs[1][name];
                });
              } else {
                newArg.data = computedArgs[1];
              }
              computedArgs[1] = new LayerEvent(newArg, computedArgs[0]);
            }
        })();
      } else {
        computedArgs[1] = new LayerEvent({ target: this }, computedArgs[0]);
      }

      return computedArgs;
    }

    /**
     * Same as _trigger() method, but delays briefly before firing.
     *
     * When would you want to delay an event?
     *
     * 1. There is an event rollup that may be needed for the event;
     *    this requires the framework to be able to see ALL events that have been
     *    generated, roll them up, and THEN fire them.
     * 2. The event is intended for UI rendering... which should not hold up the rest of
     *    this framework's execution.
     *
     * When NOT to delay an event?
     *
     * 1. Lifecycle events frequently require response at the time the event has fired
     *
     * @method _triggerAsync
     * @private
     * @param {string} eventName    Name of the event that one should subscribe to in order to receive this event
     * @param {Mixed} arg           Values that will be placed within a layer.LayerEvent
     * @return {layer.Root} this
     */

  }, {
    key: '_triggerAsync',
    value: function _triggerAsync() {
      var _this6 = this;

      var computedArgs = this._getTriggerArgs.apply(this, arguments);
      this._delayedTriggers.push(computedArgs);

      // NOTE: It is unclear at this time how it happens, but on very rare occasions, we see processDelayedTriggers
      // fail to get called when length = 1, and after that length just continuously grows.  So we add
      // the _lastDelayedTrigger test to insure that it will still run.
      var shouldScheduleTrigger = this._delayedTriggers.length === 1 || this._delayedTriggers.length && this._lastDelayedTrigger + 500 < Date.now();
      if (shouldScheduleTrigger) {
        this._lastDelayedTrigger = Date.now();
        if (typeof postMessage === 'function' && typeof jasmine === 'undefined') {
          window.postMessage({
            type: 'layer-delayed-event',
            internalId: this.internalId
          }, '*');
        } else {
          setTimeout(function () {
            return _this6._processDelayedTriggers();
          }, 0);
        }
      }
    }

    /**
     * Combines a set of events into a single event.
     *
     * Given an event structure of
     *
     *      {
     *          customName: [value1]
     *      }
     *      {
     *          customName: [value2]
     *      }
     *      {
     *          customName: [value3]
     *      }
     *
     * Merge them into
     *
     *      {
     *          customName: [value1, value2, value3]
     *      }
     *
     * @method _foldEvents
     * @private
     * @param  {layer.LayerEvent[]} events
     * @param  {string} name      Name of the property (i.e. 'customName')
     * @param  {layer.Root}    newTarget Value of the target for the folded resulting event
     */

  }, {
    key: '_foldEvents',
    value: function _foldEvents(events, name, newTarget) {
      var firstEvt = events.length ? events[0][1] : null;
      var firstEvtProp = firstEvt ? firstEvt[name] : null;
      events.forEach(function (evt, i) {
        if (i > 0) {
          firstEvtProp.push(evt[1][name][0]);
          this._delayedTriggers.splice(this._delayedTriggers.indexOf(evt), 1);
        }
      }, this);
      if (events.length && newTarget) events[0][1].target = newTarget;
    }

    /**
     * Fold a set of Change events into a single Change event.
     *
     * Given a set change events on this component,
     * fold all change events into a single event via
     * the layer.LayerEvent's changes array.
     *
     * @method _foldChangeEvents
     * @private
     */

  }, {
    key: '_foldChangeEvents',
    value: function _foldChangeEvents() {
      var _this7 = this;

      var events = this._delayedTriggers.filter(function (evt) {
        return evt[1].isChange;
      });
      events.forEach(function (evt, i) {
        if (i > 0) {
          events[0][1]._mergeChanges(evt[1]);
          _this7._delayedTriggers.splice(_this7._delayedTriggers.indexOf(evt), 1);
        }
      });
    }

    /**
     * Execute all delayed events for this compoennt.
     *
     * @method _processDelayedTriggers
     * @private
     */

  }, {
    key: '_processDelayedTriggers',
    value: function _processDelayedTriggers() {
      if (this.isDestroyed) return;
      this._foldChangeEvents();

      this._delayedTriggers.forEach(function (evt) {
        this.trigger.apply(this, _toConsumableArray(evt));
      }, this);
      this._delayedTriggers = [];
    }

    /**
     * Returns a string representation of the class that is nicer than [Object].
     *
     * @method toString
     * @return {String}
     */

  }, {
    key: 'toString',
    value: function toString() {
      return this.internalId;
    }
  }]);

  return Root;
}(EventClass);

function defineProperty(newClass, propertyName) {
  var pKey = '__' + propertyName;
  var camel = propertyName.substring(0, 1).toUpperCase() + propertyName.substring(1);

  var hasDefinitions = newClass.prototype['__adjust' + camel] || newClass.prototype['__update' + camel] || newClass.prototype['__get' + camel];
  if (hasDefinitions) {
    // set default value
    newClass.prototype[pKey] = newClass.prototype[propertyName];

    Object.defineProperty(newClass.prototype, propertyName, {
      enumerable: true,
      get: function get() {
        return this['__get' + camel] ? this['__get' + camel](pKey) : this[pKey];
      },
      set: function set(inValue) {
        if (this.isDestroyed) return;
        var initial = this[pKey];
        if (inValue !== initial) {
          if (this['__adjust' + camel]) {
            var result = this['__adjust' + camel](inValue);
            if (result !== undefined) inValue = result;
          }
          this[pKey] = inValue;
        }
        if (inValue !== initial) {
          if (!this.isInitializing && this['__update' + camel]) {
            this['__update' + camel](inValue, initial);
          }
        }
      }
    });
  }
}

function initClass(newClass, className) {
  // Make sure our new class has a name property
  if (!newClass.name) newClass.name = className;

  // Make sure our new class has a _supportedEvents, _ignoredEvents, _inObjectIgnore and EVENTS properties
  if (!newClass._supportedEvents) newClass._supportedEvents = Root._supportedEvents;
  if (!newClass._ignoredEvents) newClass._ignoredEvents = Root._ignoredEvents;

  // Generate a list of properties for this class; we don't include any
  // properties from layer.Root
  var keys = Object.keys(newClass.prototype).filter(function (key) {
    return newClass.prototype.hasOwnProperty(key) && !Root.prototype.hasOwnProperty(key) && typeof newClass.prototype[key] !== 'function';
  });

  // Define getters/setters for any property that has __adjust or __update methods defined
  keys.forEach(function (name) {
    return defineProperty(newClass, name);
  });
}

/**
 * Set to true once destroy() has been called.
 *
 * A destroyed object will likely cause errors in any attempt
 * to call methods on it, and will no longer trigger events.
 *
 * @type {boolean}
 */
Root.prototype.isDestroyed = false;

/**
 * Every instance has its own internal ID.
 *
 * This ID is distinct from any IDs assigned by the server.
 * The internal ID is gaurenteed not to change within the lifetime of the Object/session;
 * it is possible, on creating a new object, for its `id` property to change.
 *
 * @type {string}
 */
Root.prototype.internalId = '';

/**
 * True while we are in the constructor.
 *
 * @type {boolean}
 */
Root.prototype.isInitializing = true;

/**
 * Objects that this object is listening for events from.
 *
 * @type {layer.Root[]}
 */
Root.prototype._subscriptions = null;

/**
 * Disable all events triggered on this object.
 * @type {boolean}
 */
Root.prototype._disableEvents = false;

Root._supportedEvents = ['destroy', 'all'];
Root._ignoredEvents = [];
module.exports = Root;
module.exports.initClass = initClass;

},{"./client-utils":10,"./layer-error":16,"./layer-event":17,"./logger":18,"backbone-events-standalone/backbone-events-standalone":2}],25:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * A Sync Event represents a request to the server.
 * A Sync Event may fire immediately, or may wait in the layer.SyncManager's
 * queue for a long duration before firing.
 *
 * DO NOT confuse this with layer.LayerEvent which represents a change notification
 * to your application.  layer.SyncEvent represents a request to the server that
 * is either in progress or in queue.
 *
 * GET requests are typically NOT done via a SyncEvent as these are typically
 * needed to render a UI and should either fail or succeed promptly.
 *
 * Applications typically do not interact with these objects.
 *
 * @class  layer.SyncEvent
 * @extends layer.Root
 */
var Utils = require('./client-utils');

var SyncEvent = function () {
  /**
   * Create a layer.SyncEvent.  See layer.ClientAuthenticator for examples of usage.
   *
   * @method  constructor
   * @private
   * @return {layer.SyncEvent}
   */

  function SyncEvent(options) {
    _classCallCheck(this, SyncEvent);

    var key = undefined;
    for (key in options) {
      if (key in this) {
        this[key] = options[key];
      }
    }
    if (!this.depends) this.depends = [];
    if (!this.id) this.id = 'layer:///syncevents/' + Utils.generateUUID();
    if (!this.createdAt) this.createdAt = Date.now();
  }

  /**
   * Not strictly required, but nice to clean things up.
   *
   * @method destroy
   */


  _createClass(SyncEvent, [{
    key: 'destroy',
    value: function destroy() {
      this.target = null;
      this.depends = null;
      this.callback = null;
      this.data = null;
    }

    /**
     * Get the Real parameters for the request.
     *
     * @method _updateData
     * @private
     */

  }, {
    key: '_updateData',
    value: function _updateData(client) {
      if (!this.target) return;
      var target = client._getObject(this.target);
      if (target && this.operation === 'POST' && target._getSendData) {
        this.data = target._getSendData(this.data);
      }
    }

    /**
     * Returns a POJO version of this object suitable for serializing for the network
     * @method toObject
     * @returns {Object}
     */

  }, {
    key: 'toObject',
    value: function toObject() {
      return { data: this.data };
    }
  }]);

  return SyncEvent;
}();

/**
 * The type of operation being performed.
 *
 * Either GET, PATCH, DELETE, POST or PUT
 *
 * @property {String}
 */


SyncEvent.prototype.operation = '';

SyncEvent.prototype.fromDB = false;

SyncEvent.prototype.createdAt = 0;

/**
 * Indicates whether this request currently in-flight.
 *
 * * Set to true by _xhr() method,
 * * set to false on completion by layer.SyncManager.
 * * set to false automatically after 2 minutes
 *
 * @property {Boolean}
 */
Object.defineProperty(SyncEvent.prototype, 'isFiring', {
  enumerable: true,
  set: function set(value) {
    this.__isFiring = value;
    if (value) this.__firedAt = Date.now();
  },
  get: function get() {
    return Boolean(this.__isFiring && Date.now() - this.__firedAt < SyncEvent.FIRING_EXPIRIATION);
  }
});

SyncEvent.prototype.id = '';

/**
 * Indicates whether the request completed successfully.
 *
 * Set by layer.SyncManager.
 * @type {Boolean}
 */
SyncEvent.prototype.success = null;

/**
 * Callback to fire on completing this sync event.
 *
 * WARNING: The nature of this callback may change;
 * a persistence layer that persists the SyncManager's queue
 * must have serializable callbacks (object id + method name; not a function)
 * or must accept that callbacks are not always fired.
 * @type {Function}
 */
SyncEvent.prototype.callback = null;

/**
 * Number of retries on this request.
 *
 * Retries are only counted if its a 502 or 503
 * error.  Set and managed by layer.SyncManager.
 * @type {Number}
 */
SyncEvent.prototype.retryCount = 0;

/**
 * The target of the request.
 *
 * Any Component; typically a Conversation or Message.
 * @type {layer.Root}
 */
SyncEvent.prototype.target = null;

/**
 * Components that this request depends upon.
 *
 * A message cannot be sent if its
 * Conversation fails to get created.
 *
 * NOTE: May prove redundant with the target property and needs further review.
 * @type {layer.Root[]}
 */
SyncEvent.prototype.depends = null;

/**
 * Data field of the xhr call; can be an Object or string (including JSON string)
 * @type {Object}
 */
SyncEvent.prototype.data = null;

/**
 * After firing a request, if that firing state fails to clear after this number of miliseconds,
 * consider it to no longer be firing.  Under normal conditions, firing will be set to false explicitly.
 * This check insures that any failure of that process does not leave us stuck with a firing request
 * blocking the queue.
 * @type {number}
 * @static
 */
SyncEvent.FIRING_EXPIRIATION = 1000 * 60 * 2;

/**
 * A layer.SyncEvent intended to be fired as an XHR request.
 *
 * @class layer.SyncEvent.XHRSyncEvent
 * @extends layer.SyncEvent
 */

var XHRSyncEvent = function (_SyncEvent) {
  _inherits(XHRSyncEvent, _SyncEvent);

  function XHRSyncEvent() {
    _classCallCheck(this, XHRSyncEvent);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(XHRSyncEvent).apply(this, arguments));
  }

  _createClass(XHRSyncEvent, [{
    key: '_getRequestData',


    /**
     * Fire the request associated with this instance.
     *
     * Actually it just returns the parameters needed to make the xhr call:
     *
     *      var xhr = require('./xhr');
     *      xhr(event._getRequestData(client));
     *
     * @method _getRequestData
     * @param {layer.Client} client
     * @protected
     * @returns {Object}
     */
    value: function _getRequestData(client) {
      this._updateUrl(client);
      this._updateData(client);
      return {
        url: this.url,
        method: this.method,
        headers: this.headers,
        data: this.data
      };
    }

    /**
     * Get the Real URL.
     *
     * If the url property is a function, call it to set the actual url.
     * Used when the URL is unknown until a prior SyncEvent has completed.
     *
     * @method _updateUrl
     * @private
     */

  }, {
    key: '_updateUrl',
    value: function _updateUrl(client) {
      if (!this.target) return;
      var target = client._getObject(this.target);
      if (target && !this.url.match(/^http(s)\:\/\//)) {
        this.url = target._getUrl(this.url);
      }
    }
  }, {
    key: 'toObject',
    value: function toObject() {
      return {
        data: this.data,
        url: this.url,
        method: this.method
      };
    }
  }, {
    key: '_getCreateId',
    value: function _getCreateId() {
      return this.operation === 'POST' && this.data ? this.data.id : '';
    }
  }]);

  return XHRSyncEvent;
}(SyncEvent);

/**
 * How long before the request times out?
 * @type {Number} [timeout=15000]
 */


XHRSyncEvent.prototype.timeout = 15000;

/**
 * URL to send the request to
 */
XHRSyncEvent.prototype.url = '';

/**
 * Counts number of online state changes.
 *
 * If this number becomes high in a short time period, its probably
 * failing due to a CORS error.
 */
XHRSyncEvent.prototype.returnToOnlineCount = 0;

/**
 * Headers for the request
 */
XHRSyncEvent.prototype.headers = null;

/**
 * Request method.
 */
XHRSyncEvent.prototype.method = 'GET';

/**
 * A layer.SyncEvent intended to be fired as a websocket request.
 *
 * @class layer.SyncEvent.WebsocketSyncEvent
 * @extends layer.SyncEvent
 */

var WebsocketSyncEvent = function (_SyncEvent2) {
  _inherits(WebsocketSyncEvent, _SyncEvent2);

  function WebsocketSyncEvent() {
    _classCallCheck(this, WebsocketSyncEvent);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(WebsocketSyncEvent).apply(this, arguments));
  }

  _createClass(WebsocketSyncEvent, [{
    key: '_getRequestData',


    /**
     * Get the websocket request object.
     *
     * @method _getRequestData
     * @private
     * @param {layer.Client} client
     * @return {Object}
     */
    value: function _getRequestData(client) {
      this._updateData(client);
      return this.data;
    }
  }, {
    key: 'toObject',
    value: function toObject() {
      return this.data;
    }
  }, {
    key: '_getCreateId',
    value: function _getCreateId() {
      return this.operation === 'POST' && this.data.data ? this.data.data.id : '';
    }
  }]);

  return WebsocketSyncEvent;
}(SyncEvent);

module.exports = { SyncEvent: SyncEvent, XHRSyncEvent: XHRSyncEvent, WebsocketSyncEvent: WebsocketSyncEvent };

},{"./client-utils":10}],26:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @class  layer.SyncManager
 * @extends layer.Root
 * @protected
 *
 * This class manages
 *
 * 1. a queue of requests that need to be made
 * 2. when a request should be fired, based on authentication state, online state, websocket connection state, and position in the queue
 * 3. when a request should be aborted
 * 4. triggering any request callbacks
 *
 * TODO WEB-850: Currently the sync queue is managed solely in runtime memory.  But the queue should be stored
 * in persistent memory so that a tab-reload can restore the queue without losing commands that the user has
 * been told have been accepted.
 *
 * TODO: In the event of a DNS error, we may have a valid websocket receiving events and telling us we are online,
 * and be unable to create a REST call.  This will be handled wrong because evidence will suggest that we are online.
 * This issue goes away when we use bidirectional websockets for all requests.
 *
 * Applications do not typically interact with this class, but may subscribe to its events
 * to get richer detailed information than is available from the layer.Client instance.
 */
var Root = require('./root');

var _require = require('./sync-event');

var WebsocketSyncEvent = _require.WebsocketSyncEvent;

var xhr = require('./xhr');
var logger = require('./logger');
var Utils = require('./client-utils');

var SyncManager = function (_Root) {
  _inherits(SyncManager, _Root);

  /**
   * Creates a new SyncManager.
   *
   * An Application is expected to only have one SyncManager.
   *
   *      var socketManager = new layer.Websockets.SocketManager({client: client});
   *      var requestManager = new layer.Websockets.RequestManager({client: client, socketManager: socketManager});
   *
   *      var onlineManager = new layer.OnlineManager({
   *          socketManager: socketManager
   *      });
   *
   *      // Now we can instantiate this thing...
   *      var SyncManager = new layer.SyncManager({
   *          client: client,
   *          onlineManager: onlineManager,
   *          socketManager: socketManager,
   *          requestManager: requestManager
   *      });
   *
   * @method constructor
   * @param  {Object} options
   * @param {layer.OnlineStateManager} options.onlineManager
   * @param {layer.Websockets.RequestManager} options.requestManager
   * @param {layer.Client} options.client
   */

  function SyncManager(options) {
    _classCallCheck(this, SyncManager);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(SyncManager).call(this, options));

    _this.client = options.client;

    // Note we do not store a pointer to client... it is not needed.
    if (_this.client) {
      _this.client.on('ready', function () {
        _this._processNextRequest();
        _this._loadPersistedQueue();
      }, _this);
    }
    _this.queue = [];

    _this.onlineManager.on('disconnected', _this._onlineStateChange, _this);
    _this.socketManager.on('connected disconnected', _this._onlineStateChange, _this);
    return _this;
  }

  _createClass(SyncManager, [{
    key: 'isOnline',
    value: function isOnline() {
      return this.onlineManager.isOnline;
    }

    /**
     * Process sync request when connection is restored.
     *
     * Any time we go back online (as signaled by the onlineStateManager),
     * Process the next Sync Event (will do nothing if one is already firing)
     *
     * @method _onlineStateChange
     * @private
     * @param  {string} evtName - 'connected' or 'disconnected'
     * @param  {layer.LayerEvent} evt
     */

  }, {
    key: '_onlineStateChange',
    value: function _onlineStateChange(evt) {
      var _this2 = this;

      if (evt.eventName === 'connected') {
        if (this.queue.length) this.queue[0].returnToOnlineCount++;
        setTimeout(function () {
          return _this2._processNextRequest();
        }, 100);
      } else if (evt.eventName === 'disconnected') {
        if (this.queue.length) {
          this.queue[0].isFiring = false;
        }
      }
    }

    /**
     * Adds a new xhr request to the queue.
     *
     * If the queue is empty, this will be fired immediately.
     * If the queue is non-empty, this will wait until all other requests in the queue have been fired.
     *
     * @method request
     * @param  {layer.SyncEvent} requestEvt - A SyncEvent specifying the request to be made
     */

  }, {
    key: 'request',
    value: function request(requestEvt) {
      // If its a PATCH request on an object that isn't yet created,
      // do not add it to the queue.
      if (requestEvt.operation !== 'PATCH' || !this._findUnfiredCreate(requestEvt)) {
        logger.info('Sync Manager Request ' + requestEvt.operation + ' on target ' + requestEvt.target);
        logger.debug(requestEvt.toObject());
        this.queue.push(requestEvt);
        this.trigger('sync:add', {
          request: requestEvt,
          target: requestEvt.target
        });
      } else {
        logger.info('Sync Manager Request PATCH ' + requestEvt.target + ' request ignored; create request still enqueued');
        logger.debug(requestEvt.toObject());
      }

      // If its a DELETE request, purge all other requests on that target.
      if (requestEvt.operation === 'DELETE') {
        this._purgeOnDelete(requestEvt);
      }

      // Fire the request if there aren't any existing requests already being processed.
      // If this isn't the first item, assume that all necessary logic exists to fire the
      // existing requests and then it will move onto this request.
      if (this.queue.length === 1 || !this.queue[0].isFiring) {
        this._processNextRequest();
      }
    }

    /**
     * Find create request for this resource.
     *
     * Determine if the given target has a POST request waiting to create
     * the resource, and return any matching requests. Used
     * for folding PATCH requests into an unfired CREATE/POST request.
     *
     * @method _findUnfiredCreate
     * @private
     * @param  {layer.SyncEvent} requestEvt
     * @return {Boolean}
     */

  }, {
    key: '_findUnfiredCreate',
    value: function _findUnfiredCreate(requestEvt) {
      return Boolean(this.queue.filter(function (evt) {
        return evt.target === requestEvt.target && evt.operation === 'POST' && !evt.isFiring;
      }).length);
    }

    /**
     * Process the next request in the queue.
     *
     * Request is dequeued on completing the process.
     * If the first request in the queue is firing, do nothing.
     *
     * @method _processNextRequest
     * @private
     */

  }, {
    key: '_processNextRequest',
    value: function _processNextRequest() {
      var _this3 = this;

      if (this.isDestroyed) return;
      var requestEvt = this.queue[0];
      if (this.isOnline() && requestEvt && !requestEvt.isFiring) {
        this._validateRequest(requestEvt, function (isValid) {
          if (!isValid) {
            _this3._removeRequest(requestEvt);
            return _this3._processNextRequest();
          }
          if (requestEvt instanceof WebsocketSyncEvent) {
            if (_this3.socketManager && _this3.socketManager._isOpen()) {
              logger.debug('Sync Manager Websocket Request Firing ' + requestEvt.operation + ' on target ' + requestEvt.target, requestEvt.toObject());
              _this3.requestManager.sendRequest(requestEvt._getRequestData(_this3.client), function (result) {
                return _this3._xhrResult(result, requestEvt);
              });
              requestEvt.isFiring = true;
            } else {
              logger.debug('Sync Manager Websocket Request skipped; socket closed');
            }
          } else {
            logger.debug('Sync Manager XHR Request Firing ' + requestEvt.operation + ' ' + requestEvt.target, requestEvt.toObject());
            xhr(requestEvt._getRequestData(_this3.client), function (result) {
              return _this3._xhrResult(result, requestEvt);
            });
            requestEvt.isFiring = true;
          }
        });
      } else if (requestEvt && requestEvt.isFiring) {
        logger.debug('Sync Manager processNext skipped; request still firing ' + requestEvt.operation + ' ' + ('on target ' + requestEvt.target), requestEvt.toObject());
      }
    }

    /**
     * Is the syncEvent still valid?
     *
     * This method specifically tests to see if some other tab has already sent this request.
     * If persistence of the syncQueue is not enabled, then the callback is immediately called with true.
     * If another tab has already sent the request, then the entry will no longer be in indexedDB and the callback
     * will call false.
     *
     * @method _validateRequest
     * @param {layer.SyncEvent} syncEvent
     * @param {Function} callback
     * @param {Function} callback.isValid - The request is still valid
     * @private
     */

  }, {
    key: '_validateRequest',
    value: function _validateRequest(syncEvent, callback) {
      this.client.dbManager.claimSyncEvent(syncEvent, function (isFound) {
        return callback(isFound);
      });
    }

    /**
     * Turn deduplication errors into success messages.
     *
     * If this request has already been made but we failed to get a response the first time and we retried the request,
     * we will reissue the request.  If the prior request was successful we'll get back a deduplication error
     * with the created object. As far as the WebSDK is concerned, this is a success.
     *
     * @method _handleDeduplicationErrors
     * @private
     */

  }, {
    key: '_handleDeduplicationErrors',
    value: function _handleDeduplicationErrors(result) {
      if (result.data && result.data.id === 'id_in_use' && result.data.data && result.data.data.id === result.request._getCreateId()) {
        result.success = true;
        result.data = result.data.data;
      }
    }

    /**
     * Process the result of an xhr call, routing it to the appropriate handler.
     *
     * @method _xhrResult
     * @private
     * @param  {Object} result  - Response object returned by xhr call
     * @param  {layer.SyncEvent} requestEvt - Request object
     */

  }, {
    key: '_xhrResult',
    value: function _xhrResult(result, requestEvt) {
      if (this.isDestroyed) return;
      result.request = requestEvt;
      requestEvt.isFiring = false;
      this._handleDeduplicationErrors(result);
      if (!result.success) {
        this._xhrError(result);
      } else {
        this._xhrSuccess(result);
      }
    }

    /**
     * Categorize the error for handling.
     *
     * @method _getErrorState
     * @private
     * @param  {Object} result  - Response object returned by xhr call
     * @param  {layer.SyncEvent} requestEvt - Request object
     * @param  {boolean} isOnline - Is our app state set to online
     */

  }, {
    key: '_getErrorState',
    value: function _getErrorState(result, requestEvt, isOnline) {
      var errId = result.data ? result.data.id : '';
      if (!isOnline) {
        // CORS errors look identical to offline; but if our online state has transitioned from false to true repeatedly while processing this request,
        // thats a hint that that its a CORS error
        if (requestEvt.returnToOnlineCount >= SyncManager.MAX_RETRIES_BEFORE_CORS_ERROR) {
          return 'CORS';
        } else {
          return 'offline';
        }
      } else if (errId === 'not_found') {
        return 'notFound';
      } else if (errId === 'id_in_use') {
        return 'invalidId'; // This only fires if we get `id_in_use` but no Resource, which means the UUID was used by another user/app.
      } else if (result.status === 408 || errId === 'request_timeout') {
          if (requestEvt.retryCount >= SyncManager.MAX_RETRIES) {
            return 'tooManyFailuresWhileOnline';
          } else {
            return 'validateOnlineAndRetry';
          }
        } else if ([502, 503, 504].indexOf(result.status) !== -1) {
          if (requestEvt.retryCount >= SyncManager.MAX_RETRIES) {
            return 'tooManyFailuresWhileOnline';
          } else {
            return 'serverUnavailable';
          }
        } else if (errId === 'authentication_required' && result.data.data && result.data.data.nonce) {
          return 'reauthorize';
        } else {
          return 'serverRejectedRequest';
        }
    }

    /**
     * Handle failed requests.
     *
     * 1. If there was an error from the server, then the request has problems
     * 2. If we determine we are not in fact online, call the connectionError handler
     * 3. If we think we are online, verify we are online and then determine how to handle it.
     *
     * @method _xhrError
     * @private
     * @param  {Object} result  - Response object returned by xhr call
     * @param  {layer.SyncEvent} requestEvt - Request object
     */

  }, {
    key: '_xhrError',
    value: function _xhrError(result) {
      var requestEvt = result.request;

      logger.warn('Sync Manager ' + (requestEvt instanceof WebsocketSyncEvent ? 'Websocket' : 'XHR') + ' ' + (requestEvt.operation + ' Request on target ' + requestEvt.target + ' has Failed'), requestEvt.toObject());

      var errState = this._getErrorState(result, requestEvt, this.isOnline());
      logger.warn('Sync Manager Error State: ' + errState);
      switch (errState) {
        case 'tooManyFailuresWhileOnline':
          this._xhrHandleServerError(result, 'Sync Manager Server Unavailable Too Long; removing request');
          break;
        case 'notFound':
          this._xhrHandleServerError(result, 'Resource not found; presumably deleted');
          break;
        case 'invalidId':
          this._xhrHandleServerError(result, 'ID was not unique; request failed');
          break;
        case 'validateOnlineAndRetry':
          // Server appears to be hung but will eventually recover.
          // Retry a few times and then error out.
          this._xhrValidateIsOnline();
          break;
        case 'serverUnavailable':
          // Server is in a bad state but will eventually recover;
          // keep retrying.
          this._xhrHandleServerUnavailableError(requestEvt);
          break;
        case 'reauthorize':
          // sessionToken appears to no longer be valid; forward response
          // on to client-authenticator to process.
          // Do not retry nor advance to next request.
          if (requestEvt.callback) requestEvt.callback(result);

          break;
        case 'serverRejectedRequest':
          // Server presumably did not like the arguments to this call
          // or the url was invalid.  Do not retry; trigger the callback
          // and let the caller handle it.
          this._xhrHandleServerError(result, 'Sync Manager Server Rejects Request; removing request');
          break;
        case 'CORS':
          // A pattern of offline-like failures that suggests its actually a CORs error
          this._xhrHandleServerError(result, 'Sync Manager Server detects CORS-like errors; removing request');
          break;
        case 'offline':
          this._xhrHandleConnectionError();
          break;
      }

      // Write the sync event back to the database if we haven't completed processing it
      if (this.queue.indexOf(requestEvt) !== -1) {
        this.client.dbManager.writeSyncEvents([requestEvt], false);
      }
    }

    /**
     * Handle a server unavailable error.
     *
     * In the event of a 502 (Bad Gateway), 503 (service unavailable)
     * or 504 (gateway timeout) error from the server
     * assume we have an error that is self correcting on the server.
     * Use exponential backoff to retry the request.
     *
     * Note that each call will increment retryCount; there is a maximum
     * of MAX_RETRIES before it is treated as an error
     *
     * @method  _xhrHandleServerUnavailableError
     * @private
     * @param {layer.SyncEvent} request
     */

  }, {
    key: '_xhrHandleServerUnavailableError',
    value: function _xhrHandleServerUnavailableError(request) {
      var maxDelay = SyncManager.MAX_UNAVAILABLE_RETRY_WAIT;
      var delay = Utils.getExponentialBackoffSeconds(maxDelay, Math.min(15, request.retryCount++));
      logger.warn('Sync Manager Server Unavailable; retry count ' + request.retryCount + '; retrying in ' + delay + ' seconds');
      setTimeout(this._processNextRequest.bind(this), delay * 1000);
    }

    /**
     * Handle a server error in response to firing sync event.
     *
     * If there is a server error, its presumably non-recoverable/non-retryable error, so
     * we're going to abort this request.
     *
     * 1. If a callback was provided, call it to handle the error
     * 2. If a rollback call is provided, call it to undo any patch/delete/etc... changes
     * 3. If the request was to create a resource, remove from the queue all requests
     *    that depended upon that resource.
     * 4. Advance to next request
     *
     * @method _xhrHandleServerError
     * @private
     * @param  {Object} result  - Response object returned by xhr call
     *
     */

  }, {
    key: '_xhrHandleServerError',
    value: function _xhrHandleServerError(result, logMsg) {
      // Execute all callbacks provided by the request
      if (result.request.callback) result.request.callback(result);
      logger.error(logMsg, result.request);
      this.trigger('sync:error', {
        target: result.request.target,
        request: result.request,
        error: result.data
      });

      result.request.success = false;

      // If a POST request fails, all requests that depend upon this object
      // must be purged
      if (result.request.operation === 'POST') {
        this._purgeDependentRequests(result.request);
      }

      // Remove this request as well (side-effect: rolls back the operation)
      this._removeRequest(result.request);

      // And finally, we are ready to try the next request
      this._processNextRequest();
    }

    /**
     * If there is a connection error, wait for retry.
     *
     * In the event of what appears to be a connection error,
     * Wait until a 'connected' event before processing the next request (actually reprocessing the current event)
     *
     * @method _xhrHandleConnectionError
     * @private
     */

  }, {
    key: '_xhrHandleConnectionError',
    value: function _xhrHandleConnectionError() {}
    // Nothing to be done; we already have the below event handler setup
    // this.onlineManager.once('connected', () => this._processNextRequest());


    /**
     * Verify that we are online and retry request.
     *
     * This method is called when we think we're online, but
     * have determined we need to validate that assumption.
     *
     * Test that we have a connection; if we do,
     * retry the request once, and if it fails again,
     * _xhrError() will determine it to have failed and remove it from the queue.
     *
     * If we are offline, then let _xhrHandleConnectionError handle it.
     *
     * @method _xhrValidateIsOnline
     * @private
     */

  }, {
    key: '_xhrValidateIsOnline',
    value: function _xhrValidateIsOnline() {
      var _this4 = this;

      logger.debug('Sync Manager verifying online state');
      this.onlineManager.checkOnlineStatus(function (isOnline) {
        return _this4._xhrValidateIsOnlineCallback(isOnline);
      });
    }

    /**
     * If we have verified we are online, retry request.
     *
     * We should have received a response to our /nonces call
     * which assuming the server is actually alive,
     * will tell us if the connection is working.
     *
     * If we are offline, flag us as offline and let the ConnectionError handler handle this
     * If we are online, give the request a single retry (there is never more than one retry)
     *
     * @method _xhrValidateIsOnlineCallback
     * @private
     * @param  {boolean} isOnline  - Response object returned by xhr call
     */

  }, {
    key: '_xhrValidateIsOnlineCallback',
    value: function _xhrValidateIsOnlineCallback(isOnline) {
      logger.debug('Sync Manager online check result is ' + isOnline);
      if (!isOnline) {
        // Treat this as a Connection Error
        this._xhrHandleConnectionError();
      } else {
        // Retry the request in case we were offline, but are now online.
        // Of course, if this fails, give it up entirely.
        this.queue[0].retryCount++;
        this._processNextRequest();
      }
    }

    /**
     * The XHR request was successful.
     *
     * Any xhr request that actually succedes:
     *
     * 1. Remove it from the queue
     * 2. Call any callbacks
     * 3. Advance to next request
     *
     * @method _xhrSuccess
     * @private
     * @param  {Object} result  - Response object returned by xhr call
     * @param  {layer.SyncEvent} requestEvt - Request object
     */

  }, {
    key: '_xhrSuccess',
    value: function _xhrSuccess(result) {
      var requestEvt = result.request;
      logger.debug('Sync Manager ' + (requestEvt instanceof WebsocketSyncEvent ? 'Websocket' : 'XHR') + ' ' + (requestEvt.operation + ' Request on target ' + requestEvt.target + ' has Succeeded'), requestEvt.toObject());
      if (result.data) logger.debug(result.data);
      requestEvt.success = true;
      this._removeRequest(requestEvt);
      if (requestEvt.callback) requestEvt.callback(result);
      this._processNextRequest();

      this.trigger('sync:success', {
        target: requestEvt.target,
        request: requestEvt,
        response: result.data
      });
    }

    /**
     * Remove the SyncEvent request from the queue.
     *
     * @method _removeRequest
     * @private
     * @param  {layer.SyncEvent} requestEvt - SyncEvent Request to remove
     */

  }, {
    key: '_removeRequest',
    value: function _removeRequest(requestEvt) {
      var index = this.queue.indexOf(requestEvt);
      if (index !== -1) this.queue.splice(index, 1);
    }

    /**
     * Remove requests from queue that depend on specified resource.
     *
     * If there is a POST request to create a new resource, and there are PATCH, DELETE, etc...
     * requests on that resource, if the POST request fails, then all PATCH, DELETE, etc
     * requests must be removed from the queue.
     *
     * Note that we do not call the rollback on these dependent requests because the expected
     * rollback is to destroy the thing that was created, which means any other rollback has no effect.
     *
     * @method _purgeDependentRequests
     * @private
     * @param  {layer.SyncEvent} request - Request whose target is no longer valid
     */

  }, {
    key: '_purgeDependentRequests',
    value: function _purgeDependentRequests(request) {
      this.queue = this.queue.filter(function (evt) {
        return evt.depends.indexOf(request.target) === -1 || evt === request;
      });
    }

    /**
     * Remove from queue all events that operate upon the deleted object.
     *
     * @method _purgeOnDelete
     * @private
     * @param  {layer.SyncEvent} evt - Delete event that requires removal of other events
     */

  }, {
    key: '_purgeOnDelete',
    value: function _purgeOnDelete(evt) {
      var _this5 = this;

      this.queue.filter(function (request) {
        return request.depends.indexOf(evt.target) !== -1 && evt !== request;
      }).forEach(function (requestEvt) {
        _this5.trigger('sync:abort', {
          target: requestEvt.target,
          request: requestEvt
        });
        _this5._removeRequest(requestEvt);
      });
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.queue.forEach(function (evt) {
        return evt.destroy();
      });
      this.queue = null;
      _get(Object.getPrototypeOf(SyncManager.prototype), 'destroy', this).call(this);
    }

    /**
     * Load any unsent requests from indexedDB.
     *
     * If persistence is disabled, nothing will happen;
     * else all requests found in the database will be added to the queue.
     * @method _loadPersistedQueue
     * @private
     */

  }, {
    key: '_loadPersistedQueue',
    value: function _loadPersistedQueue() {
      var _this6 = this;

      this.client.dbManager.loadSyncQueue(function (data) {
        if (data.length) {
          _this6.queue = _this6.queue.concat(data);
          _this6._processNextRequest();
        }
      });
    }
  }]);

  return SyncManager;
}(Root);

/**
 * Websocket Manager for getting socket state.
 * @type {layer.Websockets.SocketManager}
 */


SyncManager.prototype.socketManager = null;

/**
 * Websocket Request Manager for sending requests.
 * @type {layer.Websockets.RequestManager}
 */
SyncManager.prototype.requestManager = null;

/**
 * Reference to the Online State Manager.
 *
 * Sync Manager uses online status to determine if it can fire sync-requests.
 * @private
 * @type {layer.OnlineStateManager}
 */
SyncManager.prototype.onlineManager = null;

/**
 * The array of layer.SyncEvent instances awaiting to be fired.
 * @type {layer.SyncEvent[]}
 */
SyncManager.prototype.queue = null;

/**
 * Reference to the Client so that we can pass it to SyncEvents  which may need to lookup their targets
 */
SyncManager.prototype.client = null;

/**
 * Maximum exponential backoff wait.
 *
 * If the server is returning 502, 503 or 504 errors, exponential backoff
 * should never wait longer than this number of seconds (15 minutes)
 * @type {Number}
 * @static
 */
SyncManager.MAX_UNAVAILABLE_RETRY_WAIT = 60 * 15;

/**
 * Retries before suspect CORS error.
 *
 * How many times can we transition from offline to online state
 * with this request at the front of the queue before we conclude
 * that the reason we keep thinking we're going offline is
 * a CORS error returning a status of 0.  If that pattern
 * shows 3 times in a row, there is likely a CORS error.
 * Note that CORS errors appear to javascript as a status=0 error,
 * which is the same as if the client were offline.
 * @type {number}
 * @static
 */
SyncManager.MAX_RETRIES_BEFORE_CORS_ERROR = 3;

/**
 * Abort request after this number of retries.
 *
 * @type {number}
 * @static
 */
SyncManager.MAX_RETRIES = 20;

SyncManager._supportedEvents = [
/**
 * A sync request has failed.
 *
 * @event
 * @param {layer.SyncEvent} evt - The request object
 * @param {Object} result
 * @param {string} result.target - ID of the message/conversation/etc. being operated upon
 * @param {layer.SyncEvent} result.request - The original request
 * @param {Object} result.error - The error object {id, code, message, url}
 */
'sync:error',

/**
 * A sync layer request has completed successfully.
 *
 * @event
 * @param {Object} result
 * @param {string} result.target - ID of the message/conversation/etc. being operated upon
 * @param {layer.SyncEvent} result.request - The original request
 * @param {Object} result.data - null or any data returned by the call
 */
'sync:success',

/**
 * A new sync request has been added.
 *
 * @event
 * @param {layer.SyncEvent} evt - The request object
 */
'sync:add',

/**
 * A sync request has been canceled.
 *
 * Typically caused by a new SyncEvent that deletes the target of this SyncEvent
 *
 * @event
 * @param {layer.SyncEvent} evt - The request object
 * @param {Object} result
 * @param {string} result.target - ID of the message/conversation/etc. being operated upon
 * @param {layer.SyncEvent} result.request - The original request
 */
'sync:abort'].concat(Root._supportedEvents);

Root.initClass(SyncManager);
module.exports = SyncManager;

},{"./client-utils":10,"./logger":18,"./root":24,"./sync-event":25,"./xhr":36}],27:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * The Syncable abstract clas represents resources that are syncable with the server.
 * This is currently used for Messages and Conversations.
 * It represents the state of the object's sync, as one of:
 *
 *  * layer.Constants.SYNC_STATE.NEW: Newly created; local only.
 *  * layer.Constants.SYNC_STATE.SAVING: Newly created; being sent to the server
 *  * layer.Constants.SYNC_STATE.SYNCING: Exists on both client and server, but changes are being sent to server.
 *  * layer.Constants.SYNC_STATE.SYNCED: Exists on both client and server and is synced.
 *  * layer.Constants.SYNC_STATE.LOADING: Exists on server; loading it into client.
 *
 * NOTE: There is a special case for Messages where isSending is true and syncState !== layer.Constants.SYNC_STATE.SAVING,
 * which occurs after `send()` has been called, but while waiting for Rich Content to upload prior to actually
 * sending this to the server.
 *
 * @class layer.Syncable
 * @extends layer.Root
 * @abstract
 */

var Root = require('./root');

var _require = require('./const');

var SYNC_STATE = _require.SYNC_STATE;

var LayerError = require('./layer-error');

var Syncable = function (_Root) {
  _inherits(Syncable, _Root);

  function Syncable() {
    _classCallCheck(this, Syncable);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Syncable).apply(this, arguments));
  }

  _createClass(Syncable, [{
    key: '_load',


    /**
     * Load this conversation from the server.
     *
     * Called from the static layer.Conversation.load() method
     *
     * @method _load
     * @private
     */
    value: function _load() {
      var _this2 = this;

      this.syncState = SYNC_STATE.LOADING;
      this._xhr({
        url: '',
        method: 'GET',
        sync: false
      }, function (result) {
        return _this2._loadResult(result);
      });
    }
  }, {
    key: '_loadResult',
    value: function _loadResult(result) {
      var _this3 = this;

      var prefix = this.constructor.eventPrefix;
      if (!result.success) {
        this.syncState = SYNC_STATE.NEW;
        this._triggerAsync(prefix + ':loaded-error', { error: result.data });
        setTimeout(function () {
          return _this3.destroy();
        }, 100); // Insure destroyed AFTER loaded-error event has triggered
      } else {
          this._populateFromServer(result.data);
          this._loaded(result.data);
          this.trigger(prefix + ':loaded');
        }
    }

    /**
     * Processing the result of a _load() call.
     *
     * Typically used to register the object and cleanup any properties not handled by _populateFromServer.
     *
     * @method _loaded
     * @private
     * @param  {Object} data - Response data from server
     */

  }, {
    key: '_loaded',
    value: function _loaded(data) {}

    /**
     * Object is queued for syncing with the server.
     *
     * That means it is currently out of sync with the server.
     *
     * @method _setSyncing
     * @private
     */

  }, {
    key: '_setSyncing',
    value: function _setSyncing() {
      this._clearObject();
      switch (this.syncState) {
        case SYNC_STATE.SYNCED:
          this.syncState = SYNC_STATE.SYNCING;
          break;
        case SYNC_STATE.NEW:
          this.syncState = SYNC_STATE.SAVING;
          break;
      }
      this._syncCounter++;
    }

    /**
     * Object is synced with the server and up to date.
     *
     * @method _setSynced
     * @private
     */

  }, {
    key: '_setSynced',
    value: function _setSynced() {
      this._clearObject();
      if (this._syncCounter > 0) this._syncCounter--;

      this.syncState = this._syncCounter === 0 ? SYNC_STATE.SYNCED : SYNC_STATE.SYNCING;
      this.isSending = false;
    }

    /**
     * Any time the instance changes, we should clear the cached toObject value
     *
     * @method _clearObject
     * @private
     */

  }, {
    key: '_clearObject',
    value: function _clearObject() {
      this._toObject = null;
    }

    /**
     * Object is new, and is not yet queued for syncing
     *
     * @method isNew
     * @returns {boolean}
     */

  }, {
    key: 'isNew',
    value: function isNew() {
      return this.syncState === SYNC_STATE.NEW;
    }

    /**
     * Object is new, and is queued for syncing
     *
     * @method isSaving
     * @returns {boolean}
     */

  }, {
    key: 'isSaving',
    value: function isSaving() {
      return this.syncState === SYNC_STATE.SAVING;
    }

    /**
     * Object does not yet exist on server.
     *
     * @method isSaved
     * @returns {boolean}
     */

  }, {
    key: 'isSaved',
    value: function isSaved() {
      return !(this.isNew() || this.isSaving());
    }

    /**
     * Object is fully synced.
     *
     * As best we know, server and client have the same values.
     *
     * @method isSynced
     * @returns {boolean}
     */

  }, {
    key: 'isSynced',
    value: function isSynced() {
      return this.syncState === SYNC_STATE.SYNCED;
    }
  }], [{
    key: 'load',
    value: function load(id, client) {
      if (!client || !(client instanceof Root)) throw new Error(LayerError.dictionary.clientMissing);

      var obj = {
        id: id,
        url: client.url + id.substring(8),
        clientId: client.appId
      };

      var ConstructorClass = Syncable.subclasses.filter(function (aClass) {
        return obj.id.indexOf(aClass.prefixUUID) === 0;
      })[0];
      var syncItem = new ConstructorClass(obj);

      syncItem._load();
      return syncItem;
    }
  }]);

  return Syncable;
}(Root);

/**
 * The current sync state of this object.
 *
 * Possible values are:
 *
 *  * layer.SYNC_STATE.NEW: Newly created; local only.
 *  * layer.Constants.SYNC_STATE.SAVING: Newly created; being sent to the server
 *  * layer.Constants.SYNC_STATE.SYNCING: Exists on both client and server, but changes are being sent to server.
 *  * layer.Constants.SYNC_STATE.SYNCED: Exists on both client and server and is synced.
 *  * layer.Constants.SYNC_STATE.LOADING: Exists on server; loading it into client.
 *
 * NOTE: There is a special case for Messages where isSending is true and syncState !== layer.Constants.SYNC_STATE.SAVING,
 * which occurs after `send()` has been called, but while waiting for Rich Content to upload prior to actually
 * sending this to the server.
 *
 * @type {string}
 */


Syncable.prototype.syncState = SYNC_STATE.NEW;

/**
 * Number of sync requests that have been requested.
 *
 * Counts down to zero; once it reaches zero, all sync
 * requests have been completed.
 *
 * @type {Number}
 * @private
 */
Syncable.prototype._syncCounter = 0;

/**
 * Prefix to use when triggering events
 */
Syncable.eventPrefix = '';

/**
 * Is the object loading from the server?
 *
 * @type {boolean}
 */
Object.defineProperty(Syncable.prototype, 'isLoading', {
  enumerable: true,
  get: function get() {
    return this.syncState === SYNC_STATE.LOADING;
  }
});

/**
 * Array of classes that are subclasses of Syncable.
 *
 * Used by Factory function.
 * @private
 */
Syncable.subclasses = [];

Syncable._supportedEvents = [].concat(Root._supportedEvents);
Syncable.inObjectIgnore = Root.inObjectIgnore;
module.exports = Syncable;

},{"./const":12,"./layer-error":16,"./root":24}],28:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * The TypingIndicatorListener receives Typing Indicator state
 * for other users via a websocket, and notifies
 * the client of the updated state.  Typical applications
 * do not access this component directly, but DO subscribe
 * to events produced by this component:
 *
 *      client.on('typing-indicator-change', function(evt) {
 *        if (evt.conversationId == conversationICareAbout) {
 *          console.log('The following users are typing: ' + evt.typing.join(', '));
 *          console.log('The following users are paused: ' + evt.paused.join(', '));
 *        }
 *      });
 *
 * @class layer.TypingIndicators.TypingIndicatorListener
 * @extends {layer.Root}
 */

var Root = require('../root');
var ClientRegistry = require('../client-registry');

var _require = require('./typing-indicators');

var STARTED = _require.STARTED;
var PAUSED = _require.PAUSED;
var FINISHED = _require.FINISHED;

var TypingIndicatorListener = function (_Root) {
  _inherits(TypingIndicatorListener, _Root);

  /**
   * Creates a Typing Indicator Listener for this Client.
   *
   * @method constructor
   * @protected
   * @param  {Object} args
   * @param {string} args.clientId - ID of the client this belongs to
   */

  function TypingIndicatorListener(args) {
    _classCallCheck(this, TypingIndicatorListener);

    /**
     * Stores the state of all Conversations, indicating who is typing and who is paused.
     *
     * People who are stopped are removed from this state.
     * @property {Object} state
     */

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(TypingIndicatorListener).call(this, args));

    _this.state = {};
    _this._pollId = 0;
    var client = _this._getClient();
    client.on('ready', function () {
      return _this._clientReady();
    });
    return _this;
  }

  /**
   * Called when the client is ready
   *
   * @method _clientReady
   * @private
   */


  _createClass(TypingIndicatorListener, [{
    key: '_clientReady',
    value: function _clientReady() {
      var client = this._getClient();
      this.userId = client.userId;
      var ws = client.socketManager;
      ws.on('message', this._handleSocketEvent, this);
      this._startPolling();
    }

    /**
     * Determines if this event is relevant to report on.
     * Must be a typing indicator signal that is reporting on
     * someone other than this user.
     *
     * @method _isRelevantEvent
     * @private
     * @param  {Object}  Websocket event data
     * @return {Boolean}
     */

  }, {
    key: '_isRelevantEvent',
    value: function _isRelevantEvent(evt) {
      return evt.type === 'signal' && evt.body.type === 'typing_indicator' && evt.body.data.user_id !== this.userId;
    }

    /**
     * This method receives websocket events and
     * if they are typing indicator events, updates its state.
     *
     * @method _handleSocketEvent
     * @private
     * @param {layer.LayerEvent} evtIn - All websocket events
     */

  }, {
    key: '_handleSocketEvent',
    value: function _handleSocketEvent(evtIn) {
      var evt = evtIn.data;

      if (this._isRelevantEvent(evt)) {
        var userId = evt.body.data.user_id;
        var state = evt.body.data.action;
        var conversationId = evt.body.object.id;
        var stateEntry = this.state[conversationId];
        if (!stateEntry) {
          stateEntry = this.state[conversationId] = {
            users: {},
            typing: [],
            paused: []
          };
        }
        stateEntry.users[userId] = {
          startTime: Date.now(),
          state: state
        };
        if (stateEntry.users[userId].state === FINISHED) {
          delete stateEntry.users[userId];
        }

        this._updateState(stateEntry, state, userId);

        this.trigger('typing-indicator-change', {
          conversationId: conversationId,
          typing: stateEntry.typing,
          paused: stateEntry.paused
        });
      }
    }

    /**
     * Updates the state of a single stateEntry; a stateEntry
     * represents a single Conversation's typing indicator data.
     *
     * Updates typing and paused arrays following immutable strategies
     * in hope that this will help Flex based architectures.
     *
     * @method _updateState
     * @private
     * @param  {Object} stateEntry - A Conversation's typing indicator state
     * @param  {string} newState   - started, paused or finished
     * @param  {string} userId     - ID of the user whose state has changed
     */

  }, {
    key: '_updateState',
    value: function _updateState(stateEntry, newState, userId) {
      var typingIndex = stateEntry.typing.indexOf(userId);
      if (newState !== STARTED && typingIndex !== -1) {
        stateEntry.typing = [].concat(_toConsumableArray(stateEntry.typing.slice(0, typingIndex)), _toConsumableArray(stateEntry.typing.slice(typingIndex + 1)));
      }
      var pausedIndex = stateEntry.paused.indexOf(userId);
      if (newState !== PAUSED && pausedIndex !== -1) {
        stateEntry.paused = [].concat(_toConsumableArray(stateEntry.paused.slice(0, pausedIndex)), _toConsumableArray(stateEntry.paused.slice(pausedIndex + 1)));
      }

      if (newState === STARTED && typingIndex === -1) {
        stateEntry.typing = [].concat(_toConsumableArray(stateEntry.typing), [userId]);
      } else if (newState === PAUSED && pausedIndex === -1) {
        stateEntry.paused = [].concat(_toConsumableArray(stateEntry.paused), [userId]);
      }
    }

    /**
     * Any time a state change becomes more than 6 seconds stale,
     * assume that the user is 'finished'.
     *
     * In theory, we should
     * receive a new event every 2.5 seconds.  If the current user
     * has gone offline, lack of this code would cause the people
     * currently flagged as typing as still typing hours from now.
     *
     * For this first pass, we just mark the user as 'finished'
     * but a future pass may move from 'started' to 'paused'
     * and 'paused to 'finished'
     *
     * @method _startPolling
     * @private
     */

  }, {
    key: '_startPolling',
    value: function _startPolling() {
      var _this2 = this;

      if (this._pollId) return;
      this._pollId = setInterval(function () {
        return _this2._poll();
      }, 5000);
    }
  }, {
    key: '_poll',
    value: function _poll() {
      var _this3 = this;

      var conversationIds = Object.keys(this.state);

      conversationIds.forEach(function (id) {
        var state = _this3.state[id];
        Object.keys(_this3.state[id].users).forEach(function (userId) {
          if (Date.now() >= state.users[userId].startTime + 6000) {
            _this3._updateState(state, FINISHED, userId);
            delete state.users[userId];
            _this3.trigger('typing-indicator-change', {
              conversationId: id,
              typing: state.typing,
              paused: state.paused
            });
          }
        });
      });
    }

    /**
     * Get the Client associated with this class.  Uses the clientId
     * property.
     *
     * @method _getClient
     * @protected
     * @return {layer.Client}
     */

  }, {
    key: '_getClient',
    value: function _getClient() {
      return ClientRegistry.get(this.clientId);
    }
  }]);

  return TypingIndicatorListener;
}(Root);

/**
 * setTimeout ID for polling for states to transition
 * @type {Number}
 * @private
 */


TypingIndicatorListener.prototype._pollId = 0;

/**
 * ID of the client this instance is associated with
 * @type {String}
 */
TypingIndicatorListener.prototype.clientId = '';

TypingIndicatorListener.bubbleEventParent = '_getClient';

TypingIndicatorListener._supportedEvents = [
/**
 * There has been a change in typing indicator state of other users.
 * @event change
 * @param {layer.LayerEvent} evt
 * @param {string[]} evt.typing - Array of userIds of people who are typing
 * @param {string[]} evt.paused - Array of userIds of people who are paused
 * @param {string} evt.conversationId - ID of the Converation that has changed typing indicator state
 */
'typing-indicator-change'].concat(Root._supportedEvents);

Root.initClass.apply(TypingIndicatorListener, [TypingIndicatorListener, 'TypingIndicatorListener']);
module.exports = TypingIndicatorListener;

},{"../client-registry":9,"../root":24,"./typing-indicators":29}],29:[function(require,module,exports){
'use strict';

/**
 * Static properties here only needed if your directly using
 * the layer.TypingIndicators.TypingPublisher (not needed if
 * you are using the layer.TypingIndicators.TypingListener).
 *
 *      typingPublisher.setState(layer.TypingIndicators.STARTED);
 *
 * @class  layer.TypingIndicators
 * @static
 */
module.exports = {
  /**
   * Typing has started/resumed
   * @type {String}
   * @static
   */
  STARTED: 'started',

  /**
   * Typing has paused
   * @type {String}
   * @static
   */
  PAUSED: 'paused',

  /**
   * Typing has finished
   * @type {String}
   * @static
   */
  FINISHED: 'finished'
};

},{}],30:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TypingPublisher = require('./typing-publisher');

var _require = require('./typing-indicators');

var STARTED = _require.STARTED;
var PAUSED = _require.PAUSED;
var FINISHED = _require.FINISHED;

/**
 * The Typing Listener Class listens to keyboard events on
 * your text field, and uses the layer.TypingPublisher to
 * send state based on keyboard behavior.
 *
 *      var typingListener = client.createTypingListener(document.getElementById('mytextarea'));
 *
 *  You change what Conversation
 *  the typing indicator reports your user to be typing
 *  in by calling:
 *
 *      typingListener.setConversation(mySelectedConversation);
 *
 * There are two ways of cleaning up all pointers to your input so it can be garbage collected:
 *
 * 1. Destroy the listener:
 *
 *        typingListener.destroy();
 *
 * 2. Remove or replace the input:
 *
 *        typingListener.setInput(null);
 *        typingListener.setInput(newInput);
 *
 * @class  layer.TypingIndicators.TypingListener
 */

var TypingListener = function () {

  /**
   * Create a TypingListener that listens for the user's typing.
   *
   * The TypingListener needs
   * to know what Conversation the user is typing into... but it does not require that parameter during initialization.
   *
   * @method constructor
   * @param  {Object} args
   * @param {string} args.clientId - The ID of the client; used so that the TypingPublisher can access its websocket manager*
   * @param {HTMLElement} [args.input=null] - A Text editor dom node that will have typing indicators
   * @param {Object} [args.conversation=null] - The Conversation Object or Instance that the input will send messages to
   */

  function TypingListener(args) {
    _classCallCheck(this, TypingListener);

    this.clientId = args.clientId;
    this.conversation = args.conversation;
    this.publisher = new TypingPublisher({
      clientId: this.clientId,
      conversation: this.conversation
    });

    this.intervalId = 0;
    this.lastKeyId = 0;

    this._handleKeyPress = this._handleKeyPress.bind(this);
    this._handleKeyDown = this._handleKeyDown.bind(this);
    this.setInput(args.input);
  }

  _createClass(TypingListener, [{
    key: 'destroy',
    value: function destroy() {
      this._removeInput(this.input);
      this.publisher.destroy();
    }

    /**
     * Change the input being tracked by your TypingListener.
     *
     * If you are removing your input from the DOM, you can simply call
     *
     *     typingListener.setInput(null);
     *
     * And all event handlers will be removed, allowing for garbage collection
     * to cleanup your input.
     *
     * You can also call setInput with a newly created input:
     *
     *     var input = document.createElement('input');
     *     typingListener.setInput(input);
     *
     * @method setInput
     * @param {HTMLElement} input - Textarea or text input
     */

  }, {
    key: 'setInput',
    value: function setInput(input) {
      if (input !== this.input) {
        this._removeInput(this.input);
        this.input = input;

        // Use keypress rather than keydown because the user hitting alt-tab to change
        // windows, and other meta keys should not result in typing indicators
        this.input.addEventListener('keypress', this._handleKeyPress);
        this.input.addEventListener('keydown', this._handleKeyDown);
      }
    }

    /**
     * Cleanup and remove all links and callbacks keeping input from being garbage collected.
     *
     * @method _removeInput
     * @private
     * @param {HTMLElement} input - Textarea or text input
     */

  }, {
    key: '_removeInput',
    value: function _removeInput(input) {
      if (input) {
        input.removeEventListener('keypress', this._handleKeyPress);
        input.removeEventListener('keydown', this._handleKeyDown);
        this.input = null;
      }
    }

    /**
     * Change the Conversation; this should set the state of the old Conversation to "finished".
     *
     * Use this when the user has changed Conversations and you want to report on typing to a new
     * Conversation.
     *
     * @method setConversation
     * @param  {Object} conv - The new Conversation Object or Instance
     */

  }, {
    key: 'setConversation',
    value: function setConversation(conv) {
      if (conv !== this.conversation) {
        this.conversation = conv;
        this.publisher.setConversation(conv);
      }
    }

    /**
     * Whenever the key is pressed, send a "started" or "finished" event.
     *
     * If its a "start" event, schedule a pause-test that will send
     * a "pause" event if typing stops.
     *
     * @method _handleKeyPress
     * @private
     * @param  {KeyboardEvent} evt
     */

  }, {
    key: '_handleKeyPress',
    value: function _handleKeyPress(evt) {
      var _this = this;

      if (this.lastKeyId) window.clearTimeout(this.lastKeyId);
      this.lastKeyId = window.setTimeout(function () {
        _this.lastKeyId = 0;
        var isEmpty = !Boolean(_this.input.value);
        _this.send(isEmpty ? FINISHED : STARTED);
      }, 50);
    }

    /**
     * Handles keyboard keys not reported by on by keypress events.
     *
     * These keys can be detected with keyDown event handlers. The ones
     * currently handled here are backspace, delete and enter.
     * We may add more later.
     *
     * @method _handleKeyDown
     * @private
     * @param  {KeyboardEvent} evt
     */

  }, {
    key: '_handleKeyDown',
    value: function _handleKeyDown(evt) {
      if ([8, 46, 13].indexOf(evt.keyCode) !== -1) this._handleKeyPress();
    }

    /**
     * Send the state to the publisher.
     *
     * If your application requires
     * you to directly control the state, you can call this method;
     * however, as long as you use this TypingListener, keyboard
     * events will overwrite any state changes you send.
     *
     * Common use case for this: After a message is sent, you want to clear any typing indicators:
     *
     *      function send() {
     *        message.send();
     *        typingIndicators.send(layer.TypingIndicators.FINISHED);
     *      }
     *
     * @method send
     * @param  {string} state - One of "started", "paused", "finished"
     */

  }, {
    key: 'send',
    value: function send(state) {
      this.publisher.setState(state);
    }
  }]);

  return TypingListener;
}();

module.exports = TypingListener;

},{"./typing-indicators":29,"./typing-publisher":31}],31:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * The TypingPublisher's job is:
 *
 *  1. Send state changes to the server
 *  2. Insure that the server is not flooded with repeated state changes of the same value
 *  3. Automatically transition states when no new states or old states are requested.
 *
 * Who is the Typing Publisher for?  Its used by the layer.TypingIndicators.TypingListener; if your using
 * the TypingListener, you don't need this.  If you want to provide your own logic for when to send typing
 * states, then you need the TypingPublisher.
 *
 * Create an instance using:
 *
 *        var publisher = client.createTypingPublisher();
 *
 * To tell the Publisher which Conversation its reporting activity on, use:
 *
 *        publisher.setConversation(mySelectedConversation);
 *
 * To then use the instance:
 *
 *        publisher.setState(layer.TypingIndicators.STARTED);
 *        publisher.setState(layer.TypingIndicators.PAUSED);
 *        publisher.setState(layer.TypingIndicators.FINISHED);
 *
 * Note that the `STARTED` state only lasts for 2.5 seconds, so you
 * must repeatedly call setState for as long as this state should continue.
 * This is typically done by simply calling `setState(STARTED)` every time a user hits
 * a key.
 *
 * A few rules for how the *publisher* works internally:
 *
 *  - it maintains an indicator state for the current conversation
 *  - if app calls  `setState(layer.TypingIndicators.STARTED);` publisher sends the event immediately
 *  - if app calls the same method under _2.5 seconds_ with the same typing indicator state (`started`), publisher waits
 *    for those 2.5 seconds to pass and then publishes the ephemeral event
 *  - if app calls the same methods multiple times within _2.5 seconds_ with the same value,
 *    publisher waits until end of 2.5 second period and sends the state only once.
 *  - if app calls the same method under _2.5 seconds_ with a different typing indicator state (say `paused`),
 *    publisher immediately sends the event
 *  - if 2.5 seconds passes without any events, state transitions from 'started' to 'paused'
 *  - if 2.5 seconds passes without any events, state transitions from 'paused' to 'finished'
 *
 * @class layer.TypingIndicators.TypingPublisher
 * @protected
 */

var INTERVAL = 2500;

var _require = require('./typing-indicators');

var STARTED = _require.STARTED;
var PAUSED = _require.PAUSED;
var FINISHED = _require.FINISHED;

var ClientRegistry = require('../client-registry');

var TypingPublisher = function () {

  /**
   * Create a Typing Publisher.  See layer.Client.createTypingPublisher.
   *
   * The TypingPublisher needs
   * to know what Conversation its publishing changes for...
   * but it does not require that parameter during initialization.
   *
   * @method constructor
   * @param {Object} args
   * @param {string} clientId - The ID for the client from which we will get access to the websocket
   * @param {Object} [conversation=null] - The Conversation Object or Instance that messages are being typed to.
   */

  function TypingPublisher(args) {
    _classCallCheck(this, TypingPublisher);

    this.clientId = args.clientId;
    if (args.conversation) this.conversation = this._getClient().getConversation(args.conversation.id);
    this.state = FINISHED;
    this._lastMessageTime = 0;
  }

  /**
   * Set which Conversation we are reporting on state changes for.
   *
   * If this instance managed a previous Conversation,
   * its state is immediately transitioned to "finished".
   *
   * @method setConversation
   * @param  {Object} conv - Conversation Object or Instance
   */


  _createClass(TypingPublisher, [{
    key: 'setConversation',
    value: function setConversation(conv) {
      this.setState(FINISHED);
      this.conversation = conv ? this._getClient().getConversation(conv.id) : null;
      this.state = FINISHED;
    }

    /**
     * Sets the state and either sends the state to the server or schedules it to be sent.
     *
     * @method setState
     * @param  {string} state - One of
     * * layer.TypingIndicators.STARTED
     * * layer.TypingIndicators.PAUSED
     * * layer.TypingIndicators.FINISHED
     */

  }, {
    key: 'setState',
    value: function setState(state) {
      // We have a fresh state; whatever our pauseLoop was doing
      // can be canceled... and restarted later.
      if (this._pauseLoopId) {
        clearInterval(this._pauseLoopId);
        this._pauseLoopId = 0;
      }
      if (!this.conversation) return;

      // If its a new state, send it immediately.
      if (this.state !== state) {
        this.state = state;
        this._send(state);
      }

      // No need to resend 'finished' state
      else if (state === FINISHED) {
          return;
        }

        // If its an existing state that hasn't been sent in the
        // last 2.5 seconds, send it immediately.
        else if (Date.now() > this._lastMessageTime + INTERVAL) {
            this._send(state);
          }

          // Else schedule it to be sent.
          else {
              this._scheduleNextMessage(state);
            }

      // Start test to automatically transition if 2.5 seconds without any setState calls
      if (this.state !== FINISHED) this._startPauseLoop();
    }

    /**
     * Start loop to automatically change to next state.
     *
     * Any time we are set to 'started' or 'paused' we should transition
     * to the next state after 2.5 seconds of no setState calls.
     *
     * The 2.5 second setTimeout is canceled/restarted every call to setState()
     *
     * @method _startPauseLoop
     * @private
     */

  }, {
    key: '_startPauseLoop',
    value: function _startPauseLoop() {
      var _this = this;

      if (this._pauseLoopId) return;

      // Note that this interval is canceled every call to setState.
      this._pauseLoopId = window.setInterval(function () {
        if (_this.state === PAUSED) {
          _this.setState(FINISHED);
        } else if (_this.state === STARTED) {
          _this.setState(PAUSED);
        }
      }, INTERVAL);
    }

    /**
     * Schedule the next state refresh message.
     *
     * It should be at least INTERVAL ms after
     * the last state message of the same state
     *
     * @method _scheduleNextMessage
     * @private
     * @param  {string} state - One of
     * * layer.TypingIndicators.STARTED
     * * layer.TypingIndicators.PAUSED
     * * layer.TypingIndicators.FINISHED
     */

  }, {
    key: '_scheduleNextMessage',
    value: function _scheduleNextMessage(state) {
      var _this2 = this;

      if (this._scheduleId) clearTimeout(this._scheduleId);
      var delay = INTERVAL - Math.min(Date.now() - this._lastMessageTime, INTERVAL);
      this._scheduleId = setTimeout(function () {
        _this2._scheduleId = 0;
        // If the state didn't change while waiting...
        if (_this2.state === state) _this2._send(state);
      }, delay);
    }

    /**
     * Send a state change to the server.
     *
     * @method send
     * @private
     * @param  {string} state - One of
     * * layer.TypingIndicators.STARTED
     * * layer.TypingIndicators.PAUSED
     * * layer.TypingIndicators.FINISHED
     */

  }, {
    key: '_send',
    value: function _send(state) {
      if (!this.conversation.isSaved()) return;
      this._lastMessageTime = Date.now();
      var ws = this._getClient().socketManager;
      ws.sendSignal({
        'type': 'typing_indicator',
        'object': {
          'id': this.conversation.id
        },
        'data': {
          'action': state
        }
      });
    }

    /**
     * Get the Client associated with this layer.Message.
     *
     * Uses the clientId property.
     *
     * @method getClient
     * @return {layer.Client}
     */

  }, {
    key: '_getClient',
    value: function _getClient() {
      return ClientRegistry.get(this.clientId);
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      delete this.conversation;
      clearTimeout(this._scheduleId);
      clearInterval(this._pauseLoopId);
    }
  }]);

  return TypingPublisher;
}();

module.exports = TypingPublisher;

},{"../client-registry":9,"./typing-indicators":29}],32:[function(require,module,exports){
/**
 * Layer does not at this time have a concept of Users, so this class
 * is more of a convenience/utility than required use.
 *
 * The main conveniences provided by this class are that when
 * used in conjunction with the `client.users`  array,
 * and the `client.addUser(user)` method, each instance
 * will look for/monitor for Conversations that are direct
 * messages between the currently authenticated user and
 * the user represented by this User instance.
 *
 * This is useful if listing users and want to show their last
 * message or their unread message count.
 *
 *      client.addUser(new layer.User({
 *          displayName: 'Fred',
 *          id: 'fred1234',
 *          data: {
 *              a: 'a',
 *              b: 'b',
 *              lastName: 'Huh?'
 *          }
 *      }));
 *
 * The id will be what is used to find matching Conversations.
 *
 * displayName is not required, but is a convenient place
 * to store a displayable name.
 *
 * The data property contains an arbitrary javascript object
 * with any relevant details of your user.
 *
 * TODO: Replace client with clientId
 *
 * @class  layer.User
 * @extends layer.Root
 * @private // Make this public when Identities is released
 */
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Root = require("./root");
var Util = require("./client-utils");

var User = function (_Root) {
    _inherits(User, _Root);

    function User(options) {
        _classCallCheck(this, User);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(User).call(this, options));

        _this.on("all", _this._clearObject, _this);
        return _this;
    }

    /**
     * Sets the Client property.
     *
     * This is called as a side-effect of `client.addUser(user)`
     *
     * If you directly manipulate `client.users`, instead of calling
     * addUser(), you may need to call this method and set the client property.
     *
     * @method setClient
     * @param  {layer.Client} client
     */


    _createClass(User, [{
        key: "setClient",
        value: function setClient(client) {
            if (client) {
                var conversations = Object.keys(client._conversationsHash).map(function (id) {
                    return client.getConversation(id);
                }).filter(function (c) {
                    return c.participants.length == 2 && c.participants.indexOf(this.id) != -1;
                }, this);

                Util.sortBy(conversations, function (conversation) {
                    return conversation.lastMessage ? conversation.lastMessage.sentAt : null;
                }, true);
                if (conversations.length) {
                    this.conversation = conversations[0];
                } else {
                    client.on("conversations:add", this._checkNewConversation, this);
                }
            }
        }

        /**
         * Searches all new Conversations for matching Conversation.
         *
         * A matching Conversation is a direct message conversation
         * between this user and the client's authenticated user.
         *
         * If its a match, updates this.conversation and stops
         * listening for new Conversations.
         *
         * @method _checkNewConversation
         * @private
         * @param  {layer.LayerEvent} evt
         */

    }, {
        key: "_checkNewConversation",
        value: function _checkNewConversation(evt) {
            var _this2 = this;

            var conversations = evt.conversations;
            conversations.forEach(function (conversation) {
                if (conversation.participants.length == 2 && conversation.participants.indexOf(_this2.id) != -1) {
                    _this2.conversation = conversation;
                    conversation.client.off(null, null, _this2);
                }
            });
        }

        /**
         * Handles new values for the Conversation property.
         *
         * Any time a new Conversation is assigned to this property,
         * subscribe to its "destroy" event and trigger a "conversations:change"
         * event on this user.
         *
         * @method __updateConversation
         * @private
         * @param  {layer.Conversation} conversation
         * @param  {layer.Conversation} oldConversation
         */

    }, {
        key: "__updateConversation",
        value: function __updateConversation(conversation, oldConversation) {
            if (oldConversation) oldConversation.off(null, null, this);
            if (conversation) conversation.on("destroy", this._destroyConversation, this);
            this.trigger("conversations:change");
        }

        /**
         * If the Conversation is destroyed, this user has no Conversation.
         *
         * @method _destroyConversation
         * @private
         * @param  {layer.LayerEvent} evt
         */

    }, {
        key: "_destroyConversation",
        value: function _destroyConversation(evt) {
            this.conversation = null;
        }
    }, {
        key: "toObject",
        value: function toObject() {
            if (!this._toObject) {
                this._toObject = _get(Object.getPrototypeOf(User.prototype), "toObject", this).call(this);
            }
            return this._toObject;
        }
    }, {
        key: "_clearObject",
        value: function _clearObject() {
            delete this._toObject;
        }
    }]);

    return User;
}(Root);

/**
 * Custom user data.
 *
 * This property has no built-in meaning; but is intended to let you store a custom data.
 * Initialize this via constructor:
 *
 *         new layer.User({
 *             data: {
 *                 age: 109,
 *                 nickName: "Freddy"
 *             },
 *             id: "fred"
 *         });
 *
 * @type {Object}
 */


User.prototype.data = null;

/**
 * Your User ID.
 *
 * This ID should match up with the IDs used in participants in Conversations;
 * such IDs are based on your own user IDs which are passed to the Layer services via Identity Tokens.
 * @type {String}
 */
User.prototype.id = "";

/**
 * Your user's displayable name.
 *
 * This property has no built-in meaning; but is intended to let you store a custom string
 * for how to render this user.  Initialize this via constructor:
 *
 *         new layer.User({
 *             displayName: "Freddy",
 *             id: "fred"
 *         });
 *
 * @type {String}
 */
User.prototype.displayName = "";

/**
 * CSS Class for user icon.
 *
 * This property has no built-in meaning; use this if your rendering engine needs this;
 * just pass it into the constructor;
 *
 *         new layer.User({
 *             iconClass: "unknown-face",
 *             id: "fred"
 *         });
 *
 * @type {String}
 */
User.prototype.iconClass = "";

/**
 * The User's Conversation.
 *
 * This property is managed by the user class and is set to always point to any matching Direct
 * Message conversation between this user and the currently authenticated user.  Useful
 * for rendering in a User List and showing unread counts, last message, etc...
 * Can also be used when selecting the user to quickly resume a Conversation.
 * @type {layer.Conversation}
 */
User.prototype.conversation = null;
User.prototype._toObject = null;

User._supportedEvents = ["conversations:change"].concat(Root._supportedEvents);
Root.initClass.apply(User, [User, "User"]);

module.exports = User;

},{"./client-utils":10,"./root":24}],33:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @class  layer.Websockets.ChangeManager
 * @private
 *
 * This class listens for `change` events from the websocket server,
 * and processes them.
 */
var Utils = require('../client-utils');
var logger = require('../logger');
var Message = require('../message');
var Conversation = require('../conversation');

var WebsocketChangeManager = function () {
  /**
   * Create a new websocket change manager
   *
   *      var websocketChangeManager = new layer.Websockets.ChangeManager({
   *          client: client,
   *          socketManager: client.Websockets.SocketManager
   *      });
   *
   * @method
   * @param  {Object} options
   * @param {layer.Client} client
   * @param {layer.Websockets.SocketManager} socketManager
   * @returns {layer.Websockets.ChangeManager}
   */

  function WebsocketChangeManager(options) {
    _classCallCheck(this, WebsocketChangeManager);

    this.client = options.client;
    options.socketManager.on('message', this._handleChange, this);
  }

  /**
   * Handles a Change packet from the server.
   *
   * @method _handleChange
   * @private
   * @param  {layer.LayerEvent} evt
   */


  _createClass(WebsocketChangeManager, [{
    key: '_handleChange',
    value: function _handleChange(evt) {
      if (evt.data.type === 'change') {
        var msg = evt.data.body;
        switch (msg.operation) {
          case 'create':
            logger.info('Websocket Change Event: Create ' + msg.object.type + ' ' + msg.object.id);
            logger.debug(msg.data);
            this._handleCreate(msg);
            break;
          case 'delete':
            logger.info('Websocket Change Event: Delete ' + msg.object.type + ' ' + msg.object.id);
            logger.debug(msg.data);
            this._handleDelete(msg);
            break;
          case 'patch':
            logger.info('Websocket Change Event: Patch ' + msg.object.type + ' ' + msg.object.id + ': ' + msg.data.map(function (op) {
              return op.property;
            }).join(', '));
            logger.debug(msg.data);
            this._handlePatch(msg);
            break;
        }
      }
    }

    /**
     * Process a create object message from the server
     *
     * @method _handleCreate
     * @private
     * @param  {Object} msg
     */

  }, {
    key: '_handleCreate',
    value: function _handleCreate(msg) {
      msg.data.fromWebsocket = true;
      this.client._createObject(msg.data);
    }

    /**
     * Handles delete object messages from the server.
     * All objects that can be deleted from the server should
     * provide a _deleted() method to be called prior to destroy().
     *
     * @method _handleDelete
     * @private
     * @param  {Object} msg
     */

  }, {
    key: '_handleDelete',
    value: function _handleDelete(msg) {
      if (msg.data.mode === 'my_devices' && msg.data.from_position) {
        this.client._purgeMessagesByPosition(msg.object.id, msg.data.from_position);
      } else {
        var entity = this._getObject(msg);
        if (entity) {
          entity._deleted();
          entity.destroy();
        }
      }
    }

    /**
     * On receiving an update/patch message from the server
     * run the LayerParser on the data.
     *
     * @method _handlePatch
     * @private
     * @param  {Object} msg
     */

  }, {
    key: '_handlePatch',
    value: function _handlePatch(msg) {
      // Can only patch a cached object
      var entity = this._getObject(msg);
      if (entity) {
        try {
          entity._inLayerParser = true;
          Utils.layerParse({
            object: entity,
            type: msg.object.type,
            operations: msg.data,
            client: this.client
          });
          entity._inLayerParser = false;
        } catch (err) {
          logger.error('websocket-manager: Failed to handle event', msg.data);
        }
      } else {
        switch (Utils.typeFromID(msg.object.id)) {
          case 'conversations':
            if (Conversation._loadResourceForPatch(msg.data)) this.client.getConversation(msg.object.id, true);
            break;
          case 'messages':
            if (Message._loadResourceForPatch(msg.data)) this.client.getMessage(msg.object.id, true);
            break;
          case 'announcements':
            break;
        }
      }
    }

    /**
     * Get the object specified by the `object` property of the websocket packet.
     *
     * @method _getObject
     * @private
     * @param  {Object} msg
     * @return {layer.Root}
     */

  }, {
    key: '_getObject',
    value: function _getObject(msg) {
      return this.client._getObject(msg.object.id);
    }

    /**
     * Not required, but destroy is best practice
     * @method destroy
     */

  }, {
    key: 'destroy',
    value: function destroy() {
      this.client = null;
    }
  }]);

  return WebsocketChangeManager;
}();

/**
 * The Client that owns this.
 * @type {layer.Client}
 */


WebsocketChangeManager.prototype.client = null;

module.exports = WebsocketChangeManager;

},{"../client-utils":10,"../conversation":14,"../logger":18,"../message":20}],34:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @class  layer.Websockets.RequestManager
 * @private
 *
 * This class allows one to send requests to the websocket server, and provide a callback,
 * And have that callback either called by the correct websocket server response, or
 * be called with a timeout.
 */
var Utils = require('../client-utils');
var logger = require('../logger');
var LayerError = require('../layer-error');

// Wait 15 seconds for a response and then give up
var DELAY_UNTIL_TIMEOUT = 15 * 1000;

var WebsocketRequestManager = function () {
  /**
   * Create a new websocket change manager
   *
   *      var websocketRequestManager = new layer.Websockets.RequestManager({
   *          client: client,
   *          socketManager: client.Websockets.SocketManager
   *      });
   *
   * @method
   * @param  {Object} options
   * @param {layer.Client} client
   * @param {layer.Websockets.SocketManager} socketManager
   * @returns {layer.Websockets.RequestManager}
   */

  function WebsocketRequestManager(options) {
    _classCallCheck(this, WebsocketRequestManager);

    this.client = options.client;
    this.socketManager = options.socketManager;
    this.socketManager.on({
      message: this._handleResponse,
      disconnected: this._reset
    }, this);

    this._requestCallbacks = {};
  }

  _createClass(WebsocketRequestManager, [{
    key: '_reset',
    value: function _reset() {
      this._requestCallbacks = {};
    }

    /**
     * Handle a response to a request.
     *
     * @method _handleResponse
     * @private
     * @param  {layer.LayerEvent} evt
     */

  }, {
    key: '_handleResponse',
    value: function _handleResponse(evt) {
      if (evt.data.type === 'response') {
        var msg = evt.data.body;
        var requestId = msg.request_id;
        var data = msg.success ? msg.data : new LayerError(msg.data);
        logger.debug('Websocket response ' + requestId + ' ' + (msg.success ? 'Successful' : 'Failed'));
        if (requestId && this._requestCallbacks[requestId]) {
          this._requestCallbacks[requestId].callback({
            success: msg.success,
            fullData: evt.data,
            data: data
          });
          delete this._requestCallbacks[requestId];
        }
      }
    }

    /**
     * Shortcut for sending a request; builds in handling for callbacks
     *
     *    manager.sendRequest({
     *      operation: "delete",
     *      object: {id: "layer:///conversations/uuid"},
     *      data: {deletion_mode: "all_participants"}
     *    }, function(result) {
     *        alert(result.success ? "Yay" : "Boo");
     *    });
     *
     * @method sendRequest
     * @param  {Object} data - Data to send to the server
     * @param  {Function} callback - Handler for success/failure callback
     */

  }, {
    key: 'sendRequest',
    value: function sendRequest(data, callback) {
      if (!this._isOpen()) {
        return !callback ? undefined : callback(new LayerError({
          success: false,
          data: { id: 'not_connected', code: 0, message: 'WebSocket not connected' }
        }));
      }
      var body = Utils.clone(data);
      body.request_id = 'r' + this._nextRequestId++;
      logger.debug('Request ' + body.request_id + ' is sending');
      if (callback) {
        this._requestCallbacks[body.request_id] = {
          date: Date.now(),
          callback: callback
        };
      }

      this.socketManager.send({
        type: 'request',
        body: body
      });
      this._scheduleCallbackCleanup();
    }

    /**
     * Flags a request as having failed if no response within 2 minutes
     *
     * @method _scheduleCallbackCleanup
     * @private
     */

  }, {
    key: '_scheduleCallbackCleanup',
    value: function _scheduleCallbackCleanup() {
      if (!this._callbackCleanupId) {
        this._callbackCleanupId = setTimeout(this._runCallbackCleanup.bind(this), DELAY_UNTIL_TIMEOUT + 50);
      }
    }

    /**
     * Calls callback with an error.
     *
     * NOTE: Because we call requests that expect responses serially instead of in parallel,
     * currently there should only ever be a single entry in _requestCallbacks.  This may change in the future.
     *
     * @method _runCallbackCleanup
     * @private
     */

  }, {
    key: '_runCallbackCleanup',
    value: function _runCallbackCleanup() {
      var _this = this;

      this._callbackCleanupId = 0;
      // If the websocket is closed, ignore all callbacks.  The Sync Manager will reissue these requests as soon as it gets
      // a 'connected' event... they have not failed.  May need to rethink this for cases where third parties are directly
      // calling the websocket manager bypassing the sync manager.
      if (this.isDestroyed || !this._isOpen()) return;
      var count = 0;
      var now = Date.now();
      Object.keys(this._requestCallbacks).forEach(function (requestId) {
        var callbackConfig = _this._requestCallbacks[requestId];
        // If the request hasn't expired, we'll need to reschedule callback cleanup; else if its expired...
        if (callbackConfig && now < callbackConfig.date + DELAY_UNTIL_TIMEOUT) {
          count++;
        } else {
          // If there has been no data from the server, there's probably a problem with the websocket; reconnect.
          if (now > _this.socketManager._lastDataFromServerTimestamp + DELAY_UNTIL_TIMEOUT) {
            _this.socketManager._reconnect(false);
            _this._scheduleCallbackCleanup();
            return;
          } else {
            // The request isn't responding and the socket is good; fail the request.
            _this._timeoutRequest(requestId);
          }
        }
      });
      if (count) this._scheduleCallbackCleanup();
    }
  }, {
    key: '_timeoutRequest',
    value: function _timeoutRequest(requestId) {
      try {
        logger.warn('Websocket request timeout');
        this._requestCallbacks[requestId].callback({
          success: false,
          data: new LayerError({
            id: 'request_timeout',
            message: 'The server is not responding. We know how much that sucks.',
            url: 'https:/developer.layer.com/docs/websdk',
            code: 0,
            status: 408,
            httpStatus: 408
          })
        });
      } catch (err) {
        // Do nothing
      }
      delete this._requestCallbacks[requestId];
    }
  }, {
    key: '_isOpen',
    value: function _isOpen() {
      return this.socketManager._isOpen();
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.isDestroyed = true;
      if (this._callbackCleanupId) clearTimeout(this._callbackCleanupId);
      this._requestCallbacks = null;
    }
  }]);

  return WebsocketRequestManager;
}();

WebsocketRequestManager.prototype._nextRequestId = 1;

/**
 * The Client that owns this.
 * @type {layer.Client}
 */
WebsocketRequestManager.prototype.client = null;

WebsocketRequestManager.prototype._requestCallbacks = null;

WebsocketRequestManager.prototype._callbackCleanupId = 0;

WebsocketRequestManager.prototype.socketManager = null;

module.exports = WebsocketRequestManager;

},{"../client-utils":10,"../layer-error":16,"../logger":18}],35:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * This component manages
 *
 * 1. recieving websocket events
 * 2. Processing them
 * 3. Triggering events on completing them
 * 4. Sending them
 *
 * Applications typically do not interact with this component, but may subscribe
 * to the `message` event if they want richer event information than is available
 * through the layer.Client class.
 *
 * @class  layer.Websockets.SocketManager
 * @extends layer.Root
 * @private
 */
var Root = require('../root');
var Utils = require('../client-utils');
var logger = require('../logger');

var SocketManager = function (_Root) {
  _inherits(SocketManager, _Root);

  /**
   * Create a new websocket manager
   *
   *      var socketManager = new layer.Websockets.SocketManager({
   *          client: client,
   *      });
   *
   * @method
   * @param  {Object} options
   * @param {layer.Client} client
   * @return {layer.Websockets.SocketManager}
   */

  function SocketManager(options) {
    _classCallCheck(this, SocketManager);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(SocketManager).call(this, options));

    if (!_this.client) throw new Error('SocketManager requires a client');

    // Insure that on/off methods don't need to call bind, therefore making it easy
    // to add/remove functions as event listeners.
    _this._onMessage = _this._onMessage.bind(_this);
    _this._onOpen = _this._onOpen.bind(_this);
    _this._onSocketClose = _this._onSocketClose.bind(_this);
    _this._onError = _this._onError.bind(_this);

    // If the client is authenticated, start it up.
    if (_this.client.isAuthenticated && _this.client.onlineManager.isOnline) {
      _this.connect();
    }

    _this.client.on('online', _this._onlineStateChange, _this);

    // Any time the Client triggers a ready event we need to reconnect.
    _this.client.on('authenticated', _this.connect, _this);

    _this._lastTimestamp = Date.now();
    return _this;
  }

  /**
   * Call this when we want to reset all websocket state; this would be done after a lengthy period
   * of being disconnected.  This prevents Event.replay from being called on reconnecting.
   *
   * @method _reset
   * @private
   */


  _createClass(SocketManager, [{
    key: '_reset',
    value: function _reset() {
      this._lastTimestamp = 0;
      this._lastDataFromServerTimestamp = 0;
      this._lastCounter = null;
      this._hasCounter = false;

      this._inReplay = false;
      this._needsReplayFrom = null;
    }

    /**
     * Event handler is triggered any time the client's online state changes.
     * If going online we need to reconnect (i.e. will close any existing websocket connections and then open a new connection)
     * If going offline, close the websocket as its no longer useful/relevant.
     * @method _onlineStateChange
     * @private
     * @param {layer.LayerEvent} evt
     */

  }, {
    key: '_onlineStateChange',
    value: function _onlineStateChange(evt) {
      if (!this.client.isAuthenticated) return;
      if (evt.isOnline) {
        this._reconnect(evt.reset);
      } else {
        this.close();
      }
    }

    /**
     * Reconnect to the server, optionally resetting all data if needed.
     * @method _reconnect
     * @private
     * @param {boolean} reset
     */

  }, {
    key: '_reconnect',
    value: function _reconnect(reset) {
      // The sync manager will reissue any requests once it receives a 'connect' event from the websocket manager.
      // There is no need to have an error callback at this time.
      // Note that calls that come from sources other than the sync manager may suffer from this.
      // Once the websocket implements retry rather than the sync manager, we may need to enable it
      // to trigger a callback after sufficient time.  Just delete all callbacks.
      this.close();
      if (reset) this._reset();
      this.connect();
    }

    /**
     * Connect to the websocket server
     *
     * @method connect
     * @param  {layer.SyncEvent} evt - Ignored parameter
     */

  }, {
    key: 'connect',
    value: function connect(evt) {
      if (this.client.isDestroyed || !this.client.isOnline) return;

      this._closing = false;

      this._lastCounter = -1;

      // Load up our websocket component or shim
      /* istanbul ignore next */
      var WS = typeof WebSocket === 'undefined' ? require('websocket').w3cwebsocket : WebSocket;

      // Get the URL and connect to it
      var url = this.client.url.replace(/^http/, 'ws') + '/websocket?session_token=' + this.client.sessionToken;
      this._socket = new WS(url, 'layer-1.0');

      // If its the shim, set the event hanlers
      /* istanbul ignore if */
      if (typeof WebSocket === 'undefined') {
        this._socket.onmessage = this._onMessage;
        this._socket.onclose = this._onSocketClose;
        this._socket.onopen = this._onOpen;
        this._socket.onerror = this._onError;
      }

      // If its a real websocket, add the event handlers
      else {
          this._socket.addEventListener('message', this._onMessage);
          this._socket.addEventListener('close', this._onSocketClose);
          this._socket.addEventListener('open', this._onOpen);
          this._socket.addEventListener('error', this._onError);
        }

      // Trigger a failure if it takes >= 5 seconds to establish a connection
      this._connectionFailedId = setTimeout(this._connectionFailed.bind(this), 5000);
    }

    /**
     * Clears the scheduled call to _connectionFailed that is used to insure the websocket does not get stuck
     * in CONNECTING state. This call is used after the call has completed or failed.
     *
     * @method _clearConnectionFailed
     * @private
     */

  }, {
    key: '_clearConnectionFailed',
    value: function _clearConnectionFailed() {
      if (this._connectionFailedId) {
        clearTimeout(this._connectionFailedId);
        this._connectionFailedId = 0;
      }
    }

    /**
     * Called after 5 seconds of entering CONNECTING state without getting an error or a connection.
     * Calls _onError which will cause this attempt to be stopped and another connection attempt to be scheduled.
     *
     * @method _connectionFailed
     * @private
     */

  }, {
    key: '_connectionFailed',
    value: function _connectionFailed() {
      this._connectionFailedId = 0;
      var msg = 'Websocket failed to connect to server';
      logger.warn(msg);

      // TODO: At this time there is little information on what happens when closing a websocket connection that is stuck in
      // readyState=CONNECTING.  Does it throw an error?  Does it call the onClose or onError event handlers?
      // Remove all event handlers so that calling close won't trigger any calls.
      try {
        this.isOpen = false;
        this._removeSocketEvents();
        this._socket.close();
        this._socket = null;
      } catch (e) {}
      // No-op


      // Now we can call our error handler.
      this._onError(new Error(msg));
    }

    /**
     * The websocket connection is reporting that its now open.
     *
     * @method _onOpen
     * @private
     */

  }, {
    key: '_onOpen',
    value: function _onOpen() {
      this._clearConnectionFailed();
      if (this._isOpen()) {
        this._lostConnectionCount = 0;
        this.isOpen = true;
        this.trigger('connected');
        logger.debug('Websocket Connected');
        if (this._hasCounter) {
          this.replayEvents(this._lastTimestamp, true);
        } else {
          this._reschedulePing();
        }
      }
    }

    /**
     * Tests to see if the websocket connection is open.  Use the isOpen property
     * for external tests.
     * @method _isOpen
     * @private
     * @returns {Boolean}
     */

  }, {
    key: '_isOpen',
    value: function _isOpen() {
      if (!this._socket) return false;
      /* istanbul ignore if */
      if (typeof WebSocket === 'undefined') return true;
      return this._socket && this._socket.readyState === WebSocket.OPEN;
    }

    /**
     * If not isOpen, presumably failed to connect
     * Any other error can be ignored... if the connection has
     * failed, onClose will handle it.
     *
     * @method _onError
     * @private
     * @param  {Error} err - Websocket error
     */

  }, {
    key: '_onError',
    value: function _onError(err) {
      if (this._closing) return;
      this._clearConnectionFailed();
      logger.debug('Websocket Error causing websocket to close', err);
      if (!this.isOpen) {
        this._removeSocketEvents();
        this._lostConnectionCount++;
        this._scheduleReconnect();
      } else {
        this._onSocketClose();
        this._socket.close();
        this._socket = null;
      }
    }

    /**
     * Shortcut method for sending a signal
     *
     *    manager.sendSignal({
            'type': 'typing_indicator',
            'object': {
              'id': this.conversation.id
            },
            'data': {
              'action': state
            }
          });
     *
     * @method sendSignal
     * @param  {Object} body - Signal body
     */

  }, {
    key: 'sendSignal',
    value: function sendSignal(body) {
      if (this._isOpen()) {
        this._socket.send(JSON.stringify({
          type: 'signal',
          body: body
        }));
      }
    }

    /**
     * Shortcut to sending a Counter.read request
     *
     * @method getCounter
     * @param  {Function} callback
     * @param {boolean} callback.success
     * @param {number} callback.lastCounter
     * @param {number} callback.newCounter
     */

  }, {
    key: 'getCounter',
    value: function getCounter(callback) {
      logger.debug('Websocket request: getCounter');
      this.client.socketRequestManager.sendRequest({
        method: 'Counter.read'
      }, function (result) {
        logger.debug('Websocket response: getCounter ' + result.data.counter);
        if (callback) {
          if (result.success) {
            callback(true, result.data.counter, result.fullData.counter);
          } else {
            callback(false);
          }
        }
      });
    }

    /**
     * Replays all missed change packets since the specified timestamp
     *
     * @method replayEvents
     * @param  {string|number}   timestamp - Iso formatted date string; if number will be transformed into formatted date string.
     * @param  {boolean} [force=false] - if true, cancel any in progress replayEvents and start a new one
     * @param  {Function} [callback] - Optional callback for completion
     */

  }, {
    key: 'replayEvents',
    value: function replayEvents(timestamp, force, callback) {
      var _this2 = this;

      if (!timestamp) return;
      if (force) this._inReplay = false;
      if (typeof timestamp === 'number') timestamp = new Date(timestamp).toISOString();

      // If we are already waiting for a replay to complete, record the timestamp from which we
      // need to replay on our next replay request
      // If we are simply unable to replay because we're disconnected, capture the _needsReplayFrom
      if (this._inReplay || !this._isOpen()) {
        if (!this._needsReplayFrom) {
          logger.debug('Websocket request: replayEvents updating _needsReplayFrom');
          this._needsReplayFrom = timestamp;
        }
      } else {
        this._inReplay = true;
        logger.info('Websocket request: replayEvents');
        this.client.socketRequestManager.sendRequest({
          method: 'Event.replay',
          data: {
            from_timestamp: timestamp
          }
        }, function (result) {
          return _this2._replayEventsComplete(timestamp, callback, result.success);
        });
      }
    }

    /**
     * Callback for handling completion of replay.
     *
     * @method _replayEventsComplete
     * @private
     * @param  {Date}     timestamp
     * @param  {Function} callback
     * @param  {Boolean}   success
     */

  }, {
    key: '_replayEventsComplete',
    value: function _replayEventsComplete(timestamp, callback, success) {
      this._inReplay = false;

      // If replay was completed, and no other requests for replay, then trigger synced;
      // we're done.
      if (success && !this._needsReplayFrom) {
        logger.info('Websocket replay complete');
        this.trigger('synced');
        if (callback) callback();
      }

      // If replayEvents was called during a replay, then replay
      // from the given timestamp.  If request failed, then we need to retry from _lastTimestamp
      else if (success && this._needsReplayFrom) {
          logger.info('Websocket replay partially complete');
          var t = this._needsReplayFrom;
          this._needsReplayFrom = null;
          this.replayEvents(t);
        }

        // We never got a done event.  We also didn't miss any counters, so the last
        // message we received was valid; so lets just use that as our timestamp and
        // try again until we DO get a Event.Replay completion packet
        else {
            logger.info('Websocket replay retry');
            this.replayEvents(timestamp);
          }
    }

    /**
     * Handles a new websocket packet from the server
     *
     * @method _onMessage
     * @private
     * @param  {Object} evt - Message from the server
     */

  }, {
    key: '_onMessage',
    value: function _onMessage(evt) {
      this._lostConnectionCount = 0;
      try {
        var msg = JSON.parse(evt.data);
        var skippedCounter = this._lastCounter + 1 !== msg.counter;
        this._hasCounter = true;
        this._lastCounter = msg.counter;
        this._lastDataFromServerTimestamp = Date.now();

        // If we've missed a counter, replay to get; note that we had to update _lastCounter
        // for replayEvents to work correctly.
        if (skippedCounter) {
          this.replayEvents(this._lastTimestamp);
        } else {
          this._lastTimestamp = new Date(msg.timestamp).getTime();
        }

        this.trigger('message', {
          data: msg
        });

        this._reschedulePing();
      } catch (err) {
        logger.error('Layer-Websocket: Failed to handle websocket message: ' + err + '\n', evt.data);
      }
    }

    /**
     * Reschedule a ping request which helps us verify that the connection is still alive,
     * and that we haven't missed any events.
     *
     * @method _reschedulePing
     * @private
     */

  }, {
    key: '_reschedulePing',
    value: function _reschedulePing() {
      if (this._nextPingId) {
        clearTimeout(this._nextPingId);
      }
      this._nextPingId = setTimeout(this._ping.bind(this), this.pingFrequency);
    }

    /**
     * Send a counter request to the server to verify that we are still connected and
     * have not missed any events.
     *
     * @method _ping
     * @private
     */

  }, {
    key: '_ping',
    value: function _ping() {
      logger.debug('Websocket ping');
      this._nextPingId = 0;
      if (this._isOpen()) {
        // NOTE: onMessage will already have called reschedulePing, but if there was no response, then the error handler would NOT have called it.
        this.getCounter(this._reschedulePing.bind(this));
      }
    }

    /**
     * Close the websocket.
     *
     * @method close
     */

  }, {
    key: 'close',
    value: function close() {
      logger.debug('Websocket close requested');
      this._closing = true;
      this.isOpen = false;
      if (this._socket) {
        // Close all event handlers and set socket to null
        // without waiting for browser event to call
        // _onSocketClose as the next command after close
        // might require creating a new socket
        this._onSocketClose();
        this._socket.close();
        this._socket = null;
      }
    }

    /**
     * Send a packet across the websocket
     * @method send
     * @param {Object} obj
     */

  }, {
    key: 'send',
    value: function send(obj) {
      this._socket.send(JSON.stringify(obj));
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.close();
      if (this._nextPingId) clearTimeout(this._nextPingId);
      _get(Object.getPrototypeOf(SocketManager.prototype), 'destroy', this).call(this);
    }

    /**
     * If the socket has closed (or if the close method forces it closed)
     * Remove all event handlers and if appropriate, schedule a retry.
     *
     * @method _onSocketClose
     * @private
     */

  }, {
    key: '_onSocketClose',
    value: function _onSocketClose() {
      logger.debug('Websocket closed');
      this.isOpen = false;
      if (!this._closing) {
        this._scheduleReconnect();
      }

      this._removeSocketEvents();
      this.trigger('disconnected');
    }

    /**
     * Removes all event handlers on the current socket.
     *
     * @method _removeSocketEvents
     * @private
     */

  }, {
    key: '_removeSocketEvents',
    value: function _removeSocketEvents() {
      /* istanbul ignore if */
      if (typeof WebSocket !== 'undefined' && this._socket) {
        this._socket.removeEventListener('message', this._onMessage);
        this._socket.removeEventListener('close', this._onSocketClose);
        this._socket.removeEventListener('open', this._onOpen);
        this._socket.removeEventListener('error', this._onError);
      } else if (this._socket) {
        this._socket.onmessage = null;
        this._socket.onclose = null;
        this._socket.onopen = null;
        this._socket.onerror = null;
      }
    }

    /**
     * Schedule an attempt to reconnect to the server.  If the onlineManager
     * declares us to be offline, don't bother reconnecting.  A reconnect
     * attempt will be triggered as soon as the online manager reports we are online again.
     *
     * Note that the duration of our delay can not excede the onlineManager's ping frequency
     * or it will declare us to be offline while we attempt a reconnect.
     *
     * @method _scheduleReconnect
     * @private
     */

  }, {
    key: '_scheduleReconnect',
    value: function _scheduleReconnect() {
      if (this.isDestroyed || !this.client.isOnline) return;

      var maxDelay = (this.client.onlineManager.pingFrequency - 1000) / 1000;
      var delay = Utils.getExponentialBackoffSeconds(maxDelay, Math.min(15, this._lostConnectionCount));
      logger.debug('Websocket Reconnect in ' + delay + ' seconds');
      this._reconnectId = setTimeout(this.connect.bind(this), delay * 1000);
    }
  }]);

  return SocketManager;
}(Root);

/**
 * Is the websocket connection currently open?
 * @type {Boolean}
 */


SocketManager.prototype.isOpen = false;

/**
 * setTimeout ID for calling connect()
 * @private
 * @type {Number}
 */
SocketManager.prototype._reconnectId = 0;

/**
 * setTimeout ID for calling _connectionFailed()
 * @private
 * @type {Number}
 */
SocketManager.prototype._connectionFailedId = 0;

SocketManager.prototype._lastTimestamp = 0;
SocketManager.prototype._lastDataFromServerTimestamp = 0;
SocketManager.prototype._lastCounter = null;
SocketManager.prototype._hasCounter = false;

SocketManager.prototype._inReplay = false;
SocketManager.prototype._needsReplayFrom = null;

/**
 * Frequency with which the websocket checks to see if any websocket notifications
 * have been missed.
 * @type {Number}
 */
SocketManager.prototype.pingFrequency = 30000;

/**
 * The Client that owns this.
 * @type {layer.Client}
 */
SocketManager.prototype.client = null;

/**
 * The Socket Connection instance
 * @type {Websocket}
 */
SocketManager.prototype._socket = null;

/**
 * Is the websocket connection being closed by a call to close()?
 * If so, we can ignore any errors that signal the socket as closing.
 * @type {Boolean}
 */
SocketManager.prototype._closing = false;

/**
 * Number of failed attempts to reconnect.
 * @type {Number}
 */
SocketManager.prototype._lostConnectionCount = 0;

SocketManager._supportedEvents = [
/**
 * A data packet has been received from the server.
 * @event message
 * @param {layer.LayerEvent} layerEvent
 * @param {Object} layerEvent.data - The data that was received from the server
 */
'message',

/**
 * The websocket is now connected.
 * @event connected
 * @protected
 */
'connected',

/**
 * The websocket is no longer connected
 * @event disconnected
 * @protected
 */
'disconnected',

/**
 * Websocket events were missed; we are resyncing with the server
 * @event replay-begun
 */
'syncing',

/**
 * Websocket events were missed; we resynced with the server and are now done
 * @event replay-begun
 */
'synced'].concat(Root._supportedEvents);
Root.initClass.apply(SocketManager, [SocketManager, 'SocketManager']);
module.exports = SocketManager;

},{"../client-utils":10,"../logger":18,"../root":24,"websocket":3}],36:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

/**
 * Basic XHR Library with some notions hardcoded in
 * of what the Layer server expects/returns.
 *
    layer.xhr({
      url: 'http://my.com/mydata',
      data: {hey: 'ho', there: 'folk'},
      method: 'GET',
      format: 'json',
      headers: {'fred': 'Joe'},
      timeout: 50000
    }, function(result) {
      if (!result.success) {
        errorHandler(result.data, result.headers, result.status);
      } else {
        successHandler(result.data, result.headers, result.xhr);
      }
    });
 *
 * @class layer.xhr
 */

/**
 * Send a Request.
 *
 * @method  xhr
 * @param {Object} options
 * @param {string} options.url
 * @param {Mixed} [options.data=null]
 * @param {string} [options.format=''] - set to 'json' to get result parsed as json (in case there is no obvious Content-Type in the response)
 * @param {Object} [options.headers={}] - Name value pairs for  headers and their values
 * @param {number} [options.timeout=0] - When does the request expire/timeout in miliseconds.
 * @param {Function} callback
 * @param {Object} callback.result
 * @param {number} callback.result.status - http status code
 * @param {boolean} callback.result.success - true if it was a successful response
 * @param {XMLHttpRequest} callback.result.xhr - The XHR object used for the request
 * @param {Object} callback.result.data -  The parsed response body
 *
 * TODO:
 *
 * 1. Make this a subclass of Root and make it a singleton so it can inherit a proper event system
 * 2. Result should be a layer.ServerResponse instance
 * 3. Should only access link headers if requested; annoying having it throw errors every other time.
 */

// Don't set xhr to window.XMLHttpRequest as it will bypass jasmine's
// ajax library
var Xhr = typeof window === 'undefined' ? require('xhr2') : null;

function parseLinkHeaders(linkHeader) {
  if (!linkHeader) return {};

  // Split parts by comma
  var parts = linkHeader.split(',');
  var links = {};

  // Parse each part into a named link
  parts.forEach(function (part) {
    var section = part.split(';');
    if (section.length !== 2) return;
    var url = section[0].replace(/<(.*)>/, '$1').trim();
    var name = section[1].replace(/rel='?(.*)'?/, '$1').trim();
    links[name] = url;
  });

  return links;
}

module.exports = function (request, callback) {
  var req = Xhr ? new Xhr() : new XMLHttpRequest();
  var method = (request.method || 'GET').toUpperCase();

  var onload = function onload() {
    var headers = {
      'content-type': this.getResponseHeader('content-type')
    };

    var result = {
      status: this.status,
      success: this.status && this.status < 300,
      xhr: this
    };
    var isJSON = String(headers['content-type']).split(/;/)[0].match(/^application\/json/) || request.format === 'json';

    if (this.responseType === 'blob' || this.responseType === 'arraybuffer') {
      // Damnit, this.response is a function if using jasmine test framework.
      result.data = typeof this.response === 'function' ? this.responseText : this.response;
    } else {
      if (isJSON && this.responseText) {
        try {
          result.data = JSON.parse(this.responseText);
        } catch (err) {
          result.data = {
            code: 999,
            message: 'Invalid JSON from server',
            response: this.responseText
          };
          result.status = 999;
        }
      } else {
        result.data = this.responseText;
      }

      module.exports.trigger({
        target: this,
        status: !this.responseText && !this.status ? 'connection:error' : 'connection:success'
      });

      if (!this.responseText && !this.status) {
        result.status = 408;
        result.data = {
          id: 'request_timeout',
          message: 'The server is not responding please try again in a few minutes',
          url: 'https://developer.layer.com/docs/websdk',
          code: 0,
          status: 408,
          httpStatus: 408
        };
      } else if (this.status === 404 && _typeof(result.data) !== 'object') {
        result.data = {
          id: 'operation_not_found',
          message: 'Endpoint ' + (request.method || 'GET') + ' ' + request.url + ' does not exist',
          status: this.status,
          httpStatus: 404,
          code: 106,
          url: 'https://developer.layer.com/docs/websdk'
        };
      } else if (typeof result.data === 'string' && this.status >= 400) {
        result.data = {
          id: 'unknown_error',
          message: result.data,
          status: this.status,
          httpStatus: this.status,
          code: 0,
          url: 'https://developer.layer.com/docs/websdk'
        };
      }
    }

    if (request.headers && (request.headers.accept || '').match(/application\/vnd.layer\+json/)) {
      var links = this.getResponseHeader('link');
      if (links) result.Links = parseLinkHeaders(links);
    }
    result.xhr = this;

    if (callback) callback(result);
  };

  req.onload = onload;

  // UNTESTED!!!
  req.onerror = req.ontimeout = onload;

  // Replace all headers in arbitrary case with all lower case
  // for easy matching.
  var headersList = Object.keys(request.headers || {});
  var headers = {};
  headersList.forEach(function (header) {
    if (header.toLowerCase() === 'content-type') {
      headers['content-type'] = request.headers[header];
    } else {
      headers[header.toLowerCase()] = request.headers[header];
    }
  });
  request.headers = headers;

  var data = '';
  if (request.data) {
    if (typeof Blob !== 'undefined' && request.data instanceof Blob) {
      data = request.data;
    } else if (request.headers && (String(request.headers['content-type']).match(/^application\/json/) || String(request.headers['content-type']) === 'application/vnd.layer-patch+json')) {
      data = typeof request.data === 'string' ? request.data : JSON.stringify(request.data);
    } else if (request.data && _typeof(request.data) === 'object') {
      Object.keys(request.data).forEach(function (name) {
        if (data) data += '&';
        data += name + '=' + request.data[name];
      });
    } else {
      data = request.data; // Some form of raw string/data
    }
  }
  if (data) {
    if (method === 'GET') {
      request.url += '?' + data;
    }
  }

  req.open(method, request.url, true);
  if (request.timeout) req.timeout = request.timeout;
  if (request.withCredentials) req.withCredentials = true;
  if (request.responseType) req.responseType = request.responseType;

  if (request.headers) {
    Object.keys(request.headers).forEach(function (headerName) {
      return req.setRequestHeader(headerName, request.headers[headerName]);
    });
  }

  try {
    if (method === 'GET') {
      req.send();
    } else {
      req.send(data);
    }
  } catch (e) {
    // do nothing
  }
};

var listeners = [];
module.exports.addConnectionListener = function (func) {
  return listeners.push(func);
};

module.exports.trigger = function (evt) {
  listeners.forEach(function (func) {
    func(evt);
  });
};

},{"xhr2":3}]},{},[1])(1)
});