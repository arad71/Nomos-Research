import React, { FC } from 'react';
import {
  ReferenceField,
  SelectField,
  Show,
  SimpleShowLayout,
  TextField,
  BooleanField,
} from 'react-admin';
import CrossRefType from './CrossRefType';
import Aside from '../shared/Aside';

export const CrossReferenceShow: FC = (props) => {
  return (
    <Show {...props} aside={<Aside />}>
      <SimpleShowLayout>
        <ReferenceField source="old_name_id" reference="taxon_names">
          <TextField source="scientific_name" />
        </ReferenceField>
        <ReferenceField source="new_name_id" reference="taxon_names">
          <TextField source="scientific_name" />
        </ReferenceField>
        <SelectField source="cross_reference_type" choices={CrossRefType} />
        <BooleanField source="active" />
        <TextField source="authorised_by" />
        <TextField source="comments" />
        <TextField source="notes" />
      </SimpleShowLayout>
    </Show>
  );
};
