import {
  Pagination,
  PaginationActions as RaPaginationActions,
} from 'react-admin';
import React from 'react';
import makeStyles from 'lib/makeStyles';

const useStyles = makeStyles({
  font: {
    fontFamily: 'Helvetica Neue',
  },
});

const PaginationActions = (props: any) => (
  <RaPaginationActions
    {...props}
    color="primary"
    showFirstButton
    showLastButton
  />
);

export const UserPagination = (props: any) => {
  const classes = useStyles(props);
  return (
    <Pagination
      classNames={classes.font}
      rowsPerPageOptions={[10, 25, 50, 100]}
      ActionsComponent={PaginationActions}
      {...props}
    />
  );
};
