var http = require('http')
  , port = parseInt(process.argv[2]) || 5002;

function parseTime(time) {
  return {
    hour: time.getHours(),
    minute: time.getMinutes(),
    second: time.getSeconds()
  };
}

http.createServer(function(req, res) {
  if (/^\/api\/time/.test(req.url)) {
    var time = parseTime(new Date());
    res.writeHead(200, {'Content-Type': 'application/json' });
    res.end(JSON.stringify(time));
  } else {
    res.writeHead(404);
    res.end();
  }
}).listen(port);

console.log('time server started on ' + port);