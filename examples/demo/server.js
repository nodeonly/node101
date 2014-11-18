var http = require('http')
  , fs = require('fs')
  , dust = require('dustjs-linkedin')
  , through = require('through')
  , request = require('request')

  , visitor = 0
  , port = parseInt(process.argv[2]) || 5001
  , url = 'http://localhost:' + (port + 1) + '/api/time'
  , template = fs.readFileSync('template.dust', 'utf8');

http.createServer(function(req, res) {
  if (/^\/$/.test(req.url)) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    request
      .get(url)
      .pipe(through(function (buf) {
        var self = this
          , data = JSON.parse(buf.toString());
        data.visitor = ++visitor;
        dust.renderSource(template, data)
          .pipe(res)
          .on('error', handleError);
      }))
      .on('error', handleError);
  }
}).listen(port);

function handleError(err) {
  console.log(err.message);
}

console.log('application started on ' + port);