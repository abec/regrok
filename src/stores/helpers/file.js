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
    var self = this,
        initial = Promise.resolve([self.location, contents]),
        chain = applyMiddleware(initial, self.middleware.save);
    return chain.spread(function(location, contents) {
      return Promise.join(
        Promise.promisify(fs.writeFile)(location, contents),
        Promise.promisify(fs.truncate)(location, contents.length)
      ).then(function() {
        return [location, contents];
      });
    });
  },
  load: function() {
    var location = this.location,
        chain = Promise.promisify(fs.readFile)(location).then(function(contents) {
          return Promise.resolve([location, contents]);
        });

    return applyMiddleware(chain, this.middleware.load);
  }
});

module.exports = FileUtility;
