// import 'promise-polyfill';
// import 'isomorphic-fetch';
import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/scss/bootstrap.scss'
import './style';

let root;
function init() {
	let App = require('./components/app').default;
	ReactDOM.render(<App />, document.getElementById('app-body'));
}

// register ServiceWorker via OfflinePlugin, for prod only:
if (process.env.NODE_ENV === 'production') {
	require('./pwa');
}

// in development, set up HMR:
if (module.hot) {
	//require('preact/devtools');   // turn this on if you want to enable React DevTools!
	module.hot.accept('./components/app', () => requestAnimationFrame(init));
}

init();
