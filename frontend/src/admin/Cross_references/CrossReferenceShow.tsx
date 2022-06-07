import React, { FC } from 'react';
import {
  ReferenceField,
  RichTextField,
  SelectField,
  SimpleShowLayout,
  TextField,
  BooleanField,
} from 'react-admin';
import { Show } from '@react-admin/ra-rbac';
import CrossRefType from './CrossRefType';
import Aside from '../shared/Aside';

export const CrossReferenceShow: FC = (props) => {
  return (
    <Show {...props} aside={<Aside />}>
      <SimpleShowLayout>
        <ReferenceField source="old_name_id" reference="taxon_names">
          <RichTextField source="formatted_scientific_name" />
        </ReferenceField>
        <ReferenceField source="new_name_id" reference="taxon_names">
          <RichTextField source="formatted_scientific_name" />
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
