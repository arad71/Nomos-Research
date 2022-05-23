import { makeStyles } from '@material-ui/core';

export const GlobalTheme = makeStyles((theme) => ({
  bold: {
    fontWeight: 'bold',
  },
  fieldMargin: {
    [theme.breakpoints.up('xs')]: {
      marginRight: '0',
    },
    [theme.breakpoints.up('sm')]: {
      marginRight: '1em',
      marginBottom: '1.2em',
    },
  },
  formRow: {
    [theme.breakpoints.up('xs')]: {
      display: 'block',
    },
    [theme.breakpoints.up('sm')]: {
      display: 'flex',
    },
  },
  sectionMargin: {
    marginTop: '2.2em',
  },
  form: {
    border: '1px solid #DFDFE2',
    borderRadius: '5px',
  },
}));
