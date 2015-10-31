
var config = require('../config');

module.exports = require("./" + config.get("repository:use") + ".js");
