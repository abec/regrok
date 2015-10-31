
var History = require('react-router').History,
    Bootstrap = require('react-bootstrap'),
    React = require('react/addons'),
    Reflux = require('reflux');

var Actions = require('../../actions'),
    Store = require('../../stores');

module.exports = React.createClass({
  mixins: [History, Reflux.listenTo(Store, "onStoreUpdate")],
  getInitialState: function() {
    return {
      "password": null,
      "pipeline_state": 0
    };
  },

  // Order of execution:
  // 1. Reset
  // 2. Set password
  // 3. Save a new DB with that password
  // 4. Redirect to login page.
  onStoreUpdate: function(data) {
    switch(this.state.pipeline_state) {
      case 1:
        this.setState({pipeline_state: 2});
        Actions.save();
        break;
      case 2:
        this.setState({pipeline_state: 0});
        this.history.pushState(null, "/login");
        break;
      default:
        this.setState({pipeline_state: 0});
        break;
    }
  },

  register: function() {
    this.setState({pipeline_state: 1});
    Actions.setPassword(this.state.password);
    Actions.reset();
  },
  cancel: function() {
    this.history.pushState(null, "/login");
  },
  onPasswordChange: function(e) {
    this.setState({"password": e.target.value});
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
          <Bootstrap.Button onClick={this.register}>Submit</Bootstrap.Button>
          <Bootstrap.Button onClick={this.cancel}>Cancel</Bootstrap.Button>
        </form>
      </div>
    );
  }
});
