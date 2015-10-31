
var History = require('react-router').History,
    Markdown = require('react-markdown'),
    Panel = require('react-bootstrap').Panel,
    Pick = require('object.pick'),
    React = require('react/addons'),
    Router = require('react-router').Router,
    Uuid = require('uuid4');

var actions = require('../../actions'),
    formats = require('./formats.js'),
    Griddy = require('../griddy');

module.exports = React.createClass({
  mixins: [History],
  render: function() {
    var self = this;

    return (
      <Griddy
        data={this.props.entries}
        order={["name", "ctime", "mtime"]}
        onEntryAdd={function(entry) {
          self.history.pushState(null, "/");
        }}
        onEntryDelete={function(entry) {
          actions.removeEntry(entry.id);
          actions.save();
        }}
        onEntryView={function(entry) {
          self.history.pushState(null, "/entries/" + entry.id);
        }}
        columnMetadata={
          {
            "ctime": {
              "header": "Created",
              "transformation": formats.DateTimeTransformation
            },
            "mtime": {
              "header": "Updated",
              "transformation": formats.DateTimeTransformation
            },
            "name": {
              "header": "Name",
              "transformation": formats.MarkdownTransformation
            }
          }
        }></Griddy>
    );
  }
});
