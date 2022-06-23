import { Box } from '@material-ui/core';
// eslint-disable-next-line max-len
import { FormattedScientificNameWithStatus } from './FormattedScientificNameWithStatus';
import { ReferenceField, TextField } from 'react-admin';
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
const useStyles = makeStyles({
  title: {
    fontSize: '1.5em',
    marginRight: '0.2em',
  },
  titlePos: {
    position: 'absolute',
    top: '65px',
  },
  subtitle: {
    fontSize: '1em',
  },
});
export const NamePageSummary = () => {
  const classes = useStyles();
  return (
    <Box className={classes.titlePos}>
      <Box className={classes.title}>
        <FormattedScientificNameWithStatus />
      </Box>
      <ReferenceField source="rank_id" reference="taxon_ranks" link={false}>
        <TextField source="rank_name" className={classes.subtitle} />
      </ReferenceField>
    </Box>
  );
};
