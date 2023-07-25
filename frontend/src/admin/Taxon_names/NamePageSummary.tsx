import { Box } from '@material-ui/core';
// eslint-disable-next-line max-len
import { FormattedScientificNameWithStatus } from './FormattedScientificNameWithStatus';
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import NestedLinkField from '../shared/NestedLinkField';
import { InfragengerenicData } from './TaxonTypes';
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
export const NamePageSummary = (infragenus?: InfragengerenicData | {}) => {
  const classes = useStyles();
  return (
    <Box className={classes.titlePos}>
      <Box className={classes.title}>
        {/* @ts-ignore */}
        <FormattedScientificNameWithStatus infragenus={infragenus} />
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
