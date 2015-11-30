
var _ = require('underscore'),
    History = require('react-router').History,
    Markdown = require('react-markdown'),
    Panel = require('react-bootstrap').Panel,
    Pick = require('object.pick'),
    React = require('react'),
    Router = require('react-router').Router;

var actions = require('../../actions/entries.js'),
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
        onEntryDelete={function(entry) {
          for (var i = self.props.entries.length - 1; i >= 0; --i) {
            if (self.props.entries[i].id == entry.id) {
              actions.remove(self.props.entries[i]);
            }
          }
          actions.save();
        }}
        onEntryView={function(entry) {
          self.history.pushState(null, "/entries/" + entry.id);
        }}
        buttons={{
          add: false,
          edit: false,
          delete: true
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
