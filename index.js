'use strict';

const React = require('react');

const App = React.createClass({
  render() {
    return <h1>Hello World</h1>;
  }
});
React.render( <App />, window.document.getElementById('target') );
