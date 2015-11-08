
var _ = require('underscore'),
    Bootstrap = require('react-bootstrap'),
    React = require('react');

var BigText = React.createClass({
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
      <Bootstrap.Portal container={document.body}>
        <div className="bigtext">
          {this.props.children}
        </div>
      </Bootstrap.Portal>
    );
  }
});

BigText.Header = require('./header.js');
BigText.Footer = require('./footer.js');
BigText.Body = require('./body.js');

module.exports = BigText;
