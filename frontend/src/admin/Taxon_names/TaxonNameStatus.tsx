import { useRecordContext } from 'react-admin';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import green from '@material-ui/core/colors/green';
import React from 'react';
import { Tooltip } from '@material-ui/core';

export const TaxonNameStatus = () => {
  const record = useRecordContext();
  return record && record.is_current ? (
    <Tooltip title="This name is current">
      <CheckCircleIcon style={{ color: green[500] }} />
    </Tooltip>
  ) : null;
};
