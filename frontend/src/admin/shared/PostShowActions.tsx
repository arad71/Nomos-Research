import React, { FC } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TopToolbar } from 'react-admin';
import { Button } from '@mui/material';
import CreateIcon from '@mui/icons-material/Create';
import { IfCanAccess } from '@react-admin/ra-rbac';

const PostShowActions: FC = ({ ...props }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const viewSwitch = () => {
    const path = location.pathname;
    return path.replace('/show', '');
  };
  const routeChange = () => navigate(`${viewSwitch()}`);
  return (
    <TopToolbar>
      {/*@ts-ignore*/}
      <IfCanAccess resource={props.resource} action="edit">
        <Button
          style={{ fontSize: '0.8125rem', padding: '0px' }}
          color="primary"
          onClick={routeChange}
          startIcon={<CreateIcon />}
        >
          EDIT
        </Button>
      </IfCanAccess>
    </TopToolbar>
  );
};

export default PostShowActions;
