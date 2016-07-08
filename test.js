var Nrf905 = require('./nrf905.js');

var radio = new Nrf905();

radio.init();
radio.setAddress([0x41, 0x41, 0x41, 0x41]);
//radio.setAddress([0x66, 0x66, 0x66, 0x66]);
console.log(radio.readConfig());
var received = 0;

radio.attachReceivedCallback(function(err, payload) {
    console.log("received: " + payload);
    console.log("packet counter " + received++);
});

radio.startReceiveMode();
var i = 0;
setInterval(function() {
    radio.sendPacket([0x66, 0x66, 0x66, 0x66], "AAAAthis is packet " + i++ + "            ", function(err, result) {
        console.log(result);
    });
}, 5000);
