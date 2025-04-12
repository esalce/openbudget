import React from 'react';


import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // or './index.scss' if you're using SCSS

const root = document.getElementById('root');

if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
