var path = require('path')
  , Watcher = require('yaw')
  , watcher = new Watcher()
  , file = process.argv[2]
    ? path.resolve(process.argv[2])
    : null;

if (file) {
  watcher.watch(file);
  console.log('watching for changes in: '
    + path.basename(file));
}

watcher.on('change', function(filepath, stats) {
  console.log('  change detected in: '
    + path.basename(filepath));
});

watcher.on('error', function(err) {
  console.log('error:' + err.message);
});