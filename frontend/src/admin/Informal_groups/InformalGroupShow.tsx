import React, { FC } from 'react';
import { ReferenceField, Show, SimpleShowLayout, TextField } from 'react-admin';
import Aside from "../shared/Aside";

export const InformalGroupShow: FC = (props) => {
  return (
    <Show aside={<Aside />} {...props}>
      <SimpleShowLayout>
        <ReferenceField
          source="classification_system_id"
          reference="classification_systems"
        >
          <TextField source="class_desc" />
        </ReferenceField>
        <ReferenceField source="taxon_name_id" reference="taxon_names">
          <TextField source="scientific_name" />
        </ReferenceField>
      </SimpleShowLayout>
    </Show>
  );
};
