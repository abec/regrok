
var _ = require('underscore'),
    Bootstrap = require('react-bootstrap'),
    React = require('react');

var Footer = React.createClass({
  propTypes: {
    "content": React.PropTypes.string
  },
  getInitialState: function() {
    return {
      content: null
    };
  },
  getDefaultProps: function() {
    return {};
  },
  render: function() {
    return (
      <div className="bigtext-footer" {...(_.omit(this.props, "children", "content"))}>
        {this.props.children}
      </div>
    );
  }
});

module.exports = Footer;
