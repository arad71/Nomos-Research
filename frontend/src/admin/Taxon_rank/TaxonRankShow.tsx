import React, { FC } from 'react';
import {
  NumberField,
  ReferenceField,
  required,
  SimpleShowLayout,
  SelectField,
  TextField,
  BooleanField,
} from 'react-admin';
import { Show } from '@react-admin/ra-rbac';
import Aside from '../shared/Aside';
import RankAbbreviation from './RankAbbreviation';

export const TaxonRankShow: FC = (props) => {
  return (
    <Show aside={<Aside />} {...props}>
      <SimpleShowLayout>
        <ReferenceField
          label="Kingdom"
          source="kingdom_id"
          reference="kingdoms"
        >
          <TextField source="kingdom_name" />
        </ReferenceField>
        <TextField source="rank_name" validate={[required()]} />
        <SelectField source="rank_abbrev" choices={RankAbbreviation} />
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
        <BooleanField source="uninomial" />
      </SimpleShowLayout>
    </Show>
  );
};
