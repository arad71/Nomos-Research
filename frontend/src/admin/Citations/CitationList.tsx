import React, { FC } from 'react';
import {
  BooleanField,
  Datagrid,
  DateField,
  EditButton,
  NumberField,
  ReferenceField,
  RichTextField,
  SelectField,
  TextField,
} from 'react-admin';
import AuthorType from './AuthorType';
import { WithPermissions, List } from '@react-admin/ra-rbac';
import {
  DefaultPagination,
  selectableFilters,
  useCanBulkDelete,
} from '../shared';
import { Label } from '@material-ui/icons';

export const CitationList: FC = (props) => (
  <List
    {...props}
    sort={{ field: 'updated_on', order: 'DESC' }}
    perPage={100}
    pagination={<DefaultPagination />}
    bulkActionButtons={useCanBulkDelete()}
    filters={selectableFilters()}
  >
    <Datagrid rowClick="show">
      <ReferenceField
        source="taxon_name_id"
        reference="taxon_names"
        sortBy="taxon_name___scientific_name"
      >
        <RichTextField source="formatted_scientific_name" />
      </ReferenceField>
      <ReferenceField
        source="author_id"
        reference="authors"
        sortBy="author___display_name"
      >
        <TextField source="display_name" />
      </ReferenceField>
      <SelectField source="author_type" choices={AuthorType} />
      <NumberField source="author_order" />
      <ReferenceField source="updated_by" reference="users">
        <TextField source="full_name" />
      </ReferenceField>
      <DateField source="updated_on" />
      <WithPermissions resource="citations" action="harddelete">
        <BooleanField source="deleted" />
      </WithPermissions>
      <WithPermissions resource="citations" action="edit">
        <EditButton />
      </WithPermissions>
    </Datagrid>
  </List>
);
