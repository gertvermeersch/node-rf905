# nrf905
Node.js driver for RF905 module

The NRF905 isn't a popular module for IoT applications: It's not the most efficient module
and there's a lot more code to find for other modules like the NRF24L01. But the NRF905 offers superior range and
as it happens I have quite a few of them lying around.

# Usage

## Include in code
`var Nrf905 = require('./nrf905.js');`
`var radio = new Nrf905();`

## Initialize module
`radio.init();`

## Set the receiver address of the module
`radio.setAddress([0x66, 0x66, 0x66, 0x66]);`

Expects an array of 4 bytes

## Attach a callback when the module receives data
`radio.attachReceivedCallback(function(err, payload) {
  console.log(payload);
});`

detach with `detachReceivedCallback(function)`

## Start receiving
`radio.startReceiveMode();`

## Stop receiving
`radio.stopReceiveMode();`

## Enable or disable sleep (doesn't receive when in sleep mode)
`radio.powerUp();
radio.powerDown();`

Powering up takes 3 ms

## Send a packet (re-enables receive mode after sending)
`radio.sendPacket([0x77, 0x77, 0x77, 0x77], "abcdefABCDEF");`

First parameter is an array of 4 bytes of the destination address, second parameter the payload (up to 32 bytes, unchecked for now)

## Write your own config
`radio.writeConfig([offset], [configarray])`

Please refer to the NRF905 datasheet to get more information on how to configure this module.

## Read config
`radio.readConfig()`

Returns a string with the config array represented as HEX number, useful for debugging and testing.
