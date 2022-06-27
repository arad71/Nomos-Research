import { TextField } from 'react-admin';
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  title: {
    fontWeight: 'bold',
    fontSize: '1em',
  },
});

export const DisplayName = () => {
  const classes = useStyles();
  return (
    <>
      <RichTextField source="display_name" className={classes.title} />
    </>
  );
};
