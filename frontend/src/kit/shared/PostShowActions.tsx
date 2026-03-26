import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TopToolbar,
  useCreatePath,
  useRecordContext,
  useResourceContext,
} from 'react-admin';
import { Button } from '@mui/material';
import CreateIcon from '@mui/icons-material/Create';
import { CanAccess as IfCanAccess } from 'react-admin';

interface PostShowActionsProps {
  resource?: string;
}

const PostShowActions: FC<PostShowActionsProps> = ({ ...props }) => {
  const navigate = useNavigate();
  const createPath = useCreatePath();
  const record = useRecordContext(props);
  const resource = useResourceContext(props);

  const routeChange = () => {
    if (!resource || record?.id == null) {
      return;
    }
    navigate(createPath({ resource, id: record.id, type: 'edit' }));
  };

  return (
    <TopToolbar>
      {/* @ts-ignore */}
      <IfCanAccess resource={resource} action="edit">
        <Button
          variant="outlined"
          color="primary"
          onClick={routeChange}
          disabled={!resource || record?.id == null}
          startIcon={<CreateIcon />}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Edit
        </Button>
      </IfCanAccess>
    </TopToolbar>
  );
};

export default PostShowActions;
