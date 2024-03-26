import { TextField } from 'react-admin';
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Label, TextFields } from '@material-ui/icons';
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
