import React, { FC } from 'react';
import {
  NumberField,
  ReferenceField,
  Show,
  SimpleShowLayout,
  TextField,
} from 'react-admin';
import Aside from '../shared/Aside';

export const VernacularShow: FC = (props) => {
  return (
    <Show {...props} aside={<Aside />}>
      <SimpleShowLayout>
        <TextField source="vernacular" />
        <ReferenceField source="taxon_name_id" reference="taxon_names">
          <TextField source="scientific_name" />
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
