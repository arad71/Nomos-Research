import { RichTextField } from 'react-admin';
import React from 'react';
import { TaxonNameStatus } from './TaxonNameStatus';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  title: {
    fontWeight: 'bold',
    fontSize: '1em',
  },
});

export const FormattedScientificNameWithStatus = () => {
  const classes = useStyles();
  return (
    <>
      <RichTextField
        source="formatted_scientific_name"
        className={classes.title}
      />
      <TaxonNameStatus />
    </>
  );
};
