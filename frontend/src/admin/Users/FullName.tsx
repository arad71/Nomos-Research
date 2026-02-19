import { TextField } from 'react-admin';
import React from 'react';
import makeStyles from 'lib/makeStyles';

const useStyles = makeStyles({
  title: {
    fontWeight: 'bold',
    fontSize: '1em',
  },
});

export const FullName = () => {
  const classes = useStyles();
  return (
    <>
      <TextField source="full_name" className={classes.title} />
    </>
  );
};
