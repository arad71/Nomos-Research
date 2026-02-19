import React, { FC } from 'react';
import {
  BooleanField,
  Datagrid,
  DateField,
  EditButton,
  ReferenceField,
  RichTextField,
  SelectField,
  TextField,
} from 'react-admin';
import CrossRefType from './CrossRefType';
import { List } from '@react-admin/ra-rbac';
import { CanAccess as IfCanAccess } from 'react-admin';
import { DefaultPagination, useCanBulkDelete } from '../shared';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { CrossReferenceFilters } from './CrossReferenceFilters';

export const CrossReferenceList: FC = (props) => (
  <List
    {...props}
    sort={{ field: 'updated_on', order: 'DESC' }}
    perPage={100}
    pagination={<DefaultPagination />}
    title="Related names"
    filters={CrossReferenceFilters()}
  >
    <Datagrid bulkActionButtons={useCanBulkDelete()} rowClick="show">
      <ReferenceField
        source="old_name_id"
        reference="taxon_names"
        sortBy="old_name___scientific_name"
        link="show"
      >
        <RichTextField source="formatted_scientific_name" />
      </ReferenceField>
      <ReferenceField
        source="new_name_id"
        reference="taxon_names"
        sortBy="new_name___scientific_name"
        link="show"
      >
        <RichTextField source="formatted_scientific_name" />
      </ReferenceField>
      <SelectField source="cross_reference_type" choices={CrossRefType} />
      <TextField source="authorised_by" />
      <TextField source="reference_comments" />
      <TextField source="notes" />
      <ReferenceField source="updated_by" reference="users" link="show">
        <TextField source="full_name" />
      </ReferenceField>
      <DateField source="updated_on" />
      <IfCanAccess resource="cross_references" action="viewdeleted">
        <BooleanField
          source="deleted"
          TrueIcon={DeleteIcon}
          FalseIcon={VisibilityIcon}
        />
      </IfCanAccess>
      <IfCanAccess resource="cross_references" action="edit">
        <EditButton />
      </IfCanAccess>
    </Datagrid>
  </List>
);
