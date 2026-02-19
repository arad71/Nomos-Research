import { TextField } from 'react-admin';
import React from 'react';
import makeStyles from 'lib/makeStyles';
import { GlobalTheme } from '../../GlobalTheme';

const useStyles = makeStyles({
  title: {
    fontWeight: 'bold',
    fontSize: '1em',
  },
});

export const DisplayName = () => {
  const classes = useStyles();
  const globalClasses = GlobalTheme();

  return (
    <>
      <TextField
        source="display_name"
        className={`${classes.title} ${globalClasses.titleTruncation}`}
      />
    </>
  );
};
