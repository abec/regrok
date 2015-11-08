
var _ = require('underscore'),
    Bootstrap = require('react-bootstrap'),
    React = require('react'),
    ClassNames = require('classnames');

function placeCaretAtEnd(el) {
  el.focus();
  if (typeof window.getSelection != "undefined"
          && typeof document.createRange != "undefined") {
    var range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  } else if (typeof document.body.createTextRange != "undefined") {
    var textRange = document.body.createTextRange();
    textRange.moveToElementText(el);
    textRange.collapse(false);
    textRange.select();
  }
}

var Body = React.createClass({
  propTypes: {
    "defaultSubject": React.PropTypes.string,
    "defaultContent": React.PropTypes.string
  },
  getInitialState: function() {
    return {
      subject: null,
      content: null,
      showSubjectPlaceholder: true,
      showContentPlaceholder: true
    };
  },
  getDefaultProps: function() {
    return {};
  },
  render: function() {
    return (
      <div className="bigtext-body" {...(_.omit(this.props, "children", "content"))}>
        {this.renderPlaceholder("subject", "subjectPlaceholder", "showSubjectPlaceholder", "bigtext-subject-placeholder")}
        <h3 ref="subject"
            contentEditable="true"
            className="bigtext-subject"
            onKeyUp={this.subjectOnKeyUpHandler}
            onKeyDown={this.subjectOnKeyDownHandler}>{this.props.defaultSubject}</h3>
        {this.renderPlaceholder("content", "contentPlaceholder", "showContentPlaceholder", "bigtext-content-placeholder")}
        <div  ref="content"
              contentEditable="true"
              className="bigtext-content"
              onKeyUp={this.contentOnKeyUpHandler}
              onKeyDown={this.contentOnKeyDownHandler}>{this.props.defaultContent}</div>
      </div>
    );
  },
  renderPlaceholder: function(ref, prop, state, classname) {
    var self = this;

    if (this.props[prop]) {
      var classnames = {
        "hide": !this.state[state]
      }
      classnames[classname] = true;
      return (<label className={ClassNames(classnames)} onClick={function() {
        self.refs[ref].getDOMNode().focus();
      }}>{this.props[prop]}</label>);
    }

    return null;
  },

  subjectOnKeyDownHandler: function(e) {
    // If enter is pressed, focus on content.
    if (e.keyCode == 13) {
      this.refs.content.getDOMNode().focus();
      e.stopPropagation();
      e.preventDefault();
    }
  },
  subjectOnKeyUpHandler: function(e) {
    var text = this.refs.subject.getDOMNode().innerHTML;

    // Toggle placeholder text
    if (this.state.showSubjectPlaceholder && text.length > 0) {
      this.setState({showSubjectPlaceholder: false});
    } else if (!this.state.showSubjectPlaceholder && text.length == 0) {
      this.setState({showSubjectPlaceholder: true});
    }

    this.setState({
      subject: text
    });
  },
  contentOnKeyDownHandler: function(e) {
    var text = this.refs.content.getDOMNode().innerHTML;

    // If content is gone, start removing from subject
    if (text.length == 0 && e.keyCode == 8) {
      this.refs.subject.getDOMNode().focus();
      placeCaretAtEnd(this.refs.subject.getDOMNode());
      e.stopPropagation();
      e.preventDefault();
    }
  },
  contentOnKeyUpHandler: function(e) {
    var text = this.refs.content.getDOMNode().innerHTML;

    // Toggle placeholder text
    if (this.state.showContentPlaceholder && text.length > 0) {
      this.setState({showContentPlaceholder: false});
    } else if (!this.state.showContentPlaceholder && text.length == 0) {
      this.setState({showContentPlaceholder: true});
    }

    this.setState({
      content: text
    });
  }
});

module.exports = Body;
