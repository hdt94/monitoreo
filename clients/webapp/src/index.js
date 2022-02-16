import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';

import App from './App';
import { AuthProvider } from './components/contexts/auth';
import { ConnectionProvider } from './components/contexts/connection';

import ErrorBoundary from './components/ErrorBoundary';
import ThemeStyles from './components/ThemeStyles';


ReactDOM.render(
  <ErrorBoundary>
    <ThemeStyles>
      <ConnectionProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ConnectionProvider>
    </ThemeStyles>
  </ErrorBoundary>,
  document.getElementById('root')
);
