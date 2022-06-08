import React, { FC } from 'react';
import {
  RichTextField,
  ReferenceField,
  SimpleShowLayout,
  TextField,
} from 'react-admin';
import { Show } from '@react-admin/ra-rbac';
import Aside from '../shared/Aside';

export const HierarchyShow: FC = (props) => {
  return (
    <Show aside={<Aside />} {...props}>
      <SimpleShowLayout>
        <ReferenceField source="taxon_name_id" reference="taxon_names">
          <RichTextField source="formatted_scientific_name" />
        </ReferenceField>
        <ReferenceField
          source="classification_system_id"
          reference="classification_systems"
        >
          <TextField source="class_desc" />
        </ReferenceField>
        <ReferenceField source="parent_nid" reference="taxon_names">
          <RichTextField source="formatted_scientific_name" />
        </ReferenceField>
      </SimpleShowLayout>
    </Show>
  );
};
