import { TextField } from 'react-admin';
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  title: {
    fontWeight: 'bold',
    fontSize: '1em',
  },
});

export const DisplayTitle = () => {
  const classes = useStyles();
  return (
    <>
      <TextField source="display_title" className={classes.title} />
    </>
  );
};
