import React, { FC } from 'react';
import {
  Datagrid,
  DateField,
  EditButton,
  NumberField,
  ReferenceField,
  RichTextField,
  SelectField,
  TextField,
  BooleanField,
} from 'react-admin';
import LanguageType from './LanguageType';
import { List, IfCanAccess } from '@react-admin/ra-rbac';
import {
  DefaultPagination,
  selectableFilters,
  useCanBulkDelete,
} from '../shared';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

export const VernacularList: FC = (props) => (
  <List
    {...props}
    sort={{ field: 'taxon_name___scientific_name' }}
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
      <TextField source="vernacular_name" />
      <SelectField source="language" choices={LanguageType} />
      <BooleanField source="lang_pref" />
      <BooleanField source="preferred" />
      <TextField source="source" />
      <NumberField source="sort_order" />
      <ReferenceField source="updated_by" reference="users" link="show">
        <TextField source="full_name" />
      </ReferenceField>
      <DateField source="updated_on" />
      <IfCanAccess resource="vernaculars" action="viewdeleted">
        <BooleanField
          source="deleted"
          TrueIcon={DeleteIcon}
          FalseIcon={VisibilityIcon}
        />
      </IfCanAccess>
      <IfCanAccess resource="vernaculars" action="edit">
        <EditButton />
      </IfCanAccess>
    </Datagrid>
  </List>
);
