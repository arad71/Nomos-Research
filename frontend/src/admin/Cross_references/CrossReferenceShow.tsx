import React, { FC } from 'react';
import {NumberField, ReferenceField, Show, SimpleShowLayout, TextField} from 'react-admin';

export const CrossReferenceShow: FC = (props) => {
  return (
    <Show {...props}>
      <SimpleShowLayout>
        <NumberField source="id" />
        <ReferenceField
            source="old_name_id"
            reference="taxon_names"
        >
          <TextField source="rank_name" />
        </ReferenceField>
        <ReferenceField
            source="new_name_id"
            reference="taxon_names"
        >
          <TextField source="rank_name" />
        </ReferenceField>
        <TextField source="cross_reference_type" />
        <TextField source="active" />
        <TextField source="authorised_by" />
        <TextField multiline source="comments" />
        <TextField multiline source="notes" />
      </SimpleShowLayout>
    </Show>
  );
};
