import { ReferenceInput, required, SelectInput } from 'react-admin';
import React from 'react';

export const ConservationReference = () => (
  <ReferenceInput
    source="conservation_code_id"
    reference="conservation_code_value"
  ></ReferenceInput>
);
