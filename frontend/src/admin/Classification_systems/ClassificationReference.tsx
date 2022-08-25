import { ReferenceInput, required, SelectInput } from 'react-admin';
import React from 'react';

export const ClassificationReference = () => (
  <ReferenceInput
    source="classification_system_id"
    reference="classification_systems"
    filter={{ class_type: 'hierarchical' }}
  >
    <SelectInput
      optionText="class_desc"
      validate={required()}
      /* eslint-disable-next-line max-len */
      helperText="Choose a classification system. If you change classification system, ensure you change the parent name."
    />
  </ReferenceInput>
);
