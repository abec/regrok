
var Bootstrap = require('react-bootstrap'),
    Exclude = require('exclude'),
    Pick = require('object.pick'),
    React = require('react');

var controlsHandler = function(prop) {
  return function() {
    var fn = this.props[prop],
        data = this.props.data,
        selectedData = this.props.selectedData,
        idKey = this.props.idKey;
    if (fn) {
      data.filter(function(datum) {
        return selectedData.indexOf(datum[idKey]) != -1;
      }).map(function(datum) {
        fn(datum);
      });
    }
  };
};

var Controls = React.createClass({
  propTypes: {
    "buttons": React.PropTypes.object,
    "data": React.PropTypes.array,
    "selectedData": React.PropTypes.array,
    "onEntryDelete": React.PropTypes.func,
    "onEntryEdit": React.PropTypes.func,
    "onEntryAdd": React.PropTypes.func
  },
  getDefaultProps: function() {
    return {
      "buttons": {
        "add": true,
        "edit": false,
        "delete": true
      },
      "data": [],
      "selectedData": [],
      "onEntryDelete": function() {},
      "onEntryEdit": function() {},
      "onEntryAdd": function() {},
    };
  },
  deleteEntriesHandler: controlsHandler("onEntryDelete"),
  editEntryHandler: controlsHandler("onEntryEdit"),
  addEntryHandler: function() {
    this.props.onEntryAdd();
  },
  render: function() {
    var buttons = [];

    if (this.props.buttons.delete && this.props.data.length != 0) {
      buttons.push((
        <Bootstrap.Button onClick={this.deleteEntriesHandler} key={"delete"}>
          <Bootstrap.Glyphicon glyph="trash" />Delete
        </Bootstrap.Button>
      ));
    }

    if (this.props.buttons.edit && this.props.selectedData.length != 0) {
      buttons.push((
        <Bootstrap.Button onClick={this.editEntryHandler} key={"edit"}>
          <Bootstrap.Glyphicon glyph="write" />Edit
        </Bootstrap.Button>
      ));
    }

    if (this.props.buttons.add) {
      buttons.push((
        <Bootstrap.Button onClick={this.addEntryHandler} key={"add"}>
          <Bootstrap.Glyphicon glyph="plus" />Write
        </Bootstrap.Button>
      ));
    }

    return (
      <Bootstrap.ButtonToolbar>
        {buttons}
      </Bootstrap.ButtonToolbar>
    );
  }
});

var Row = React.createClass({
  propTypes: {
    "id": React.PropTypes.string.isRequired,
    "data": React.PropTypes.object.isRequired,
    "columnMetadata": React.PropTypes.object,
    "DefaultValueTransformation": React.PropTypes.func,
    "isSelected": React.PropTypes.bool,
    "onEntryView": React.PropTypes.func
  },
  getDefaultProps: function() {
    return {
      "data": [],
      "columnMetadata": {},
      "DefaultValueTransformation": React.createClass({
        render: function() {
          return <p>{this.props.value}</p>;
        }
      }),
      "isSelected": false,
      "onEntryView": function() {}
    };
  },
  render: function() {
    var ordereddata = this.getOrderedData(this.props.data);
    var cols = [];
    for (var index in ordereddata) {
      cols.push((
        <td>{ordereddata[index]}</td>
      ));
    }
    return (
      <tr {...this.props}
        className={(this.props.isSelected) ? "active" : ""}
        onDoubleClick={this.doubleClickHandler}>
        {cols}
      </tr>
    );
  },

  doubleClickHandler: function() {
    if (this.props.onEntryView) {
      this.props.onEntryView(this.props.data);
    }
  },
  getOrderedData: function(data) {
    var cols = [];
    for (var index in this.props.order) {
      var col = this.props.order[index];
      var metadata = this.props.columnMetadata[col] || {};
      var props = {
        "value": data[col],
        "data": data,
        "col": col
      };
      if (metadata.transformation) {
        cols.push(<metadata.transformation {...props} />);
      } else {
        cols.push(<this.props.DefaultValueTransformation {...props} />);
      }
    }
    return cols;
  },
});

