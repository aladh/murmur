import "babel-polyfill";
import ReactDOM from 'react-dom';
import React from 'react';
import App from 'javascripts/components/App';
import secrets from './secrets';

window.gaTrackingId = secrets.gaTrackingId;

Bugsnag.apiKey = secrets.bugsnagApiKey;
Bugsnag.notifyReleaseStages = ["production"];
if (location.hostname == 'localhost') Bugsnag.releaseStage = "development";

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(<App />, document.querySelector('#app'));
});
