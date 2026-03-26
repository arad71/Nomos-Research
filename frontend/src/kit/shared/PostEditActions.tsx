import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TopToolbar,
  useCreatePath,
  useRecordContext,
  useResourceContext,
} from 'react-admin';
import Button from '@mui/material/Button';
import VisibilityIcon from '@mui/icons-material/Visibility';

interface PostEditActionsProps {
  resource?: string;
}

const PostEditActions: FC<PostEditActionsProps> = (props) => {
  const navigate = useNavigate();
  const createPath = useCreatePath();
  const record = useRecordContext();
  const resource = useResourceContext(props);

  const routeChange = () => {
    if (!resource || record?.id == null) {
      return;
    }
    navigate(createPath({ resource, id: record.id, type: 'show' }));
  };

  return (
    <TopToolbar>
      <Button
        variant="outlined"
        color="primary"
        onClick={routeChange}
        disabled={!resource || record?.id == null}
        startIcon={<VisibilityIcon />}
        sx={{
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 600,
        }}
      >
        Show
      </Button>
    </TopToolbar>
  );
};

export default PostEditActions;
