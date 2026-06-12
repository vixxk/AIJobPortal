const EventEmitter = require('events');
const sseEmitter = new EventEmitter();
sseEmitter.setMaxListeners(5000);
module.exports = sseEmitter;
