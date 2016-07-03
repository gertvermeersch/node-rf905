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

var CSN = 8;
var DR = 4;
var AM = 22;
var CD = 27
var PWR = 17;
var CE = 18;
var TXEN = 14;

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
rpio.write(PWR, 0);
rpio.write(CSN,1);

//write config buffer
var cfg_buff = new Buffer([0x00,0xCE,0x0D,0x44,0x20,0x20,0x66,0x66,0x66,0x66,0x58]);
rpio.write(CSN,0);
rpio.spiWrite(cfg_buff, cfg_buff.length);
rpio.write(CSN,1);

sleep.usleep(10000);
//read config Buffer
rpio.write(CSN,0);
rpio.spiWrite(new Buffer([0x10]), 1);
var tx = new Buffer([0x00]);
var rx = new Buffer(1);

for(var i = 0; i < 10; i++) {
  rpio.spiTransfer(tx, rx, 1);
  console.log(rx.readInt8(0).toString(16));
}

rpio.write(CSN,1);
