/** @jsx React.DOM */
var React = require('react');
var pkg = require('./package.json');

var EditableForm = require('./editableform.jsx');

React.renderComponent(
  <EditableForm />

, document.body);
