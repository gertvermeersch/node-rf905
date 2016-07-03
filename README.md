# node-rf905
Node.js driver for RF905 module

The NRF905 isn't a popular module for IoT applications: It's not the most efficient module 
and there's a lot more code to find for other modules like the NRF24L01. But the NRF905 offers superior range and 
as it happens I have quite a few of them lying around.
I already have a lot of code for Arduino and now it's time I write a driver to connect the module direclty to a RPi (2 model B) using node.js

The final goal is to connect a network of NRF905 modules to the internet using a REST API.

Current status: 3/7/2016 - I can write and read the configuration register
