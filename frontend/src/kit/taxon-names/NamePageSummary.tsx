import { Box } from '@mui/material';
import React from 'react';
import NestedLinkField from '../shared/NestedLinkField';
import { FormattedScientificNameWithStatus } from './FormattedScientificNameWithStatus';

export const NamePageSummary = () => {
  return (
    <Box>
      <Box sx={{ fontSize: '1.5em', marginRight: '0.2em' }}>
        <FormattedScientificNameWithStatus />
      </Box>
      <NestedLinkField
        source="taxon_rank"
        reference="taxon_ranks"
        label="Taxon rank"
        sortBy="taxon_rank___rank_name"
        idKey="taxon_rank_id"
        labelKey="rank_name"
        className="text-base"
      />
    </Box>
  );
};
