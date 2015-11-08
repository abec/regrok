
var Button = require('react-bootstrap').Button,
    History = require('react-router').History,
    Input = require('react-bootstrap').Input,
    Markdown = require('react-markdown'),
    Panel = require('react-bootstrap').Panel,
    Pick = require('object.pick'),
    React = require('react/addons'),
    Uuid = require('uuid4');

var actions = require('../../actions'),
    store = require('../../stores'),
    BigText = require('../bigtext');

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
    if (this.isNew()) {
      actions.save([
        React.addons.update(
          this.getEntry(), {
            "id": {$set: Uuid()},
            "name": {$set: this.refs.body.state.subject},
            "data": {$set: this.refs.body.state.content},
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
      <BigText>
        <BigText.Body subjectPlaceholder="Give your sad story a subject"
                      contentPlaceholder="Write your sad story"
                      ref="body" />
        <BigText.Footer>
          <Input
            {...isMarkdownEnabledProps}
            ref="isMarkdownEnabled"
            type="checkbox"
            defaultValue={this.props.isMarkdownEnabled}
            value={this.state.isMarkdownEnabled}
            label="Markdown Enabled"
            onChange={this.onIsMarkdownEnabledChangeHandler} />
          <Button onClick={this.onSubmitJournal}>Submit</Button>
        </BigText.Footer>
      </BigText>
    );
  },
  isNew: function() {
    return !this.props.id;
  },
  getEntry: function() {
    return React.addons.update(
      Pick(this.props, "id", "name", "data", "ctime", "mtime", "isMarkdownEnabled"), {
        "isMarkdownEnabled": {$set: this.state.isMarkdownEnabled}
      });
  }
});
