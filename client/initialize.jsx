import "babel-polyfill";
import ReactDOM from 'react-dom';
import React from 'react';
import App from './javascripts/components/App';
import styles from './styles/application';

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(<App />, document.querySelector('#app'));
});
