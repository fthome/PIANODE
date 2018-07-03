var SPI = require('pi-spi');

var device = '/dev/spidev0.0';
var spi;
var schedule;
var timeout;

function read(callback) {
    if (spi === undefined)
        return;
    spi.read(2, function (err, buffer) {
        if (err) throw err;
        var value = ((buffer[0] & 0b00011111) << 7) + (buffer[1] >>1);
        callback(value);
    });
}

function startPoll (callback) {
    schedule = setInterval(function () {
        read(callback);
    }, timeout);
}

var Mcp3201 = function (dev) {
    device = dev || device;
    spi = SPI.initialize(device);

    this.read = read;

    this.poll = function (duration, callback) {
        timeout = duration;
        startPoll(callback);
    };

    this.stop = function () {
        clearInterval(schedule);
    }

    this.close = function () {
        this.stop();
        spi.close();
    }
};

module.exports = Mcp3201;
