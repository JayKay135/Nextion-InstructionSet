const Nextion = require('./nextion');
const nextion = new Nextion.init('/dev/ttyS0', 9600);

nextion.on('connected', function() {
    console.log("display connection established");

    nextion.write.setPage(0);
    nextion.write.drawCircleFilled(100, 100, 50, Nextion.color.hex('#1dde47'));
    nextion.write.setText('t0', 'Yayyyyy');
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

// the connection to the nextion display was closed
nextion.on('close', function() {
    console.log('The connection to the nextion display was closed');
});