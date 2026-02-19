import React from 'react';
import { createTheme } from '@mui/material/styles';
import { defaultTheme } from 'react-admin';

const NoTransition = (props: any) => {
  return props.children || null;
};

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
  components: {
    RaMenuItem: {
      styleOverrides: {
        nestedList: {
          paddingLeft: '0px',
          fontWeight: '400',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          '@media (min-width: 600px)': {
            minWidth: '60px',
          },
          '@media (min-width: 1350px)': {
            minWidth: '120px',
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        displayBlock: {
          fontSize: '0.9rem',
        },
      },
    },
    RaSelectArrayInput: {
      styleOverrides: {
        root: {
          minWidth: '150px',
        },
      },
    },
    RaSelectInput: {
      styleOverrides: {
        input: {
          minWidth: '100%',
        },
      },
    },
    RaNullableBooleanInput: {
      styleOverrides: {
        input: {
          minWidth: '100%',
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          width: '100%',
        },
      },
    },
    MuiTooltip: {
      defaultProps: {
        // Prevent transition child style access crashes in mixed stack.
        TransitionComponent: NoTransition,
      },
    },
    MuiSnackbar: {
      defaultProps: {
        // Keep notifications functional without transition wrapper assumptions.
        TransitionComponent: NoTransition,
      },
    },
    RaAutocompleteInput: {
      styleOverrides: {
        container: {
          gridColumn: '1/5',
        },
      },
    },
    RaAutocompleteArrayInput: {
      styleOverrides: {
        container: {
          gridColumn: '1/5',
        },
      },
    },
  },
});

export default theme;
