import React from 'react';
import {
  BooleanField,
  Datagrid,
  NumberField,
  ReferenceManyField,
  SelectField,
  TextField,
} from 'react-admin';
import { GlobalTheme } from '../../GlobalTheme';

import LanguageType from './LanguageType';
import { EmbeddedVernacularShow } from './EmbeddedVernacularShow';

export const VernacularReferenceManyGrid = (props: {
  target: string;
  label: string;
  props: React.PropsWithChildren<{}>;
}) => {
  const globalClasses = GlobalTheme();
  return (
    <ReferenceManyField
      fullWidth
      label="Vernaculars"
      reference="vernaculars"
      target={props.target}
      sort={{
        field: 'preferred,sort_order,vernacular_name',
        order: 'ASC,ASC,ASC',
      }}
      empty="No vernacular name exists"
      {...props.props}
    >
      <Datagrid
        className={globalClasses.equalColumnWidth}
        expand={<EmbeddedVernacularShow />}
      >
        <TextField source="vernacular_name" />
        <SelectField source="language" choices={LanguageType} />
        <BooleanField source="lang_pref" label="Preferred language" />
        <BooleanField source="preferred" />
        <NumberField source="sort_order" />
      </Datagrid>
    </ReferenceManyField>
  );
};
