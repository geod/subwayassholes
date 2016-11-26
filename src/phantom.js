console.log('Hello, world!');

var page = require('webpage').create();

page.onError = function (msg, trace) {
    console.log(msg);
    trace.forEach(function(item) {
        console.log('  ', item.file, ':', item.line);
    });
};

page.onConsoleMessage = function(msg, lineNum, sourceId) {
  console.log('CONSOLE: ' + msg + ' (from line #' + lineNum + ' in "' + sourceId + '")');
};

page.onResourceRequested = function(requestData, networkRequest) {
  console.log('Request (#' + requestData.id + '): ' + JSON.stringify(requestData));
};

page.open('http://localhost:8000/index3game.html', function(status) {
  console.log("Status: " + status);
  if(status === "success") {
    window.setTimeout(function () {
            page.render('foo.png');
            phantom.exit();
        }, 1000); // Change timeout as required to allow sufficient time


  }
  phantom.exit();
});
//phantom.exit();
