# Nextion-InstructionSet
This library is based on the library by [gregory-yet](https://github.com/gregory-yet/Nextion).
It sends and receives data via a UART connection with a Nextion display.

# Installation
```npm
npm i nextion-instructionset
```

## Dependencies
[SerialPort](https://www.npmjs.com/package/serialport)

# Getting started
```javascript
const Nextion = require(nextion-instructionset);
const port = '/dev/ttyS0';
const baudrate = 9600;
const nextion = new Nextion.init(port, baudrate);

nextion.on('connected', function() {
    console.log("display connection established");
});
```

# Send data
Send data by using the write class

### uart
Sends an uart command to the nextion display
Take a look at the official [nextion instruction set](https://nextion.tech/instruction-set/) to see every supported command
```javascript
/**
 * @param {string} command
 */
nextion.write.writeUart('page 0');
```
### setPage
Changes the page to the corresponding page id
```javascript
/**
 * @param {number} page number
 */
nextion.write.setPage(0);
```
### setText
Sets the text of a text field
```javascript
/**
 * @param {string} component reference 
 * @param {string} text
 */
nextion.write.setText('t0', "Test");
```

### setVis
Sets the visibility of a component
```javascript
/**
 * @param {string} component reference
 * @param {boolean} active/ deactive
 */
nextion.write.setVis('t0', false);
```

### drawCircle
Draws the outline of a circle
```javascript
/**
 * @param {number} x pos
 * @param {number} y pos
 * @param {number} radius
 * @param {string} color -> use the color enum
 */
nextion.write.drawCircle(100, 100, 50, Nextion.color.red);
```

### drawCircleFilled
Draws a filled circle
```javascript
/**
 * @param {number} x pos
 * @param {number} y pos
 * @param {number} radius
 * @param {string} color -> use the color enum
 */
nextion.write.drawCircleFilled(100, 100, 50, Nextion.color.red);
```

### setBackgroundColor
Sets the background color of a component that has an adjustable background color
```javascript
/**
 * @param {*} component reference
 * @param {*} color -> use the color enum
 */
 nextion.write.setBackgroundColor('t0', Nextion.color.red);
```

### clickBtn
Clicks the button with the corresponding component reference
```javascript
/**
 * @param {string} button reference
 */
nextion.write.clickBtn('b0');
```

## Colors
Use the color enum with either the preset color attributes or by using the rgb/ hex function
```javascript
Nextion.color.black;
Nextion.color.blue;
Nextion.color.brown;
Nextion.color.green;
Nextion.color.yellow;
Nextion.color.red;
Nextion.color.gray;
Nextion.color.white;

/**
 * @param {number} r 
 * @param {number} g 
 * @param {number} b 
 */
Nextion.color.rgb(29, 161, 222);

/**
 * @param {string} hex
 */
Nextion.color.hex('#1da1de');
```

# Events
Subscribe to events to know when a something on the display was changed
```javascript
// the connection to the nextion display was established
nextion.on('connected', function() {
});

// the connection to the nextion display was closed
nextion.on('close', function() {
});

// the display user touched the display
nextion.on('touchEvent', event => {
    console.log("touchEvent occured on page: " + event.page + " by component id: " + event.id + " with the state: " + event.state);
});

// the page on the display changed
nextion.on('pageChanged', page => {
    console.log("page changed: " + page);
});

// the display send data
nextion.on('receivedData', data => {
    console.log("receivedData: " + data)
});

// an error occured with the uart connection
nextion.on('error', error => {
    console.log('An error occured with the nextion connection: ' + error);
});

```
