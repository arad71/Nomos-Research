import React from 'react';
import {
  ReferenceField,
  RichTextField,
  SimpleShowLayout,
  TextField,
} from 'react-admin';

export const HierarchyShowLayout = () => (
  <SimpleShowLayout>
    <ReferenceField
      source="classification_system_id"
      reference="classification_systems"
      link="show"
    >
      <TextField source="class_desc" />
    </ReferenceField>
    <ReferenceField
      source="parent_nid"
      reference="taxon_names"
      label="Parent name"
      link="show"
    >
      <RichTextField source="formatted_scientific_name" />
    </ReferenceField>
    <ReferenceField source="taxon_name_id" reference="taxon_names" link="show">
      <RichTextField source="formatted_scientific_name" />
    </ReferenceField>
    <TextField source="path.path" />
  </SimpleShowLayout>
);
