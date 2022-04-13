import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { EditButton } from 'react-admin';

const useStyles = makeStyles({
  button: {
    fontWeight: 'bold',
    /* This is JSS syntax to target a deeper element using css selector,
    here the svg icon for this button */
    '& svg': { color: 'orange' },
  },
});

const MyEditButton = (props: any) => {
  const classes = useStyles();
  return <EditButton className={classes.button} {...props} />;
};

export default MyEditButton;
