import { TextField } from 'react-admin';
import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import { Label, TextFields } from '@mui/icons-material';
import { ConservationShort } from './ConservationShort';

const useStyles = makeStyles({
  title: {
    fontWeight: 'bold',
    fontSize: '1em',
  },
});

export const ConservationDescription = () => {
  const classes = useStyles();
  return (
    <>
      <ConservationShort source="conservation_code_id" />
    </>
  );
};
