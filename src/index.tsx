import "babel-polyfill";
import * as ReactDOM from 'react-dom';
import * as React from 'react';
import App from './components/App';
import '../styles/application';

document.addEventListener('DOMContentLoaded', () =>
    ReactDOM.render(<App />, document.querySelector('#app'))
);