
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
  render: function() {
    return (
      <div>
        <h1>Create new journal</h1>
        <form>
          <Bootstrap.Input
            ref="password"
            type="password"
            placeholder="Enter name"
            onChange={this.onPasswordChange} />
          <Bootstrap.Button onClick={Actions.register.bind(this, this.state.password)}>Submit</Bootstrap.Button>
          <Bootstrap.Button onClick={this.history.pushState.bind(this.history, null, "/login")}>Cancel</Bootstrap.Button>
        </form>
      </div>
    );
  },

  onUpdate: function(data) {
    this.history.pushState(null, "/login");
  },
  onPasswordChange: function(e) {
    this.setState({"password": e.target.value});
  }
});
