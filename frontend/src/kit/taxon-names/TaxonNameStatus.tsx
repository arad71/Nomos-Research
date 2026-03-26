import { useRecordContext } from 'react-admin';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import React from 'react';
import { Tooltip } from '@mui/material';

export const TaxonNameStatus = () => {
  const record = useRecordContext();

  return record && record.is_current ? (
    <Tooltip title="This name is current">
      <CheckCircleIcon
        style={{ color: '#334e32', marginLeft: '5px', marginBottom: '8px' }}
        fontSize="small"
      />
    </Tooltip>
  ) : null;
};
