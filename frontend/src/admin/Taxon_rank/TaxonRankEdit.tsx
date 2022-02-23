import React, { FC } from 'react';
import {
  Edit, required,
  SimpleForm,
  TextInput,
  NumberInput, ReferenceInput, SelectInput
} from 'react-admin';

export const TaxonRankEdit: FC = (props) => (
  <Edit {...props}>
    <SimpleForm>
      <ReferenceInput label="Kingdom" source="kingdom_id" reference="kingdoms">
        <SelectInput optionText="kingdom_name" />
      </ReferenceInput>
      <TextInput source="rank_name" validate={[required()]} />
      <TextInput source="rank_abbrev" />
      <NumberInput source="direct_parent_rank_id" />
      <ReferenceInput
        label="Req Parent Rank"
        source="taxon_rank_id"
        reference="taxon_ranks"
      >
        <SelectInput optionText="taxon_rank_id" />
      </ReferenceInput>
    </SimpleForm>
  </Edit>
);
