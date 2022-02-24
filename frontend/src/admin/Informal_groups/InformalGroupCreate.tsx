import React, { FC } from 'react';
import { Create, SimpleForm, SelectInput, ReferenceInput } from 'react-admin';

export const InformalGroupCreate: FC = (props) => (
  <Create {...props}>
    <SimpleForm>
      <ReferenceInput
        source="classification_system_id"
        reference="classification_systems"
      >
        <SelectInput optionText="class_desc" />
      </ReferenceInput>
      <ReferenceInput source="taxon_name_id" reference="taxon_names">
        <SelectInput optionText="rank_name" />
      </ReferenceInput>
    </SimpleForm>
  </Create>
);
