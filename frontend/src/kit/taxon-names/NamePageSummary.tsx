import { Box } from '@mui/material';
import React from 'react';
import makeStyles from 'lib/makeStyles';
import NestedLinkField from '../shared/NestedLinkField';
import { FormattedScientificNameWithStatus } from './FormattedScientificNameWithStatus';

const useStyles = makeStyles({
  title: {
    fontSize: '1.5em',
    marginRight: '0.2em',
  },
  titlePos: {
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
      <NestedLinkField
        source="taxon_rank"
        reference="taxon_ranks"
        label="Taxon rank"
        sortBy="taxon_rank___rank_name"
        idKey="taxon_rank_id"
        labelKey="rank_name"
        className={classes.subtitle}
      />
    </Box>
  );
};
