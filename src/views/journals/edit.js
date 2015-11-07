
var Button = require('react-bootstrap').Button,
    History = require('react-router').History,
    Input = require('react-bootstrap').Input,
    Markdown = require('react-markdown'),
    Panel = require('react-bootstrap').Panel,
    Pick = require('object.pick'),
    React = require('react/addons'),
    Uuid = require('uuid4');

var actions = require('../../actions'),
    store = require('../../stores');

module.exports = React.createClass({
  mixins: [History],
  propTypes: {
    "id": React.PropTypes.string,
    "name": React.PropTypes.string.isRequired,
    "data": React.PropTypes.string.isRequired,
    "ctime": React.PropTypes.number,
    "mtime": React.PropTypes.number,
    "isMarkdownEnabled": React.PropTypes.bool
  },
  getInitialState: function() {
    return {
      "name": "",
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
  onNameChangeHandler: function(e) {
    this.setState({
      "name": e.target.value
    });
  },
  onDataChangeHandler: function(e) {
    this.setState({
      "data": e.target.value
    });
  },
  onIsMarkdownEnabledChangeHandler: function(e) {
    this.setState({
      "isMarkdownEnabled": this.refs.isMarkdownEnabled.getChecked()
    });
  },
  onSubmitJournal: function(e) {
    if (this.isNew()) {
      actions.save([
        React.addons.update(
          this.getEntry(), {
            "id": {$set: Uuid()}
          })
        ]);
    } else {
      // TODO: Update case
    }
    this.history.pushState(null, "/entries");
  },
  render: function() {
    var isMarkdownEnabledProps = {
      "checked": this.state.isMarkdownEnabled
    };
    return (
      <div className="container">
        <form>
          <Input
            ref="name"
            type="text"
            defaultValue={this.props.name}
            value={this.state.name}
            placeholder="Enter name"
            label="Name of your journal entry"
            help="Name of your journal entry!"
            onChange={this.onNameChangeHandler} />
          <Input
            ref="data"
            type="textarea"
            defaultValue={this.props.data}
            value={this.state.data}
            placeholder="Write some stuff..."
            label="Write down your thoughts"
            help="Write down your thoughts!"
            onChange={this.onDataChangeHandler} />
          <Input
            {...isMarkdownEnabledProps}
            ref="isMarkdownEnabled"
            type="checkbox"
            defaultValue={this.props.isMarkdownEnabled}
            value={this.state.isMarkdownEnabled}
            label="Markdown Enabled"
            onChange={this.onIsMarkdownEnabledChangeHandler} />
          <Button onClick={this.onSubmitJournal}>Submit</Button>
        </form>
      </div>
    );
  },
  isNew: function() {
    return !this.props.id;
  },
  getEntry: function() {
    return React.addons.update(
      Pick(this.props, "id", "name", "data", "ctime", "mtime", "isMarkdownEnabled"), {
        "name": {$set: this.state.name},
        "data": {$set: this.state.data},
        "isMarkdownEnabled": {$set: this.state.isMarkdownEnabled}
      });
  }
});
