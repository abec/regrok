
var fs = require('fs'),
    lockfile = require('lockfile'),
    os = require('os'),
    path = require('path');

var _ = require('underscore'),
    Promise = require('bluebird'),
    Reflux = require('reflux'),
    Level = require('level'),
    LevelPromisify = require('level-promisify');

var Repository = require('../../repositories');

var Config = require('../../config'),
    Security = require('../../security'),
    SettingsStore = require('../settings.js');

var LAST_ID_KEY = "LAST_ID",
    PASSWORD_CHECK_KEY = "PASSWORD_CHECK",
    PASSWORD_CHECK_VALUE = "PASSWORD_CHECK",
    LOCKFILE_PATH = path.join(os.tmpdir(), "fossa-level-store.lock");

var lock = Promise.promisify(lockfile.lock),
    unlock = Promise.promisify(lockfile.unlock);

var REPOSITORY = null;

var EntriesActions = Reflux.createActions({
  "add": {},
  "load": {children: ["completed","failed"]},
  "login": {children: ["completed","failed"]},
  "logout": {},
  "register": {children: ["completed","failed"]},
  "remove": {},
  "save": {},
});

EntriesActions.load.listen(function(options) {
  REPOSITORY = new Repository(options);
  REPOSITORY.initialize()
  .then(this.completed)
  .catch(this.failed);
});

EntriesActions.login.listen(function(username, password) {
  return REPOSITORY.login(username, password)
  .then(this.completed)
  .catch(this.failed);
});

EntriesActions.register.listen(function(username, password) {
  return REPOSITORY.register(username, password)
  .then(this.completed)
  .catch(this.failed);
});

module.exports = EntriesActions;
