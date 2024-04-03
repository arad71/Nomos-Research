import { createTheme } from '@material-ui/core/styles';
import { defaultTheme } from 'react-admin';

const theme = createTheme({
  ...defaultTheme,
  sidebar: {
    width: 260, // The default value is 240
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
    body1: {
      fontFamily: ['Helvetica Neue', 'Helvetica', 'sans-serif'],
      fontWeight: 'inherit',
      fontSize: '1rem',

      lineHeight: 1.5,
    },
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
        fontWeight: '400',
      },
    },

    MuiTab: {
      root: {
        '@media (min-width: 600px)': {
          minWidth: '60px',
        },
        '@media (min-width: 1350px)': {
          minWidth: '120px',
        },
      },
    },
    MuiTypography: {
      displayBlock: {
        fontSize: '0.9rem',
      },
    },
    RaSelectArrayInput: {
      root: {
        minWidth: '150px',
      },
    },
    RaSelectInput: {
      input: {
        minWidth: '100%',
      },
    },
    RaNullableBooleanInput: {
      input: {
        minWidth: '100%',
      },
    },
    MuiFormControl: {
      root: {
        width: '100%',
      },
    },
    RaAutocompleteInput: {
      container: {
        gridColumn: '1/5',
      },
    },
    RaAutocompleteArrayInput: {
      container: {
        gridColumn: '1/5',
      },
    },
  },
});

export default theme;
