import React, { FC } from 'react';
import { useHistory } from 'react-router-dom';
import { TopToolbar } from 'react-admin';
import { Button } from '@material-ui/core';
import CreateIcon from '@material-ui/icons/Create';

const PostShowActions: FC = () => {
  let history = useHistory();
  const viewSwitch = () => {
    let path = history.location.pathname;
    return path.replace('/show', '');
  };
  const routeChange = () => history.push(`${viewSwitch()}`);
  return (
    <TopToolbar>
      <Button
        style={{ fontSize: '0.8125rem', padding: '0px' }}
        color="primary"
        onClick={routeChange}
        startIcon={<CreateIcon />}
      >
        EDIT
      </Button>
    </TopToolbar>
  );
};

export default PostShowActions;
