var http = require('http')
	, fs = require('fs')
	, shoe = require('shoe')
	, shux = require('shux')()
	, muxDemux = require('mux-demux')
	, ecstatic = require('ecstatic')(__dirname)
	, clear = new Buffer([ 0x1b, 0x5b, 0x48, 0x1b, 0x5b, 0x32, 0x4a ]);

var server = http.createServer(ecstatic)
	.listen(8000);

var sock = shoe(function (stream) {
	stream.pipe(muxDemux(function (mstream) {
		mstream.pipe(shux.createShell(mstream.meta)).pipe(mstream);
	})).pipe(stream);
});
sock.install(server, '/sock');
