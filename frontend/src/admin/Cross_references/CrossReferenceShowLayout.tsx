import {
  BooleanField,
  ReferenceField,
  SelectField,
  SimpleShowLayout,
  TextField,
} from 'react-admin';
import { FormattedScientificNameWithStatus } from '../Taxon_names';
import CrossRefType from './CrossRefType';
import React from 'react';

export const CrossReferenceShowLayout = () => (
  <SimpleShowLayout>
    <ReferenceField source="old_name_id" reference="taxon_names" link="show">
      <FormattedScientificNameWithStatus />
    </ReferenceField>
    <ReferenceField source="new_name_id" reference="taxon_names" link="show">
      <FormattedScientificNameWithStatus />
    </ReferenceField>
    <SelectField source="cross_reference_type" choices={CrossRefType} />
    <BooleanField source="active" />
    <TextField source="authorised_by" />
    <TextField source="comments" />
    <TextField source="notes" />
  </SimpleShowLayout>
);
