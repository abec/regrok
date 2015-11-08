
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
      "password": null,
      "type": "login"
    };
  },
  componentDidMount: function() {
    Actions.ready();
  },
  onUpdate: function(data) {
    if (data.ready) {
      this.history.pushState(null, "/");
    }
  },
  onPasswordChange: function(e) {
    this.setState({"password": e.target.value});
  },
  toggleType: function(e, eventKey) {
    this.setState({
      type: eventKey
    });
  },
  loginOrRegister: function(e) {
    if (e.type == "keyup") {
      // Enter event
      if (e.keyCode == 13) {
        Actions[this.state.type](this.state.password);
      }
    } else {
      Actions[this.state.type](this.state.password);
    }
    e.stopPropagation();
    e.preventDefault();
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
            onChange={this.onPasswordChange}
            onKeyUp={this.loginOrRegister}
            buttonAfter={
              <Bootstrap.SplitButton
                  key="type"
                  title={this.toProperCase(this.state.type)}
                  onSelect={this.toggleType}
                  onClick={this.loginOrRegister}
                  style={{
                    width: "103px"
                  }}>
                <Bootstrap.MenuItem eventKey="login">Login</Bootstrap.MenuItem>
                <Bootstrap.MenuItem eventKey="register">Register</Bootstrap.MenuItem>
              </Bootstrap.SplitButton>
            } />
        </form>
      </div>
    );
  },

  toProperCase: function(text) {
    return text.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
  }
});
