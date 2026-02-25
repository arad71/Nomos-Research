import { TextField } from 'react-admin';
import React from 'react';
import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles({
  title: {
    fontWeight: 'bold',
    fontSize: '1em',
  },
});

export const KingdomName = () => {
  const classes = useStyles();
  return (
    <>
      <TextField source="kingdom_name" className={classes.title} />
    </>
  );
};
