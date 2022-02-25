import React, { FC } from 'react';
import {
  Create,
  SimpleForm,
  TextInput,
  required,
  ReferenceInput,
  SelectInput,
} from 'react-admin';

export const TaxonRankCreate: FC = (props) => (
  <Create {...props}>
    <SimpleForm>
      <ReferenceInput label="Kingdom" source="kingdom_id" reference="kingdoms">
        <SelectInput optionText="kingdom_name" validate={[required()]} />
      </ReferenceInput>
      <TextInput source="rank_name" validate={[required()]} />
      <TextInput source="rank_abbrev" />
      <ReferenceInput
        label="Direct Parent Rank"
        source="direct_parent_rank_id"
        reference="taxon_ranks"
      >
        <SelectInput optionText="rank_name" />
      </ReferenceInput>
      <ReferenceInput
        label="Req Parent Rank"
        source="required_parent_rank_id"
        reference="taxon_ranks"
      >
        <SelectInput optionText="rank_name" />
      </ReferenceInput>
    </SimpleForm>
  </Create>
);
