var Events = require('events');
var SerialPort = require('serialport');

'use strict';

/**
 * Nextion class that enables a communication between the node js module and a nextion display
 */
class Nextion extends Events {
    constructor(port, baudrate) {
        super();

        if (!port || !baudrate) {
            throw "You must provide a port and baudrate for the uart connection";
        }

        this.port = port;
        this.baudrate = baudrate;
        this.serialPort = new SerialPort(port, {
            baudRate: baudrate
        });
        this.write = new Write(this.serialPort);

        this.page = 0;

        this.receiving = false;
        this.data;
        this.endBytes;

        this.init();
    }

    // initializes the nextion display connection
    init() {
        this.serialPort.on('open', res => {
            console.log('Port connection opened on ' + this.port + ' @' + this.baudrate + ' bds');

            this.emit('connected');
        });
    
        this.serialPort.on('data', byte => {
            var data = byte.toString('hex').match(/.{1,2}/g).toString();

            if (!this.receiving) {
                this.receiving = true;
                this.data = [];
                this.endBytes = 0;
            }

            for (let i = 0; i < (data.length + 1) / 3; i++) {
                let subData = data.substring(3 * i, 3 * i + 2);                  

                (subData == 'ff') ? this.endBytes++ : this.endBytes = 0;

                this.data.push(subData);

                // complete data set arrived
                if (this.endBytes == 3) {
                    this.receiving = false;

                    // remove the the 3 ending ff
                    this.data = this.data.splice(0, this.data.length - 3)
                    this.emit('receivedData', this.data);

                    // check different event calls from the display
                    switch (this.data[0]) {
                        case '65':
                            // touch event
                            let page = parseInt(Number("0x" + this.data.splice(1,1)), 10);
                            let id = parseInt(Number("0x" + this.data.splice(1,1)), 10);
                            let state = parseInt(Number("0x" + this.data.splice(1,1)), 10);
                            this.emit('touchEvent', { page: page, id: id, state: state});
                                
                            break;
                        case '66':
                            // page loaded
                            this.page = parseInt(Number("0x" + this.data.splice(1,1)), 10);
                            this.emit('pageChanged', this.page);
                            break;
                    }
                }                
            }
        });

        this.serialPort.on('error', function(error) {
            this.emit('error', error);
        });
    
        this.serialPort.on('close', function() {
            this.emit('close');
        });
    }
}

/**
 * Write class that handles every writing command
 */
class Write {
    constructor (serialPort) {
        this.serialPort = serialPort;
    }

    /**
     * Sends an uart command to the nextion display
     * @param {string} cmd command
     */
    uart(cmd) {
        this.writeUart(cmd);
    }

    /**
     * Forces the display to send the current page id
     * It is recommended to add the sendme command for every screen in the onload function
     * To receive the current page -> subscribe to the pageChanged event
     */
    getPage() {
        this.writeUart('sendme');
    }

    /**
     * Change to the corresponding page
     * @param {number} num page number
     */
    setPage(num) {
        this.writeUart('page '+num);
    }

    /**
     * Sets the text of a text field
     * @param {string} cmp component reference 
     * @param {string} text text
     */
    setText(cmp, text) {
        this.writeUart(cmp+'.txt="'+text+'"');
    }

    /**
     * Sets the visibility of an element
     * @param {string} cmp component reference
     * @param {boolean} state active/ deactive
     */
    setVis (cmp, state) {
        this.writeUart('vis '+cmp+','+(state ? "1":"0"));
    }

    /**
     * Draws the outline of a circle
     * @param {number} x x pos
     * @param {number} y y pos
     * @param {number} r radius
     * @param {string} color color -> use the color enum
     */
    drawCircle(x, y, r, color) {
        this.writeUart('cir '+x+','+y+','+r+','+color);
    }

    /**
     * Draws a filled circle to the {x} and {y} koordinate
     * @param {number} x x pos
     * @param {number} y y pos
     * @param {number} r radius
     * @param {string} color color -> use the color enum
     */
    drawCircleFilled(x, y, r, color) {
        this.writeUart('cirs '+x+','+y+','+r+','+color);
    }

    /**
     * Sets the background color of components that have adjustable background colors
     * @param {*} cmp component reference
     * @param {*} color color -> use the color enum
     */
    setBackgroundColor (cmp, color) {
        this.writeUart(cmp + ".bco=" + color);
        this.writeUart("ref " + cmp);
    }

    /**
     * Clicks the button with the corresponding component reference
     * @param {string} cmp button reference
     */
    clickBtn(cmp) {
        this.writeUart('click '+cmp+',1');
        this.writeUart('click '+cmp+',0');
    }

    /* actual sending functions */
    writeUart(cmd) {
        this.serialPort.write(this.hex(cmd));
    }
    
    hex(str) {
        var arr = [];
        for (var i = 0, l = str.length; i < l; i ++) {
            var ascii = str.charCodeAt(i);
            arr.push(ascii);
        }
        arr.push(255);
        arr.push(255);
        arr.push(255);
        
        return Buffer.from(arr);
    }
}

/**
 * Color enumeration
 * @enum {string}
 */
 var color = {
    black: "BLACK",
    blue: "BLUE",
    brown: "BROWN",
    green: "GREEN",
    yellow: "YELLOW",
    red: "RED",
    gray: "GRAY",
    white: "WHITE",
    rgb: rgb,
    hex: hex
}

/**
 * Transforms rgb input to 565 decimal color value
 * @param {number} r 
 * @param {number} g 
 * @param {number} b 
 * @returns 
 */
function rgb(r, g, b) {
    return (((r & 0b11111000)<<8) + ((g & 0b11111100)<<3)+(b>>3));
}

/**
 * Transforms hex input to 565 decimal color value
 * @param {string} hex 
 * @returns 
 */
function hex(hex) {
    var bigint = parseInt(hex.substr(1), 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;

    return rgb(r, g, b);
}

//module.exports = Nextion;
module.exports = {
    init: Nextion,
    color: color
};