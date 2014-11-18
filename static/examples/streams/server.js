var http = require('http')
  , through = require('through');

http.createServer(function(req, res) {
  if (req.method === 'POST') {
    req.pipe(through(function(buf) {
      this.queue('MESSAGE RECEIVED: ' + buf + '\n');
    })).pipe(res);
  }
}).listen(5000);

console.log('waiting for messages on 5000');

