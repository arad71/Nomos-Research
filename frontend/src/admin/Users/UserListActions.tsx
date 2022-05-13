import * as React from 'react';

import { TopToolbar, CreateButton } from 'react-admin';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  text: {
    fontFamily: 'Helvetica Neue',
  },
  buttons: {
    borderRadius: '20px',
    paddingRight: '0.8em',
  },
  create: {
    backgroundColor: 'rgba(44, 84, 49, 1)',
    color: '#FFFFFF',
    '&:hover': {
      backgroundColor: 'rgba(44, 84, 49, .8)',
    },
  },
});

export const UserListActions = (props: any) => {
  const classes = useStyles();
  return (
    <TopToolbar className={classes.text}>
      <CreateButton
        label="Add a new user"
        icon=""
        className={classes.create + ' ' + classes.buttons}
      />
    </TopToolbar>
  );
};
