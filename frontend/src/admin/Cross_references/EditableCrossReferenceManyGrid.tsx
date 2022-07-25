import React from 'react';
import {
  ReferenceField,
  ReferenceManyField,
  SelectField,
  TextField,
} from 'react-admin';
import { EmbeddedCrossReferenceShow } from './EmbeddedCrossReferenceShow';

import CrossRefType from './CrossRefType';
import { FormattedScientificNameWithStatus } from '../Taxon_names';
import { GlobalTheme } from '../../GlobalTheme';
import { CrossReferenceRowForm } from './CrossReferenceRowForm';
import { EditableDatagrid } from '@react-admin/ra-editable-datagrid';

export const EditableCrossReferenceManyGrid = (props: {
  source: string;
  target: string;
  label: string;
  props: React.PropsWithChildren<{}>;
  createInitialValues: object;
}) => {
  const globalClasses = GlobalTheme();
  const createInitialValues = props.createInitialValues;
  return (
    <ReferenceManyField
      reference="cross_references"
      target={props.target}
      {...props.props}
    >
      <EditableDatagrid
        undoable
        createForm={
          <CrossReferenceRowForm
            initialValues={createInitialValues}
            {...props}
          />
        }
        editForm={<CrossReferenceRowForm {...props} />}
        hasCreate
        expand={<EmbeddedCrossReferenceShow />}
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
