import React, { FC } from 'react';
import {
  Edit,
  required,
  SimpleForm,
  TextInput,
  ReferenceInput,
  SelectInput, NumberInput,
} from 'react-admin';

export const TaxonRankEdit: FC = (props) => (
  <Edit {...props}>
    <SimpleForm>
      <NumberInput disabled source="id" />
      <ReferenceInput label="Kingdom" source="kingdom_id" reference="kingdoms">
        <SelectInput optionText="kingdom_name" />
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
  </Edit>
);
