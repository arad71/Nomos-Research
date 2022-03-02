import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import './index.css';
import { createTheme, ThemeProvider } from '@material-ui/core';
import App from './App';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6e6e6e',
    },
    secondary: {
      main: '#ffcc80', // Another orange-ish color
    },
  },
});

ReactDOM.render(
  <Router>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </Router>,
  document.getElementById('root')
);
