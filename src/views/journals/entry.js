
var Markdown = require('react-markdown'),
    Panel = require('react-bootstrap').Panel,
    React = require('react/addons'),
    Reflux = require('reflux');

var actions = require('../../actions'),
    store = require('../../stores');

module.exports = React.createClass({
  mixins: [Reflux.listenTo(store, "onGetEntry")],
  getInitialState: function() {
    return {
      "entry": null
    };
  },
  componentDidMount: function() {
    actions.getEntry(this.props.params.id);
  },
  onGetEntry: function(data) {
    this.setState({
      "entry": data.entry
    });
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
