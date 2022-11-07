import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
// import App from './App';
import { Interface } from './interface';

const root = ReactDOM.createRoot(document.getElementById('root'));

// Instead of keypresses, listen to user input
const buttonInterface = new Interface();

buttonInterface.openEyes();

root.render(
  <React.StrictMode>
    {/* <App /> */}
    <Interface />
  </React.StrictMode>
);
