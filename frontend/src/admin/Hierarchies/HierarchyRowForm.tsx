import { RowForm, RowFormProps } from '@react-admin/ra-editable-datagrid';
import {
  FormDataConsumer,
  ReferenceInput,
  required,
  SelectInput,
} from 'react-admin';
import React, { PropsWithChildren } from 'react';
import ScientificNameReference from '../Taxon_names/ScientificNameReference';

export interface FormData {
  classification_system_id: number;
}
export interface FormDataProps {
  formData: FormData;
  rest: PropsWithChildren<any>;
}
export const HierarchyRowForm = (props: RowFormProps) => (
  <RowForm warnWhenUnsavedChanges {...props}>
    <ReferenceInput
      source="classification_system_id"
      reference="classification_systems"
      filter={{ class_type: 'hierarchical' }}
    >
      <SelectInput optionText="class_desc" validate={required()} />
    </ReferenceInput>
    <FormDataConsumer>
      {({ formData, ...rest }: FormDataProps) => {
        return (
          <ScientificNameReference
            source="parent_nid"
            label="Parent name"
            validate={required()}
            filter={{
              hierarchies___classification_system_id:
                formData.classification_system_id,
            }}
            {...rest}
          />
        );
      }}
    </FormDataConsumer>
  </RowForm>
);
