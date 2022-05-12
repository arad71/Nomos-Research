import React from 'react';
import { Box, Card } from '@material-ui/core';
import {
  DateField,
  ReferenceField,
  SimpleShowLayout,
  TextField,
} from 'react-admin';
import TaxonHierarchy from '../Taxon_names/TaxonHierarchy';
import { useLocation } from 'react-router-dom';

const Aside = () => {
  const location = useLocation();
  const currPath = location.pathname.split('/')[1];
  const isTaxonNames = currPath == 'taxon_names';
  return (
    <Box m="0 0 1em 1em">
      <Card>
        <SimpleShowLayout>
          <TextField source="id" />
          <ReferenceField source="created_by" reference="users" label="Created">
            <TextField source="full_name" />
          </ReferenceField>
          <DateField source="created_on" showTime />
          <ReferenceField source="updated_by" reference="users">
            <TextField source="full_name" />
          </ReferenceField>
          <DateField source="updated_on" showTime />
        </SimpleShowLayout>
      </Card>
      {isTaxonNames && <TaxonHierarchy />}
    </Box>
  );
};

export default Aside;
