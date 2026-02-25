import { TextField } from 'react-admin';
import React from 'react';
import makeStyles from 'lib/makeStyles';

const useStyles = makeStyles({
  title: {
    fontWeight: 'bold',
    fontSize: '1em',
  },
});

export const ClassificationDescription = () => {
  const classes = useStyles();
  return (
    <>
      <TextField source="class_desc" className={classes.title} />
    </>
  );
};
