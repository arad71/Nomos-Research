import React, { FC } from 'react';
import {
  Create,
  SimpleForm,
  TextField,
  NumberField,
  required,
  ReferenceField,
} from 'react-admin';

export const TaxonRankCreate: FC = (props) => (
  <Create {...props}>
    <SimpleForm>
      <ReferenceField label="Kingdom" source="kingdom_id" reference="kingdoms">
        <TextField source="kingdom_name" />
      </ReferenceField>
      <TextField source="rank_name" validate={[required()]} />
      <TextField source="rank_abbrev" />
      <NumberField source="direct_parent_rank_id" />
      <ReferenceField
        label="Req Parent Rank"
        source="taxon_rank_id"
        reference="taxon_ranks"
      >
        <NumberField source="taxon_rank_id" />
      </ReferenceField>
    </SimpleForm>
  </Create>
);
