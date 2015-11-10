
var _ = require('underscore'),
    Button = require('react-bootstrap').Button,
    CodeMirror = require('codemirror'),
    History = require('react-router').History,
    Input = require('react-bootstrap').Input,
    Markdown = require('react-markdown'),
    Panel = require('react-bootstrap').Panel,
    Pick = require('object.pick'),
    React = require('react'),
    ReactUpdate = require('react/lib/update'),
    ReactCodeMirror = require('react-codemirror');

var actions = require('../../actions'),
    store = require('../../stores');

require('codemirror/mode/markdown/markdown');
require('codemirror/addon/mode/overlay.js');

(function() {
  var subjectMode = {
    startState: function() {
      return {
        firstLine: false
      };
    },
    token: function(stream, state) {
      stream.next();

      if (state.firstLine) return null;
      if (stream.eol()) state.firstLine = true;
      return "header";
    }
  };

  CodeMirror.defineMode("subject", function(config, parserConfig) {
    return subjectMode;
  });

  CodeMirror.defineMode("mixedmarkdown", function(config, parserConfig) {
    return CodeMirror.overlayMode(CodeMirror.getMode({}, "markdown"), subjectMode);
  });
})();

module.exports = React.createClass({
  mixins: [History],
  propTypes: {
    "id": React.PropTypes.string,
    "name": React.PropTypes.string,
    "data": React.PropTypes.string,
    "ctime": React.PropTypes.number,
    "mtime": React.PropTypes.number,
    "isMarkdownEnabled": React.PropTypes.bool
  },
  getInitialState: function() {
    return {
      "data": "",
      "isMarkdownEnabled": true
    };
  },
  getDefaultProps: function() {
    return {
      "id": null,
      "name": "",
      "data": "",
      "ctime": Date.now(),
      "mtime": Date.now(),
      "isMarkdownEnabled": true
    };
  },
  onIsMarkdownEnabledChangeHandler: function(e) {
    this.setState({
      "isMarkdownEnabled": this.refs.isMarkdownEnabled.getChecked()
    });
  },
  onSubmitJournal: function(e) {
    var firstLine = _.indexOf(this.state.data, "\n");
    var subject = this.state.data.substring(0, firstLine);
    var data = this.state.data.substring(firstLine + 1);
    if (this.isNew()) {
      actions.add(
        ReactUpdate(
          this.getEntry(), {
            "name": {$set: subject},
            "data": {$set: data},
          })
        );
      actions.save();
    } else {
      // TODO: Update case
    }
    this.history.pushState(null, "/entries");
  },
  onUpdateData: function(data) {
    this.setState({data: data});
  },
  render: function() {
    var isMarkdownEnabledProps = {
      "checked": this.state.isMarkdownEnabled
    };
    return (
      <div>
        <ReactCodeMirror
            value={this.state.data}
            onChange={this.onUpdateData}
            options={{
              mode: (this.state.isMarkdownEnabled) ? "mixedmarkdown" : "subject"
            }} />
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "10px"
        }}>
          <Input  {...isMarkdownEnabledProps}
                  ref="isMarkdownEnabled"
                  type="checkbox"
                  defaultValue={this.props.isMarkdownEnabled}
                  value={this.state.isMarkdownEnabled}
                  label="Markdown Enabled"
                  onChange={this.onIsMarkdownEnabledChangeHandler} />
          <Button onClick={this.onSubmitJournal}>Submit</Button>
        </div>
      </div>
    );
  },
  isNew: function() {
    return !this.props.id;
  },
  getEntry: function() {
    return ReactUpdate(
      Pick(this.props, "id", "name", "data", "ctime", "mtime", "isMarkdownEnabled"), {
        "isMarkdownEnabled": {$set: this.state.isMarkdownEnabled}
      });
  }
});
