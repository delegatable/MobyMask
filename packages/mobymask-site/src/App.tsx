import React from 'react';
import logo from './logo.svg';
import './App.css';
import QueryParamsRoute from './QueryParamsRoute';

import {
  BrowserRouter as Router,
  Link,
  useLocation
} from "react-router-dom";

function App() {
  return (
    <div className="App">
      
      <header className="App-header">
        <h1>
          <img src={logo} className="App-logo" alt="logo" />
          MobyMask</h1>
        <p>
          An alliance of good-hearted phish, aiming to eliminate phishers. 
        </p>
      </header>

      <Router>
        <QueryParamsRoute/>
      </Router>

      <div className='footer'>
        <p>Reporters are added on an invite-only basis.</p>
        <p>Learn more about how our invite system works at <a href="https://github.com/danfinlay/delegatable-eth">delegatable-eth</a>.</p>
      </div>

    </div>
  );
}

export default App;
