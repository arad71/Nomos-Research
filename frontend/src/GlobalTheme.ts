import makeStyles from 'lib/makeStyles';

export const GlobalTheme = makeStyles((theme: any) => ({
  title: {
    fontWeight: 'bold',
    fontSize: '1.5em',
    marginRight: '0.2em',
  },
  subtitle: {
    fontSize: '1em',
  },
  titlePos: {
    //position: 'absolute',
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
    marginTop: '1.5em',
  },
  form: {
    border: '1px solid #e4e4e7',
    borderRadius: '20px',
  },
  equalColumnWidth: {
    tableLayout: 'fixed',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(8, 1fr)',
    width: '100%',
    maxWidth: '1200px',
    gridColumnGap: '1.25em',
    rowGap: '0.75em',
    [theme.breakpoints.down('md')]: {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
    [theme.breakpoints.down('sm')]: {
      gridTemplateColumns: '1fr',
    },
  },
}));

export const GlobalGridTheme = makeStyles((theme: any) => ({
  EightCol1to9span: {
    gridColumn: '1 / 9',
    [theme.breakpoints.down('md')]: {
      gridColumn: '1 / -1',
    },
  },
  EightCol1to5span: {
    gridColumn: '1 / 5',
    [theme.breakpoints.down('md')]: {
      gridColumn: '1 / -1',
    },
  },
  EightCol5to9span: {
    gridColumn: '5 / 9',
    [theme.breakpoints.down('md')]: {
      gridColumn: '1 / -1',
    },
  },
  EightCol1to2span: {
    gridColumn: '1 / 2',
    [theme.breakpoints.down('md')]: {
      gridColumn: '1 / 2',
    },
    [theme.breakpoints.down('sm')]: {
      gridColumn: '1 / -1',
    },
  },
  EightCol2to3span: {
    gridColumn: '2 / 3',
    [theme.breakpoints.down('md')]: {
      gridColumn: '2 / 3',
    },
    [theme.breakpoints.down('sm')]: {
      gridColumn: '1 / -1',
    },
  },
  EightCol3to4span: {
    gridColumn: '3 / 4',
    [theme.breakpoints.down('md')]: {
      gridColumn: '1 / -1',
    },
  },
  EightCol4to5span: {
    gridColumn: '4 / 5',
    [theme.breakpoints.down('md')]: {
      gridColumn: '1 / -1',
    },
  },
  EightCol1to3span: {
    gridColumn: '1 / 3',
    [theme.breakpoints.down('md')]: {
      gridColumn: '1 / 2',
    },
    [theme.breakpoints.down('sm')]: {
      gridColumn: '1 / -1',
    },
  },
  EightCol3to5span: {
    gridColumn: '3 / 5',
    [theme.breakpoints.down('md')]: {
      gridColumn: '2 / 3',
    },
    [theme.breakpoints.down('sm')]: {
      gridColumn: '1 / -1',
    },
  },
  EightCol5to7span: {
    gridColumn: '5 / 7',
    [theme.breakpoints.down('md')]: {
      gridColumn: '1 / 2',
    },
    [theme.breakpoints.down('sm')]: {
      gridColumn: '1 / -1',
    },
  },
  EightCol7to9span: {
    gridColumn: '7 / 9',
    [theme.breakpoints.down('md')]: {
      gridColumn: '2 / 3',
    },
    [theme.breakpoints.down('sm')]: {
      gridColumn: '1 / -1',
    },
  },
}));
