import React, { FC } from 'react';
import {
  NumberField,
  ReferenceField,
  SelectField,
  Show,
  SimpleShowLayout,
  TextField,
} from 'react-admin';
import CrossRefType from './CrossRefType';

export const CrossReferenceShow: FC = (props) => {
  return (
    <Show {...props}>
      <SimpleShowLayout>
        <NumberField source="id" />
        <ReferenceField source="old_name_id" reference="taxon_names">
          <TextField source="rank_name" />
        </ReferenceField>
        <ReferenceField source="new_name_id" reference="taxon_names">
          <TextField source="rank_name" />
        </ReferenceField>
        <SelectField source="cross_reference_type" choices={CrossRefType} />
        <TextField source="active" />
        <TextField source="authorised_by" />
        <TextField source="comments" />
        <TextField source="notes" />
      </SimpleShowLayout>
    </Show>
  );
};
