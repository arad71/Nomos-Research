import React, { FC } from 'react';
import {
  NumberField,
  ReferenceField,
  Show,
  SimpleShowLayout,
  TextField,
} from 'react-admin';

export const VernacularShow: FC = (props) => {
  return (
      <Show {...props}>
        <SimpleShowLayout>
          <NumberField source="id" />
          <TextField source="vernacular" />
          <ReferenceField
              source="taxon_name_id"
              reference="taxon_names"
          >
            <TextField source="rank_name" />
          </ReferenceField>
          <TextField source="language" />
          <TextField source="lang_pref" />
          <TextField source="preferred" />
          <TextField source="source" />
          <TextField source="enabled" />
          <NumberField source="sort_order" />
        </SimpleShowLayout>
      </Show>
  );
};
