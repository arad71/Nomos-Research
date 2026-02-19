import React, { FC } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TopToolbar } from 'react-admin';
import Button from '@mui/material/Button';
import VisibilityIcon from '@mui/icons-material/Visibility';

const PostEditActions: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const viewSwitch = () => {
    const path = location.pathname;
    const tabPos = path.lastIndexOf('/');
    if (path.split('/').length - 1 === 2) {
      return path.concat('/show');
    }
    return path.slice(0, tabPos) + '/show' + path.slice(tabPos);
  };
  const routeChange = () => navigate(`${viewSwitch()}`);
  return (
    <TopToolbar>
      <Button
        style={{ fontSize: '0.8125rem', padding: '0px' }}
        color="primary"
        onClick={routeChange}
        startIcon={<VisibilityIcon />}
      >
        SHOW
      </Button>
    </TopToolbar>
  );
};

export default PostEditActions;
