import React, { FC } from 'react';
import {
  NumberField, NumberInput,
  ReferenceField,
  required,
  Show,
  SimpleShowLayout,
  TextField,
} from 'react-admin';
import Aside from "../shared/Aside";

export const TaxonRankShow: FC = (props) => {
  return (
    <Show aside={<Aside />} {...props}>
      <SimpleShowLayout>
        <NumberField source="id" />
        <ReferenceField
          label="Kingdom"
          source="kingdom_id"
          reference="kingdoms"
        >
          <TextField source="kingdom_name" />
        </ReferenceField>
        <TextField source="rank_name" validate={[required()]} />
        <TextField source="rank_abbrev" />
        <ReferenceField
          label="Direct Parent Rank"
          source="direct_parent_rank_id"
          reference="taxon_ranks"
        >
          <NumberField source="rank_name" />
        </ReferenceField>
        <ReferenceField
          label="Req Parent Rank"
          source="required_parent_rank_id"
          reference="taxon_ranks"
        >
          <NumberField source="rank_name" />
        </ReferenceField>
      </SimpleShowLayout>
    </Show>
  );
};
