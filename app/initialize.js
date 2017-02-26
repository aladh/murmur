import "babel-polyfill";
import ReactDOM from 'react-dom';
import React from 'react';
import App from 'components/App';
import secrets from './secrets';
window.gaTrackingId = secrets.gaTrackingId;

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(<App />, document.querySelector('#app'));
});
