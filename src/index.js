import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Interface } from './interface';

const root = ReactDOM.createRoot(document.getElementById('root'));

// const ros = connectToROS(networkConfig.ip);
// console.log(ros);

// // Instead of keypresses, listen to user input
// const buttonInterface = new Interface(document, ros);
const buttonInterface = new Interface();

buttonInterface.openEyes();


root.render(
  <React.StrictMode>
    <App />
    <Interface />
  </React.StrictMode>
);


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
