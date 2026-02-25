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
import { List } from '@react-admin/ra-rbac';
import { CanAccess as IfCanAccess } from 'react-admin';
import {
  DefaultPagination,
  selectableFilters,
  useCanBulkDelete,
} from '../shared';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

export const CitationList: FC = (props) => (
  <List
    {...props}
    sort={{ field: 'updated_on', order: 'DESC' }}
    perPage={100}
    pagination={<DefaultPagination />}
    filters={selectableFilters()}
  >
    <Datagrid bulkActionButtons={useCanBulkDelete()} rowClick="show">
      <ReferenceField
        source="taxon_name_id"
        reference="taxon_names"
        sortBy="taxon_name___scientific_name"
        link="show"
      >
        <RichTextField source="formatted_scientific_name" />
      </ReferenceField>
      <ReferenceField
        source="author_id"
        reference="authors"
        sortBy="author___display_name"
        link="show"
      >
        <TextField source="display_name" />
      </ReferenceField>
      <SelectField source="author_type" choices={AuthorType} />
      <NumberField source="author_order" />
      <ReferenceField source="updated_by" reference="users" link="show">
        <TextField source="full_name" />
      </ReferenceField>
      <DateField source="updated_on" />
      <IfCanAccess resource="citations" action="viewdeleted">
        <BooleanField
          source="deleted"
          TrueIcon={DeleteIcon}
          FalseIcon={VisibilityIcon}
        />
      </IfCanAccess>
      <IfCanAccess resource="citations" action="edit">
        <EditButton />
      </IfCanAccess>
    </Datagrid>
  </List>
);
