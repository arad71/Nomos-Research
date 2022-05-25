import React, { FC } from 'react';
import {
  Datagrid,
  DateField,
  EditButton,
  List,
  ReferenceField,
  RichTextField,
  TextField,
  BooleanField,
} from 'react-admin';
import { WithPermissions } from '@react-admin/ra-rbac';

export const PublicationList: FC = (props) => (
  <List {...props} sort={{ field: 'updated_on', order: 'DESC' }}>
    <Datagrid rowClick="show">
      <TextField source="id" />
      <TextField source="abbreviated_title" />
      <BooleanField source="bad_publication" />
      <TextField source="publication_name" />
      <TextField source="doi" />
      <TextField source="title" />
      <TextField source="display_title" />
      <TextField source="publication_year" />
      <TextField source="publication_month" />
      <TextField source="publication_day" />
      <TextField source="volume" />
      <TextField source="edition" />
      <TextField source="pages" />
      <TextField source="verbatim_reference" />
      <TextField source="verbatim_citation" />
      <TextField source="verbatim_author" />
      <TextField source="citation" />
      <RichTextField source="citation_html" />
      <TextField source="citation_author_year" />
      <TextField source="notes" />
      <TextField source="published" />
      <TextField source="publisher" />
      <TextField source="published_location" />
      <TextField source="published_date" />
      <TextField source="isbn" />
      <TextField source="issn" />
      <TextField source="bhl_url" />
      <TextField source="tl2" />
      <TextField source="reference_type" />
      <ReferenceField
        label="Parent"
        source="parent_id"
        reference="publications"
      >
        <TextField source="publication" />
      </ReferenceField>
      <TextField source="reference_author_role" />
      <TextField source="language" />
      <ReferenceField
        label="Duplicate Of"
        source="duplicate_of_id"
        reference="publications"
      >
        <TextField source="publication" />
      </ReferenceField>
      <DateField source="created_on" showTime />
      <ReferenceField source="updated_by" reference="users">
        <TextField source="full_name" />
      </ReferenceField>
      <DateField source="updated_on" showTime />
      <WithPermissions resource="publications" action="edit">
        <EditButton />
      </WithPermissions>
    </Datagrid>
  </List>
);
