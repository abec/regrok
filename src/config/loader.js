var fs = require('fs');

var path = require('path'),
    nconf = require('nconf'),
    ipc = require('ipc');

var DEFAULT_ROOT_PATH = ipc.sendSync('appdir');

var DEFAULT_CONFIG = {
  "root_path": DEFAULT_ROOT_PATH,
  "repository": {
    "file": {
      "path": path.join(DEFAULT_ROOT_PATH, "public", "data.json")
    },
    "security": {
      "iv_size": 16,
      "cipher": "aes256",
      "rounds_factor": 10,
      "enabled": true
    },
    "use": "file"
  }
};

nconf.argv()
     .env()
     .file(process.env.CONFIG_FILE || path.join(DEFAULT_ROOT_PATH, "config.ini"))
     .defaults(DEFAULT_CONFIG);

module.exports = nconf;
