var Nrf905 = require('./nrf905.js');

var radio = new Nrf905();

radio.init();
radio.setAddress([0x41, 0x41, 0x41, 0x41]);
//radio.setAddress([0x66, 0x66, 0x66, 0x66]);
console.log(radio.readConfig());

radio.attachReceivedCallback(function(err, payload) {
  console.log("received: " + payload);
});

radio.startReceiveMode();
 var i = 0;
// setInterval(function() {radio.sendPacket([0x66, 0x66, 0x66, 0x66], "AAAAthis is packet " + i++ + "            ");}, 5000);
