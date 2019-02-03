// React Imports
import React from 'react';
import ReactDOM from 'react-dom';

// App Imports
import App from './app';

// Redux Store Imports
import allReducers from './reducers'
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { LocalizeProvider } from 'react-localize-redux';

// Create a store...
const store = createStore(
    // ... with the list of all reducers
    allReducers,
    {},
    // ...connext it to the dev tools
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);


// Render the app with an attached memory store to the element #root
ReactDOM.render(
    <LocalizeProvider store={store}>
        <Provider store={store}>
            <App />
        </Provider>
    </LocalizeProvider>,
    
    document.getElementById('root'));
