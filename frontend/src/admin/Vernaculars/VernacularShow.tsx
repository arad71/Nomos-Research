import React, { FC } from 'react';
import {
  NumberField,
  ReferenceField,
  RichTextField,
  SimpleShowLayout,
  SelectField,
  TextField,
  BooleanField,
} from 'react-admin';
import { Show } from '@react-admin/ra-rbac';
import Aside from '../shared/Aside';
import LanguageType from './LanguageType';

export const VernacularShow: FC = (props) => {
  return (
    <Show {...props} aside={<Aside />}>
      <SimpleShowLayout>
        <TextField source="vernacular" />
        <ReferenceField source="taxon_name_id" reference="taxon_names">
          <RichTextField source="formatted_scientific_name" />
        </ReferenceField>
        <SelectField source="language" choices={LanguageType} />
        <TextField source="lang_pref" />
        <BooleanField source="preferred" />
        <TextField source="source" />
        <TextField source="enabled" />
        <NumberField source="sort_order" />
      </SimpleShowLayout>
    </Show>
  );
};
