import { createTheme } from '@material-ui/core/styles';
import { defaultTheme } from 'react-admin';

const theme = createTheme({
  ...defaultTheme,
  sidebar: {
    width: 220, // The default value is 240
    closedWidth: 60, // The default value is 55
  },
  typography: {
    fontFamily: [
      'Helvetica Neue',
      'Helvetica',
      'Arial',
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
      main: '#2c5331',
    },
    secondary: {
      main: '#ffcc80', // Another orange-ish color
    },
  },
  overrides: {
    RaMenuItem: {
      nestedList: {
        paddingLeft: '0px',
      },
    },
  },
});

export default theme;
