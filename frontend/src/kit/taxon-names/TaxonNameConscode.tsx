import React from 'react';
import { Box, Typography } from '@mui/material';
import {
  ReferenceField,
  ReferenceManyField,
  SingleFieldList,
} from 'react-admin';
import {
  ConservationShortPill,
  ConservationShortPillAdd,
} from '../conservation-codes/ConservationShort';

const TaxonNameConscode = () => {
  return (
    <Box mt="1.2em">
      <Box mt="2.2em">
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Conservation Code
        </Typography>
      </Box>
      <>
        <ReferenceManyField
          reference="conscode_taxons"
          target="taxon_name_id"
          sort={{
            field: 'conservation_code___code_priority',
            order: 'ASC',
          }}
          filter={{ effective_to: null }}
        >
          <SingleFieldList>
            <ReferenceField
              source="conservation_code_id"
              reference="conservation_codes"
              link={false}
              allowEmpty
            >
              <ConservationShortPill source="record.conservation_code_id" />
            </ReferenceField>
          </SingleFieldList>
        </ReferenceManyField>
        <ConservationShortPillAdd />
      </>
    </Box>
  );
};

export default TaxonNameConscode;
