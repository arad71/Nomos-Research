// in src/users.js
import React, { FC } from 'react';
import {
  NumberField,
  SelectField,
  List,
  Datagrid,
  TextField,
  EditButton,
  ReferenceField,
  useRecordContext,
} from 'react-admin';
import AuthorType from './AuthorType';

const FullNameField = (props: any) => {
  const record = useRecordContext(props);

  return (
    <span>
      {record.first_name} {record.last_name}
    </span>
  );
};

FullNameField.defaultProps = { label: 'Name' };

export const CitationList: FC = (props) => (
  <List {...props} sort={{ field: 'kingdom_name', order: 'DESC' }}>
    <Datagrid rowClick="show">
      <ReferenceField source="taxon_name_id" reference="taxon_names">
        <TextField source="rank_name" />
      </ReferenceField>
      <ReferenceField source="author_id" reference="authors">
        <TextField source="author" />
      </ReferenceField>
      <SelectField source="author_type" choices={AuthorType} />
      <NumberField source="author_order" />
      <ReferenceField source="created_by" reference="users">
        <FullNameField source="last_name" />
      </ReferenceField>
      <TextField source="created_on" />
      <ReferenceField source="updated_by" reference="users">
        <FullNameField source="last_name" />
      </ReferenceField>
      <TextField source="updated_on" />
      <EditButton />
    </Datagrid>
  </List>
);
