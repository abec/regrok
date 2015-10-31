var fs = require('fs');

var path = require('path'),
    nconf = require('nconf');

var DEFAULT_CONFIG = {
  "repository": {
    "file": {
      "path": path.join(__dirname, "..", "..", "public", "data.json")
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
     .file(process.env.CONFIG_FILE || path.join(__dirname, "..", "..", "config.ini"))
     .defaults(DEFAULT_CONFIG);

module.exports = nconf;
