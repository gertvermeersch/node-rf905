var Nrf905 = require('./nrf905.js');

var radio = new Nrf905();

radio.init();
radio.setAddress([0x66, 0x66, 0x66, 0x66]);
console.log(radio.readConfig());

radio.attachReceivedCallback(function(err, payload) {
  console.log(payload);
});

radio.startReceiveMode();

radio.sendPacket([0x77, 0x77, 0x77, 0x77], "abcdefABCDEF");
