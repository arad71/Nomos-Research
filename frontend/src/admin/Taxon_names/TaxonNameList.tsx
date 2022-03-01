// in src/users.js
import React, { FC } from 'react';
import {
  List,
  Datagrid,
  TextField,
  NumberField,
  DateField,
  EditButton,
  ReferenceField,
  useRecordContext,
} from 'react-admin';

const FullNameField = (props: any) => {
  const record = useRecordContext(props);

  return (
    <span>
      {record.first_name} {record.last_name}
    </span>
  );
};

FullNameField.defaultProps = { label: 'Name' };

export const TaxonNameList: FC = (props) => (
  <List {...props} sort={{ field: 'rank_name', order: 'DESC' }}>
    <Datagrid rowClick="show">
      <ReferenceField source="kingdom_id" reference="kingdoms">
        <TextField source="kingdom_name" />
      </ReferenceField>
      <ReferenceField source="rank_id" reference="taxon_ranks">
        <TextField source="rank_name" />
      </ReferenceField>
      <TextField source="rank_name" />
      <TextField source="uninomial" />
      <TextField source="phylum" />
      <TextField source="class" />
      <TextField source="order" />
      <TextField source="family" />
      <TextField source="genus" />
      <TextField source="sub_genus" />
      <TextField source="scientific_name" />
      <TextField source="species" />
      <TextField source="sub_species" />
      <TextField source="specific_epithet" />
      <TextField source="infraspecific_epithet" />
      <ReferenceField source="publication_id" reference="publications">
        <TextField source="publication_name" />
      </ReferenceField>
      <TextField source="volume_information" />
      <TextField source="is_current" />
      <TextField source="origin" />
      <TextField source="informal" />
      <NumberField source="form_desc_yr" />
      <NumberField source="form_desc_mn" />
      <NumberField source="form_desc_dy" />
      <TextField multiline source="comments" />
      <TextField source="contributed_by" />
      <DateField source="contributed_on" showTime />
      <TextField source="validated" />
      <TextField source="source" />
      <TextField source="external_id" />
      <TextField source="family_code" />
      <TextField source="author" />
      <TextField source="vernacular" />
      <TextField source="editor" />
      <TextField source="naturalised_status" />
      <TextField source="naturalised_certainty" />
      <TextField source="is_eradicated" />
      <TextField multiline source="naturalised_comments" />
      <NumberField source="linear_sequence" />
      <ReferenceField
        label="Family NID"
        source="family_nid"
        reference="taxon_names"
      >
        <TextField source="id" />
      </ReferenceField>
      <TextField multiline source="all_vernaculars" />
      <TextField multiline source="notes" />
      <DateField source="authorised_on" showTime />
      <ReferenceField source="created_by" reference="users">
        <FullNameField source="last_name" />
      </ReferenceField>
      <DateField source="created_on" showTime />
      <ReferenceField source="updated_by" reference="users">
        <FullNameField source="last_name" />
      </ReferenceField>
      <DateField source="updated_on" showTime />
      <EditButton />
    </Datagrid>
  </List>
);
