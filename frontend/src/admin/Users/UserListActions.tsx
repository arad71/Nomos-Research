import * as React from 'react';
import { CanAccess as IfCanAccess } from 'react-admin';

import { TopToolbar, CreateButton } from 'react-admin';
import makeStyles from 'lib/makeStyles';

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
      <IfCanAccess action="create" resource="users">
        <CreateButton
          label="Add a new user"
          className={classes.create + ' ' + classes.buttons}
        />
      </IfCanAccess>
    </TopToolbar>
  );
};