var Table = React.createClass({
  propTypes: {
    "columnMetadata": React.PropTypes.object
  },
  getHeaders: function() {
    var rows = [];
    for (var index in this.props.order) {
      var col = this.props.order[index];
      var metadata = this.props.columnMetadata[col] || {};
      var header = metadata.header || col;
      rows.push((
        <th key={"header-"+index}>{header}</th>
      ));
    }
    return rows;
  },
  render: function() {
    return (
      <Bootstrap.Table className={"griddy"}>
        <thead>
          <tr>
            {this.getHeaders()}
          </tr>
        </thead>
        <tbody>
          {this.props.children}
        </tbody>
      </Bootstrap.Table>
    );
  }
});

var DefaultEmptyView = React.createClass({
  render: function() {
    return (<Bootstrap.Panel>You have no shit</Bootstrap.Panel>);
  }
});

var Griddy = React.createClass({
  statics: {
    "arrayEquals": function(arr1, arr2) {
      if (!arr1 && arr2) return false;
      if (arr1 && !arr2) return false;
      if (arr1 == arr2) return true;
      if (arr1.length != arr2.length) return false;
      for (var i = 0; i < arr1.length; ++i) {
        if (arr1[i] != arr2[i]) return false;
      }
    }
  },
  propTypes: {
    "data": React.PropTypes.array,
    "columnMetadata": function(props, propName, componentName) {
      var prop = props[propName];

      if ((typeof prop !== "object") || (prop === null)) {
        return new Error("columnMetadata must be an object.");
      }

      for (var column in prop) {
        if (Exclude(Object.keys(prop[column]), ["transformation", "header"]).length > 0) {
          return new Error("columnMetadata entries can only contain the keys 'transformation' and 'header'.");
        }

        if (typeof prop[column].transformation !== "function") {
          return new Error("columnMetadata." + column + ".transformation must be a function.");
        }

        if (typeof prop[column].header !== "string") {
          return new Error("columnMetadata." + column + ".header must be a string.");
        }
      }
    },
    "views": function(props, propName, componentName) {
      var prop = props[propName];

      if ((typeof prop !== "object") || (prop === null)) {
        return new Error("views must be an object.");
      }

      if (Exclude(Object.keys(prop), ["Empty", "Container", "Entry"]).length > 0) {
        return new Error("views can only contain the keys 'Empty', 'Container', and 'Entry'.");
      }

      if (typeof prop.Empty !== "function") {
        return new Error("views.Empty must be a function.");
      }

      if (typeof prop.Container !== "function") {
        return new Error("views.Container must be a function.");
      }

      if (typeof prop.Entry !== "function") {
        return new Error("views.Entry must be a function.");
      }
    },
    "idKey": React.PropTypes.string,
  },
  getDefaultProps: function() {
    return {
      "data": [],
      "columnMetadata": {},
      "views": {
        "Empty": DefaultEmptyView,
        "Container": Table,
        "Entry": Row
      },
      "idKey": "id"
    };
  },
  getInitialState: function() {
    return {
      "selectedData": []
    };
  },
  render: function() {
    if (this.props.data.length > 0) {
      var view = (
        <this.props.views.Container {...this.props} {...this.state} ref="list">
          {this._getWrappedData(this.props, this.state)}
        </this.props.views.Container>
      );
    } else {
      var view = <this.props.views.Empty {...this.props} {...this.state} ref="empty" />;
    }

    return (
      <div className="griddy-list">
        <Controls {...this.props} {...this.state} ref="controls" />
        {view}
      </div>
    );
  },

  _getWrappedData: function() {
    var self = this;
    var WrappedData = self.props.data.map(function(datum) {
      var id = datum[self.props.idKey];
      if (!id) console.error(self.props.idKey + " must have a value in every entry.");
      return (<self.props.views.Entry {...self.props} {...self.state}
        data={datum}
        onClick={function() {
          var index = self.state.selectedData.indexOf(id);
          if (index != -1) {
            self.state.selectedData.splice(index, 1);
          } else {
            self.state.selectedData.push(id);
          }
          self.setState({
            "selectedData": self.state.selectedData
          });
        }}
        isSelected={self.state.selectedData.indexOf(id) != -1}
        key={id}
      />);
    });
    return WrappedData;
  }
});

module.exports = Griddy;
