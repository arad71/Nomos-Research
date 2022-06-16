import {
  ReferenceInput,
  required,
  SelectInput,
  SimpleForm,
  TextInput,
  BooleanInput,
} from 'react-admin';
import React, { FC } from 'react';
import RankAbbreviation from './RankAbbreviation';

export const TaxonRankCreateEdit: FC = (props) => (
  <SimpleForm {...props} warnWhenUnsavedChanges>
    <ReferenceInput label="Kingdom" source="kingdom_id" reference="kingdoms">
      <SelectInput optionText="kingdom_name" validate={[required()]} />
    </ReferenceInput>
    <TextInput source="rank_name" validate={[required()]} />
    <SelectInput source="rank_abbrev" choices={RankAbbreviation} />
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
    <BooleanInput source="uninomial" defaultValue={false} />
  </SimpleForm>
);
