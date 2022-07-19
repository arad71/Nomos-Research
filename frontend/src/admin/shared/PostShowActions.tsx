import React, { FC } from 'react';
import { useHistory } from 'react-router-dom';
import { TopToolbar } from 'react-admin';
import { Button } from '@material-ui/core';
import CreateIcon from '@material-ui/icons/Create';
import { WithPermissions } from '@react-admin/ra-rbac';

const PostShowActions: FC = ({ ...props }) => {
  let history = useHistory();
  const viewSwitch = () => {
    let path = history.location.pathname;
    return path.replace('/show', '');
  };
  const routeChange = () => history.push(`${viewSwitch()}`);
  return (
    <TopToolbar>
      {/*@ts-ignore*/}
      <WithPermissions resource={props.resource} action="edit">
        <Button
          style={{ fontSize: '0.8125rem', padding: '0px' }}
          color="primary"
          onClick={routeChange}
          startIcon={<CreateIcon />}
        >
          EDIT
        </Button>
      </WithPermissions>
    </TopToolbar>
  );
};

export default PostShowActions;
