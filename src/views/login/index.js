
var History = require('react-router').History,
    Bootstrap = require('react-bootstrap'),
    React = require('react'),
    Reflux = require('reflux');

var Actions = require('../../actions/entries.js'),
    Store = require('../../stores/repositories');

module.exports = React.createClass({
  mixins: [History, Reflux.listenTo(Store, "onUpdate")],
  getInitialState: function() {
    return {
      "password": null,
      "type": "login",
      "error": null
    };
  },
  componentDidMount: function() {
    Actions.ready();
  },
  onUpdate: function(data) {
    if (data.ready) {
      this.history.pushState(null, "/");
    } else if (data.error) {
      this.setState({ error: data.error });
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
    switch(e.type) {
      case "keyup":
      // Enter event
      if (e.keyCode == 13) {
        Actions[this.state.type](this.state.password);
      }
      break;

      case "click":
      Actions[this.state.type](this.state.password);
      break;
    }
    e.stopPropagation();
    e.preventDefault();
  },
  render: function() {
    return (
      <div>
        <h1>Unlock</h1>
        <form>
          {(this.state.error != null) ? (<Bootstrap.Alert bsStyle="danger">{this.state.error.toString()}</Bootstrap.Alert>) : null}
          <Bootstrap.Input
            ref="password"
            type="password"
            placeholder="Enter name"
            onChange={this.onPasswordChange}
            onKeyUp={this.loginOrRegister}
            buttonAfter={
              <Bootstrap.SplitButton
                  id="type"
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
            }
            {...((this.state.error != null) ? {bsStyle: "error"} : null)} />
        </form>
      </div>
    );
  },

  toProperCase: function(text) {
    return text.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
  }
});
