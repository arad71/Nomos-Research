import React, { FC } from 'react';
import {
  Edit,
  NumberInput,
  ReferenceInput,
  required,
  SelectInput,
  SimpleForm,
} from 'react-admin';
import AuthorType from './AuthorType';
import Aside from '../shared/Aside';

export const CitationEdit: FC = (props) => (
  <Edit {...props} aside={<Aside />}>
    <SimpleForm>
      <ReferenceInput
        source="taxon_name_id"
        reference="taxon_names"
        validate={required()}
      >
        <SelectInput optionText="scientific_name" />
      </ReferenceInput>
      <ReferenceInput
        source="author_id"
        reference="authors"
        validate={required()}
      >
        <SelectInput optionText="author" />
      </ReferenceInput>
      <SelectInput source="author_type" choices={AuthorType} />
      <NumberInput
        source="author_order"
        validate={required()}
        initialValue={0}
      />
    </SimpleForm>
  </Edit>
);
