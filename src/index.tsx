import "babel-polyfill";
import * as ReactDOM from 'react-dom';
import * as React from 'react';
import App from './components/App';
import '../styles/application.css';

// TODO: Polyfill URLSearchParams, TextEncoder/TextDecoder

document.addEventListener('DOMContentLoaded', () =>
    ReactDOM.render(<App />, document.querySelector('#app'))
);
