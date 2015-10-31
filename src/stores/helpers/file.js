var fs = require("fs");

var _ = require("underscore"),
    Promise = require("bluebird");

var DEFAULT_MIDDLEWARE = {
  save: [],
  load: []
};

var applyMiddleware = function(initial, middleware) {
  var chain = initial;
  _.each(middleware, function(middleware) {
    chain = chain.spread(middleware);
  });
  return chain;
};

var FileUtility = function(location, middleware) {
  this.location = location;
  this.middleware = _.extend({}, DEFAULT_MIDDLEWARE, middleware);
};

_.extend(FileUtility.prototype, {
  save: function(contents) {
    var chain = applyMiddleware(Promise.resolve([this.location, contents]), this.middleware.save);
    return chain.spread(function(location, contents) {
      return new Promise(function(resolve, reject) {
        fs.writeFile(location, contents, function(err) {
          if (err) return reject(err);
          fs.truncateSync(location, contents.length, function(err) {
            if (err) return reject(err);
            return resolve([location, contents]);
          });
        });
      });
    });
  },
  load: function() {
    var location = this.location,
        initial = new Promise(function(resolve, reject) {
          fs.readFile(location, function(err, contents) {
            if (err) return reject(err);
            return resolve([location, contents]);
          });
        });

    return applyMiddleware(initial, this.middleware.load);
  }
});

module.exports = FileUtility;
