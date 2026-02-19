import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import './index.css';
import { ThemeProvider } from '@mui/material/styles';
import App from './App';
import theme from './Theme';

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <Router future={{ v7_startTransition: true }}>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </Router>
  );
}
