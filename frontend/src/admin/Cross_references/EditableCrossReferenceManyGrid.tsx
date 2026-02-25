import React from 'react';
import {
  ReferenceField,
  ReferenceManyField,
  SelectField,
  TextField,
  usePermissions,
} from 'react-admin';
import { EmbeddedCrossReferenceShow } from './EmbeddedCrossReferenceShow';

import CrossRefType from './CrossRefType';
import { FormattedScientificNameWithStatus } from '../Taxon_names';
import { GlobalTheme } from '../../GlobalTheme';
import { CrossReferenceRowForm } from './CrossReferenceRowForm';
import { EditableDatagrid } from '@react-admin/ra-editable-datagrid';
import { canAccess } from '@react-admin/ra-rbac';

export const EditableCrossReferenceManyGrid = (props: {
  source: string;
  target: string;
  label: string;
  props: React.PropsWithChildren<{}>;
  createInitialValues: object;
}) => {
  const globalClasses = GlobalTheme();
  const createInitialValues = props.createInitialValues;
  const { isLoading, permissions } = usePermissions();
  if (isLoading) return null;

  return (
    <ReferenceManyField
      reference="cross_references"
      target={props.target}
      {...props.props}
    >
      <EditableDatagrid
        mutationMode="pessimistic"
        bulkActionButtons={false}
        createForm={
          <CrossReferenceRowForm
            initialValues={createInitialValues}
            {...props}
          />
        }
        editForm={<CrossReferenceRowForm {...props} />}
        hasCreate
        expand={<EmbeddedCrossReferenceShow />}
        noDelete={
          !canAccess({
            permissions,
            action: 'delete',
            resource: 'cross_references',
          })
        }
      >
        <SelectField source="cross_reference_type" choices={CrossRefType} />
        <ReferenceField
          source={props.source}
          reference="taxon_names"
          sortBy="cross_reference_type"
          link="show"
        >
          <FormattedScientificNameWithStatus />
        </ReferenceField>
        <TextField source="reference_comments" />
      </EditableDatagrid>
    </ReferenceManyField>
  );
};
