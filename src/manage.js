
var IndexRoute = require('react-router').IndexRoute,
    React = require('react'),
    ReactDOM = require('react-dom'),
    Router = require('react-router').Router,
    Route = require('react-router').Route,
    $ = require('jquery');

$(function() {
  ReactDOM.render((
    <Router>
      <Route path="/" component={require('./views/app.js')}>
        <Route path="login" component={require('./views/secure/login.js')} />

        <IndexRoute component={require('./views/journals/edit.js')} />
        <Route path="entries" component={require('./views/journals/list.js')} />
        <Route path="entries/:id" component={require('./views/journals/entry.js')} />
      </Route>
    </Router>
  ), document.getElementById("app"));
});
