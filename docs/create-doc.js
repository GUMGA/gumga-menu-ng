var fs = require('fs');
var path = require('path');
var versions = require('./versions.json');

var copyRecursiveSync = function(src, dest) {
  var exists = fs.existsSync(src);
  var stats = exists && fs.statSync(src);
  var isDirectory = exists && stats.isDirectory();
  if (exists && isDirectory) {
    fs.mkdirSync(dest);
    fs.readdirSync(src).forEach(function(childItemName) {
      copyRecursiveSync(path.join(src, childItemName),
                        path.join(dest, childItemName));
    });
  } else {
    fs.linkSync(src, dest);
  }
};

copyRecursiveSync(`./docs/${versions[versions.length -2]}`, `./docs/${versions[versions.length -1]}`);
