import React, { FC } from 'react';
import { useHistory } from 'react-router-dom';
import { TopToolbar } from 'react-admin';
import Button from '@material-ui/core/Button';
import VisibilityIcon from '@material-ui/icons/Visibility';

const PostEditActions: FC = () => {
  let history = useHistory();
  const viewSwitch = () => {
    let path = history.location.pathname;
    let tabPos = path.lastIndexOf('/');
    console.log(path);
    if (path.split('/').length - 1 == 2) {
      return path.concat('/show');
    } else {
      return path.slice(0, tabPos) + '/show' + path.slice(tabPos);
    }
  };
  const routeChange = () => history.push(`${viewSwitch()}`);
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
