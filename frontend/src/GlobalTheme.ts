import { makeStyles } from '@material-ui/core';

export const GlobalTheme = makeStyles((theme) => ({
  title: {
    fontWeight: 'bold',
    fontSize: '1.5em',
    marginRight: '0.2em',
  },
  subtitle: {
    fontSize: '1em',
  },
  titlePos: {
    position: 'absolute',
    top: '65px',
  },
  titleTruncation: {
    maxWidth: '23em',
    display: 'inline-block',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
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
  equalColumnWidth: {
    tableLayout: 'fixed',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(8, 1fr)',
    width: '90%',
    gridColumnGap: '1.5em',
  },
}));

export const GlobalGridTheme = makeStyles((theme) => ({
  EightCol1to9span: {
    gridColumn: '1 / 9',
  },
  EightCol1to5span: {
    gridColumn: '1 / 5',
  },
  EightCol5to9span: {
    gridColumn: '5 / 9',
  },
  EightCol1to2span: {
    gridColumn: '1 / 2',
  },
  EightCol2to3span: {
    gridColumn: '2 / 3',
  },
  EightCol3to4span: {
    gridColumn: '3 / 4',
  },
  EightCol4to5span: {
    gridColumn: '4 / 5',
  },
  EightCol1to3span: {
    gridColumn: '1 / 3',
  },
  EightCol3to5span: {
    gridColumn: '3 / 5',
  },
  EightCol5to7span: {
    gridColumn: '5 / 7',
  },
  EightCol7to9span: {
    gridColumn: '7 / 9',
  },
}));
