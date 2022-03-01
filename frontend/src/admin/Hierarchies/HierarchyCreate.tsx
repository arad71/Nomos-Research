import React, { FC } from 'react';
import {Create, SimpleForm, SelectInput, ReferenceInput, required} from 'react-admin';

export const HierarchyCreate: FC = (props) => (
  <Create {...props}>
    <SimpleForm>
      <ReferenceInput
          source="taxon_name_id"
          reference="taxon_names"
          validate={required()}
      >
        <SelectInput optionText="rank_name" />
      </ReferenceInput>
      <ReferenceInput
        source="classification_system_id"
        reference="classification_systems"
      >
        <SelectInput optionText="class_desc" />
      </ReferenceInput>
      <ReferenceInput
          source="parent_nid"
          reference="taxon_names"
          validate={required()}
      >
        <SelectInput optionText="rank_name" />
      </ReferenceInput>
    </SimpleForm>
  </Create>
);
