var fs = require('fs');

var path = require('path'),
    nconf = require('nconf'),
    ipc = require('ipc');
require('nconf-level')(nconf);

var DEFAULT_ROOT_PATH = ipc.sendSync('appdir');

var DEFAULT_CONFIG = {
  "root_path": DEFAULT_ROOT_PATH,
  "repository": {
    "leveldb": {
      "path": path.join(DEFAULT_ROOT_PATH, "public", "data.leveldb")
    },
    "security": {
      "iv_size": 16,
      "cipher": "aes256",
      "rounds_factor": 10,
      "enabled": true
    },
    "use": "leveldb"
  }
};

nconf.argv()
     .env()
     .use("level", { path: path.join(DEFAULT_ROOT_PATH, "public", "settings.leveldb") })
     .file(process.env.CONFIG_FILE || path.join(DEFAULT_ROOT_PATH, "config.ini"))
     .defaults(DEFAULT_CONFIG);

module.exports = nconf;
