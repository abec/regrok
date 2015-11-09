
var _ = require('underscore'),
    History = require('react-router').History,
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
        onEntryDelete={function(entry) {
          var entries = self.props.entries;
          for (var i = 0; i < self.props.entries.length; ++i) {
            if (self.props.entries[i].id == entry.id) {
              entries = _.without(entries, self.props.entries[i]);
            }
          }
          self.props.entries = entries;
          actions.set(entries);
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
