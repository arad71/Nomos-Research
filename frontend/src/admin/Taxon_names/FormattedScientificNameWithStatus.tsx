import { RichTextField } from 'react-admin';
import React from 'react';
import { TaxonNameStatus } from './TaxonNameStatus';
import { makeStyles } from '@material-ui/core/styles';
import { GlobalTheme } from '../../GlobalTheme';
import { InfragengerenicData } from './TaxonTypes';

const useStyles = makeStyles({
  title: {
    fontWeight: 'bold',
    fontSize: '1em',
  },
});

export const FormattedScientificNameWithStatus = (
  infragenus?: InfragengerenicData | {}
) => {
  const classes = useStyles();
  const globalClasses = GlobalTheme();
  return (
    <>
      <span className={globalClasses.titleTruncation}>
        <RichTextField
          source="formatted_scientific_name"
          className={classes.title}
        />
        {infragenus && (
          // @ts-ignore
          <span className={classes.title}>({infragenus?.formatted_name})</span>
        )}
      </span>
      <TaxonNameStatus />
    </>
  );
};
