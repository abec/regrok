
var Bootstrap = require('react-bootstrap'),
    History = require('react-router').History,
    Link = require('react-router').Link,
    React = require('react'),
    Reflux = require('reflux');

var actions = require('../actions'),
    store = require('../stores');

module.exports = React.createClass({
  mixins: [History, Reflux.listenTo(store, "onUpdate")],
  getInitialState: function() {
    return {
      entries: []
    };
  },
  componentDidMount: function() {
    actions.load();
  },
  onUpdate: function(data) {
    if (!data.ready) return this.history.pushState(null, "/login");
    this.setState({
      entries: data.entries
    });
  },
  render: function() {
    return (
      <div>
        <Bootstrap.Navbar>
          <Bootstrap.Nav>
            <li>
              <Link to={"/entries"} {...this.props}>
                <Bootstrap.Glyphicon glyph="list" />
              </Link>
            </li>
          </Bootstrap.Nav>
        </Bootstrap.Navbar>
        <div className="container">
          {React.cloneElement(this.props.children, {entries: this.state.entries})}
        </div>
      </div>
    );
  }
});
