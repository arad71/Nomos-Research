// in src/MyAppBar.js
import * as React from 'react';
import { AppBar } from 'react-admin';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  title: {
    flex: 1,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
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
    </AppBar>
  );
};

export default MyAppBar;
