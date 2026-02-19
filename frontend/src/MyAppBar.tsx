// in src/MyAppBar.js
import * as React from 'react';
import { AppBar } from 'react-admin';
import Typography from '@mui/material/Typography';
import makeStyles from 'lib/makeStyles';

const useStyles = makeStyles({
  title: {
    flex: 1,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    fontSize: '1.2em',
  },
  spacer: {
    flex: 1,
  },
  appbar: {
    color: 'grey',
    backgroundColor: 'white',
  },
  boldtext: {
    fontWeight: 600,
  },
});

const MyAppBar = (props: any) => {
  const classes = useStyles();
  return (
    <AppBar className={classes.appbar} {...props}>
      <Typography
        variant="h5"
        color="inherit"
        className={classes.title}
        id="react-admin-title"
      />
      <Typography variant="h5">
        <span className={classes.boldtext}>Nomos</span> Taxonomic Names Register
      </Typography>
      <span className={classes.spacer} />
      {process.env.REACT_APP_VERSION}
    </AppBar>
  );
};

export default MyAppBar;
