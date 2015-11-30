
var History = require('react-router').History,
    Bootstrap = require('react-bootstrap'),
    React = require('react'),
    Reflux = require('reflux'),
    _ = require('underscore');

var Actions = require('../../actions/settings.js'),
    Store = require('../../stores/settings.js'),
    Config = require('../../config');

module.exports = React.createClass({
  mixins: [History, Reflux.listenTo(Store, "onUpdate")],
  getInitialState: function() {
    return {
      "repository-leveldb-path": Config.get("repository:leveldb:path")
    };
  },
  onUpdate: function(data) {
    if (!data.result) console.error("We had a failure for some reason.");

    this.history.pushState(null, "/");
  },
  change: function(e) {
    var state = this.state;
    _.each(this.refs, function(ref, key) {
      state[key] = ref.getValue();
    });
    this.setState(state);
  },
  cancel: function() {
    var state = this.state;
    _.each(this.refs, function(ref, key) {
      state[key] = null;
    });
    this.history.pushState(null, "/");
  },
  commit: function() {
    Actions.update(
      "repository:leveldb:path",
      this.refs["repository-leveldb-path"].getValue());
  },
  render: function() {
    return (
      <div>
        <h1>Settings</h1>
        <form>
          <Bootstrap.Input
            ref="repository-leveldb-path"
            type="text"
            placeholder="Repository path"
            value={this.state["repository-leveldb-path"]}
            onChange={this.change} />
          <Bootstrap.Button onClick={this.commit}>Save</Bootstrap.Button>
          <Bootstrap.Button onClick={this.cancel}>Canel</Bootstrap.Button>
        </form>
      </div>
    );
  },

  toProperCase: function(text) {
    return text.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
  }
});
