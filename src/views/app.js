
var _ = require('underscore'),
    Bootstrap = require('react-bootstrap'),
    History = require('react-router').History,
    Link = require('react-router').Link,
    React = require('react'),
    Reflux = require('reflux'),
    ClassNames = require('classnames');

var Actions = require('../actions/entries.js'),
    Store = require('../stores/repositories');

module.exports = React.createClass({
  mixins: [History, Reflux.listenTo(Store, "onUpdate")],
  getInitialState: function() {
    return {
      entries: [],
      ready: false
    };
  },
  componentDidMount: function() {
    Actions.ready();
  },
  componentDidUpdate: function() {
    if (!this.state.ready) {
      this.redirect();
    }

    return true;
  },
  onUpdate: function(data) {
    if (data.ready) {
      this.setState({
        entries: data.entries,
        ready: data.ready
      });
    } else {
      this.redirect();
      this.setState({
        ready: data.ready
      });
    }
  },
  render: function() {
    return (
      <div>
        {this.renderNavigation()}
        <div className="container">
          {React.cloneElement(this.props.children, {entries: this.state.entries})}
        </div>
      </div>
    );
  },

  renderNavigation: function() {
    var logout = (
          <li>
            <a onClick={Actions.logout}>
              <Bootstrap.Glyphicon glyph="log-out" />
            </a>
          </li>
        ),
        settings = (
          <li>
            <Link to={"/settings"} {...this.props}>
              <Bootstrap.Glyphicon glyph="cog" />
            </Link>
          </li>
        ),
        list = (
          <li className={ClassNames({
            "hide": this.props.params.pathname == "/entries"
          })}>
            <Link to={"/entries"} {...this.props}>
              <Bootstrap.Glyphicon glyph="list" />
            </Link>
          </li>
        ),
        create = (
          <li className={ClassNames({
            "hide": this.props.params.pathname == "/"
          })}>
            <Link to={"/"} {...this.props}>
              <Bootstrap.Glyphicon glyph="pencil" />
            </Link>
          </li>
        );
    return (
      <Bootstrap.Navbar>
        <Bootstrap.Nav right>
          {(this.state.ready) ? logout : null}
          {settings}
        </Bootstrap.Nav>
        <Bootstrap.Nav>
          {(this.state.ready && this.props.params.pathname != "/entries") ? list : null}
          {(this.state.ready && this.props.params.pathname != "/") ? create : null}
        </Bootstrap.Nav>
      </Bootstrap.Navbar>
    );
  },
  redirect: function() {
    if (_.indexOf(["/login", "/settings"], this.props.location.pathname) == -1) {
      this.history.pushState(null, "/login");
    }
  }
});
