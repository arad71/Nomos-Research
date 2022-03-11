import { ReferenceInput, required, SelectInput, SimpleForm } from "react-admin";
import React, {FC} from "react";

export const InformalGroupCreateEdit: FC = (props) => (
  <SimpleForm {...props}>
    <ReferenceInput
      source="classification_system_id"
      reference="classification_systems"
    >
      <SelectInput optionText="class_desc" validate={required()} />
    </ReferenceInput>
    <ReferenceInput source="taxon_name_id" reference="taxon_names">
      <SelectInput optionText="scientific_name" validate={required()} />
    </ReferenceInput>
  </SimpleForm>
);
