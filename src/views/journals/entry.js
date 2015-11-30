
var _ = require('underscore'),
    History = require('react-router').History,
    Markdown = require('react-markdown'),
    Panel = require('react-bootstrap').Panel,
    React = require('react');

var actions = require('../../actions/entries.js'),
    Store = require('../../stores/repositories');

module.exports = React.createClass({
  mixins: [History],
  getInitialState: function() {
    return {
      "entry": null
    };
  },
  componentDidMount: function() {
    var search_id = this.props.params.id;
    var entry = _.filter(this.props.entries, function(entry) {
      return entry.id == search_id;
    });
    if (entry.length == 0) {
      this.history.pushState(null, "/entries");
    } else {
      this.setState({
        "entry": entry[0]
      });
    }
  },
  render: function() {
    var entry = this.state.entry;
    if (entry) {
      if (entry.isMarkdownEnabled) {
        var name = (<Markdown source={entry.name} containerTagName="span"/>);
        return (
          <Panel header={name}>
            <Markdown source={entry.data} containerTagName="span"/>
          </Panel>
        );
      } else {
        return (
          <Panel header={entry.name}>{entry.data}</Panel>
        );
      }
    } else {
      return (
        <Panel />
      );
    }
  }
});
