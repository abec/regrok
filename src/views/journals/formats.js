
var Markdown = require('react-markdown'),
    Moment = require('moment'),
    React = require('react');

var DateTimeTransformation = React.createClass({
  render: function() {
    return <span>{Moment(this.props.value).format("MMMM Do, YYYY hh:mm A")}</span>;
  }
});

var MarkdownTransformation = React.createClass({
  render: function() {
    if (this.props.data.isMarkdownEnabled) {
      return <Markdown source={this.props.value} containerTagName="span"/>;
    } else {
      return <span>{this.props.value}</span>;
    }
  }
});

module.exports = {
  DateTimeTransformation: DateTimeTransformation,
  MarkdownTransformation: MarkdownTransformation
}
