import React from 'react';
import { Box, Typography } from '@mui/material';
import {
  ChipField,
  ReferenceField,
  ReferenceManyField,
  SingleFieldList,
} from 'react-admin';

const TaxonNameInformalGroups = () => {
  return (
    <Box mt="1.2em">
      <Box mt="2.2em">
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Informal Groups
        </Typography>
      </Box>
      <ReferenceManyField
        reference="informal_groups"
        target="taxon_name_id"
        sort={{ field: 'informal_group_id', order: 'DESC' }}
      >
        <SingleFieldList linkType={false}>
          <ReferenceField
            source="classification_system_id"
            reference="classification_systems"
            link="show"
            allowEmpty
          >
            <ChipField source="class_desc" />
          </ReferenceField>
        </SingleFieldList>
      </ReferenceManyField>
    </Box>
  );
};

export default TaxonNameInformalGroups;
