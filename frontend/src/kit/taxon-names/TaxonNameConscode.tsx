import React from 'react';
import { Box, Typography } from '@mui/material';
import {
  FunctionField,
  ReferenceField,
  ReferenceManyField,
  SingleFieldList,
} from 'react-admin';
import {
  ConservationShort,
  ConservationShortPillAdd,
} from '../conservation-codes/ConservationShort';

const pillStyle = {
  background: 'rgba(44, 83, 49, 0.2)',
  borderRadius: '1rem',
  padding: '0.3rem 1rem',
  marginRight: '0.3rem',
  textWrap: 'nowrap' as const,
};

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
              <div style={pillStyle}>
                <FunctionField
                  label="test"
                  render={() => (
                    <ConservationShort source="record.conservation_code_id" />
                  )}
                />
              </div>
            </ReferenceField>
          </SingleFieldList>
        </ReferenceManyField>
        <ConservationShortPillAdd />
      </>
    </Box>
  );
};

export default TaxonNameConscode;
