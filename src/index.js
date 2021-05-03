import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import 'fontsource-open-sans';
import 'fontsource-open-sans/600.css';
import 'fontsource-open-sans/300.css';

const theme = createMuiTheme({
  typography: {
    fontFamily: "Open Sans, sans-serif",
    fontWeight: 600,
  },
  palette: {
    type: "dark",
    background: {
      default: "#000004",
    },
    primary: {
      light: "#111115",
      main: "#111115",
      dark: "#111115",
    },
    secondary: {
      light: "#7953d2",
      dark: "#7953d2",
      main: "#7953d2"
    }
  }
});

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <App  />
  </ThemeProvider>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
