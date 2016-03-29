
var _ = require('underscore'),
    Promise = require('bluebird'),
    Reflux = require('reflux'),
    Level = require('level'),
    SubLevel = require('level-sublevel'),
    LevelPromisify = require('level-promisify');

var Security = require('../../security');

var PASSWORD_CHECK_KEY = "PASSWORD_CHECK",
    PASSWORD_CHECK_VALUE = "PASSWORD_CHECK",
    ENTRIES_KEY = "ENTRIES",
    ID_KEY = "ID",
    CREATED_KEY = "CREATED";

/**
 * Each user will have their own sublevel:
 * - username > ENTRIES > *
 * - username > PASSWORD_CHECK
 * Maintain 1 index: created time lookup:
 * - username > CREATED_INDEX
 */
var LevelDBRepository = function(options) {
  this.options = _.defaults(options, {
    location: null
  });
  this.__db = null;
  this.__subdb = null;
  this.__usersubdb = null;
  this.__entriessubdb = null;
  this.__username = null;
  this.__key = null;

  this.__checkkey = function(username) {
    return username + ":" + PASSWORD_CHECK_KEY;
  };

  this.__entrykeys = function(username, entry) {
    var entrykeys = {
      id: username + ":" + ENTRIES_KEY + ":" + ID_KEY,
      created: username + ":" + ENTRIES_KEY + ":" + CREATED_KEY
    };
    if (entry.id) {
      entrykeys.id += ":" + entry.id;
    }
    if (entry.created) {
      entrykeys.created += ":" + entry.created;
    }
    return entrykeys;
  };
};

_.extend(LevelDBRepository.prototype, {
  initialize: function() {
    if (!this.options.location) {
      return Promise.reject(new Error("`location` has not been provided"));
    }

    this.__db = Level(this.options.location);
    this.__subdb = SubLevel(this.__db);

    return Promise.resolve(this);
  },
  logout: function() {
    this.__username = null;
    this.__key = null;
  },
  login: function(username, password) {
    if (!this.__dbpromise) throw new Error("Database has not been loaded");
    if (!password) password = "";

    var self = this,
        checkkey = this.__checkkey(username),
        key = null;

    return self.__dbpromise.get(checkkey)
    .then(function(value) {
      return Promise.join(
        value,
        self.__dbpromise.createKey(password)
      );
    })
    .spread(function(value, key) {
      return Promise.join(
        value,
        key,
        Security.decrypt(value, key)
      );
    })
    .spread(function(value, key, contents) {
      if (contents == PASSWORD_CHECK_VALUE) {
        self.__key = key;
        self.__username = username;
        this.__usersubdb = this.__subdb.sublevel(this.__username);
        this.__entriessubdb = this.__usersubdb.sublevel(ENTRIES_KEY);
        return key;
      }
    });
  },
  register: function(username, password) {
    if (!this.__dbpromise) throw new Error("Database has not been loaded");
    if (!password) password = "";

    var self = this,
        checkkey = this.__checkkey(username),
        key = null;

    return self.__dbpromise.get(checkkey)
    .then(function(value) {
      return Promise.reject(new Error("User `" + username + "` already exists."));
    })
    .catch(function() {
      return self.__dbpromise.createKey(password);
    })
    .then(function(key) {
      return Promise.join(
        PASSWORD_CHECK_VALUE,
        key,
        Security.encrypt(PASSWORD_CHECK_VALUE, key)
      );
    })
    .spread(function(value, key, contents) {
      return self.__dbpromise.set(checkkey, contents);
    })
    .then(function() {
      self.__key = key;
      self.__username = username;
    });
  },
  add: function(entry) {
    var dbpromise = this.__dbpromise,
        entrykeys = this.__entrykeys(this.__username, entry),
        entryjson = JSON.stringify(entry);

    return Promise.join(
      dbpromise.set(entrykeys.id, entryjson),
      new Promise(function(resolve, reject) {
        var count = 0,
            exists = false;
        return dbpromise.createReadStream({
          gte: entrykeys.created,
          lt: entrykeys.created + ":9999999"
        })
        .on('data', function(data) {
          if (data.key.indexOf(entrykey.created) === 0) {
            count++;
          }
          exists = exists || data.value == entry.id;
        })
        .on('error', function(err) {
          return reject(err);
        })
        .on('end', function() {
          if (exists) {
            return resolve();
          } else {
            return dbpromise
            .set(entrykey + ":" + count, JSON.stringify(entry))
            .then(resolve)
            .catch(reject);
          }
        });
      })
    );
  },
  list: function() {
    var dbpromise = this.__dbpromise,
        entrykeys = this.__entrykeys(this.__username);
    return new Promise(function(resolve, reject) {
      var entries = [];
      return dbpromise.createReadStream({
        gte: entrykeys.created
      })
      .on('data', function(data) {
        if (data.key.indexOf(entrykey.created) === 0) {
          entries.push(data);
        }
      })
      .on('error', function(err) {
        return reject(err);
      })
      .on('end', function() {
        return resolve(data);
      });
    });
  }
});

module.exports = LevelDBStore;
