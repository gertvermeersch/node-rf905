var rpio = require('rpio');
var sleep = require('sleep');

/*
  using GPIO pin numbering of RPi 2 model B
  CSN - 8
  DR - 4
  AM - 22
  CD - 27
  PWR - 17
  CE - 18
  TXEN - 14
*/

/** nrf905 instruction set */
var WC = 0x00;
var RC = 0x10;
var WTP = 0x20;
var RTP = 0x21;
var WTA = 0x22;
var RTA = 0x23;
var RRP = 0x24;

var CSN = 8;
var DR = 4;
var AM = 22;
var CD = 27;
var PWR = 17;
var CE = 18;
var TXEN = 14;

var Nrf905 = function(options) {

  this.handlers = [];
};

Nrf905.prototype.init = function() {
    //init using GPIO pin numbers
    rpio.init({
        gpiomem: false,
        mapping: 'gpio'
    });

    rpio.spiBegin();
    rpio.spiChipSelect(0); //use CE0 as CE pin (active low)
    rpio.spiSetClockDivider(28); //approx. 9.25 Mhz, just below 10Mhz
    rpio.spiSetDataMode(0);

    rpio.open(PWR, rpio.OUTPUT);
    rpio.open(CSN, rpio.OUTPUT);
    rpio.open(TXEN, rpio.OUTPUT);
    rpio.open(CE, rpio.OUTPUT);
    var configArray = [0xCE, 0x0D, 0x44, 0x20, 0x20, 0x00, 0x00, 0x00, 0x00, 0x58];

    if (this.address === undefined)  {
      this.address = [0x00, 0x00, 0x00, 0x00];
    } else {
      configArray[5] = this.address[0];
      configArray[6] = this.address[1];
      configArray[7] = this.address[2];
      configArray[8] = this.address[3];
    }

    this.writeConfig(0, configArray);

};

Nrf905.prototype.writeConfig = function(startByte, configArray) {
  rpio.write(PWR, 0);
  rpio.write(CSN, 1);

  //write config buffer
  var cmd = new Buffer([WC || (0x0F && startByte)]);
  var payloadBuffer = new Buffer(configArray);
  rpio.write(CSN, 0);
  rpio.spiWrite(cmd, 1);
  rpio.spiWrite(payloadBuffer, payloadBuffer.length);
  rpio.write(CSN, 1);
};

Nrf905.prototype.readConfig = function() {
  rpio.write(CSN, 0);
  rpio.spiWrite(new Buffer([RC]), 1);
  var tx = new Buffer([0x00]);
  var rx = new Buffer(1);
  var payload = "";
  for (var i = 0; i < 10; i++) {
      rpio.spiTransfer(tx, rx, 1);
      payload = payload + rx.readUInt8(0).toString(16) + " ";
  }
  rpio.write(CSN, 1);
  return payload;
};

Nrf905.prototype.setAddress = function(address) {
  this.address = address.slice(0, 4);
  var addressBuf = new Buffer(this.address);
  this.writeConfig(5, addressBuf);
};

Nrf905.prototype.startReceiveMode = function() {
  rpio.write(TXEN, 0);
  rpio.write(CE, 1);
  rpio.poll(DR, function() {
    this.receivePacket();
  }, rpio.POLL_HIGH);
};

Nrf905.prototype.stopReceiveMode = function() {
  rpio.poll(DR, null);
};

Nrf905.prototype.receivePacket = function() {
  if (rpio.read(AM) === 1) { //address match
    rpio.write(CE, 0);
    rpio.write(CSN,0);
    rpio.spiWrite(new Buffer([RRP]), 1);

    var tx = new Buffer([0x00]);
    var rx = new Buffer(1);
    var payload = "";
    for (var i = 0; i < 32; i++) {
        rpio.spiTransfer(tx, rx, 1);
        payload = payload + rx.readUInt8(0).toString();
    }
    rpio.write(CSN, 1);
    for(var j; i < this.handlers.length; j++) {
      this.handlers[j](null, payload);
    }
  }
};

Nrf905.prototype.sendPacket = function(address, payloadString) {
  var buffer = new Buffer(payloadString);
  console.log(buffer.toJSON());

  //set transmit mode
  rpio.write(CE, 0);
  rpio.write(TXEN, 1);

  //write packet data
  rpio.write(CSN, 0);
  rpio.spiWrite(new Buffer([WTP]), 1);
  rpio.spiWrite(buffer, buffer.length);
  rpio.write(CSN, 1);

  //write address
  rpio.write(CSN, 0);
  rpio.spiWrite(new Buffer([WTA]), 1);
  rpio.spiWrite(new Buffer(address), 4);
  rpio.write(CSN, 1);

  //pulse CE to enable sending
  rpio.write(CE, 1);
  sleep.usleep(1);
  rpio.write(CE, 0);

  rpio.write(TXEN, 1);
  rpio.write(CE, 1);
};

Nrf905.prototype.attachReceivedCallback = function(callback) {
  this.handlers.push(callback);
};

Nrf905.prototype.detachReceivedCallback = function(callback) {
  var index = this.handlers.indexOf(callback);
  if (index > -1) {
    this.handlers.splice(index, 1);
  }
};

Nrf905.prototype.powerUp = function() {
  rpio.write(PWR, 1);
  sleep.usleep(3); // 3 sec wake up time
};

Nrf905.prototype.powerDown = function() {
  rpio.write(PWR, 0);
};

module.exports = Nrf905;
