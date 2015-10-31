
var History = require('react-router').History,
    Bootstrap = require('react-bootstrap'),
    React = require('react/addons'),
    Reflux = require('reflux');

var Actions = require('../../actions'),
    Store = require('../../stores');

module.exports = React.createClass({
  mixins: [History, Reflux.listenTo(Store, "onUpdate")],
  getInitialState: function() {
    return {
      "password": null
    };
  },
  componentDidMount: function() {
    Actions.isDatabaseReady();
  },
  onUpdate: function(data) {
    if (!data.database_ready){
      this.history.pushState(null, "/register");
    }
    if (data.ready) {
      this.history.pushState(null, "/");
    }
  },
  onPasswordChange: function(e) {
    this.setState({"password": e.target.value});
  },
  login: function() {
    Actions.setPassword(this.state.password);
    Actions.load();
  },
  anew: function() {
    this.history.pushState(null, "/register");
  },
  render: function() {
    return (
      <div>
        <h1>Unlock</h1>
        <form>
          <Bootstrap.Input
            ref="password"
            type="password"
            placeholder="Enter name"
            onChange={this.onPasswordChange} />
          <Bootstrap.Button onClick={this.login}>Submit</Bootstrap.Button>
          <Bootstrap.Button onClick={this.anew}>Start anew</Bootstrap.Button>
        </form>
      </div>
    );
  }
});
