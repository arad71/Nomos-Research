import { createTheme } from '@material-ui/core/styles';

const theme = createTheme({
  typography: {
    fontFamily: [
      'Segoe UI',
      'Roboto',
      'Oxygen',
      'Ubuntu',
      'Cantarell',
      'Fira Sans',
      'Droid Sans',
      'Helvetica Neue',
    ].join(','),
  },
  palette: {
    primary: {
      main: '#f00',
    },
    secondary: {
      main: '#ffcc80', // Another orange-ish color
    },
  },
});

export default theme;
