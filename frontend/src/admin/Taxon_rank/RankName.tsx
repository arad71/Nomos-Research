import { TextField } from 'react-admin';
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  title: {
    fontWeight: 'bold',
    fontSize: '1em',
  },
});

export const RankName = () => {
  const classes = useStyles();
  return (
    <>
      <TextField source="rank_name" className={classes.title} />
    </>
  );
};
