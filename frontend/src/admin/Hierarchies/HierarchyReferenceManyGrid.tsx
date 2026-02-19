import React from 'react';
import {
  Datagrid,
  ReferenceField,
  ReferenceManyField,
  RichTextField,
  TextField,
} from 'react-admin';
import { GlobalTheme } from '../../GlobalTheme';
import { EmbeddedHierarchyShow } from './EmbeddedHierarchyShow';

export const HierarchyReferenceManyGrid = (props: {
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
        field: 'preferred,sort_order,vernacular',
        order: 'ASC,ASC,ASC',
      }}
      {...props.props}
    >
      <Datagrid
        bulkActionButtons={false}
        className={globalClasses.equalColumnWidth}
        expand={<EmbeddedHierarchyShow />}
      >
        <ReferenceField
          source="parent_nid"
          label="Parent name"
          reference="taxon_names"
          link="show"
          sortBy="parent___scientific_name"
        >
          <RichTextField source="formatted_scientific_name" />
        </ReferenceField>
        <ReferenceField
          source="classification_system_id"
          reference="classification_systems"
          sortBy="classification_system___class_desc"
          link="show"
        >
          <TextField source="class_desc" />
        </ReferenceField>
      </Datagrid>
    </ReferenceManyField>
  );
};
