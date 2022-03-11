import {NumberInput, required, SelectInput, SimpleForm, TextInput} from "react-admin";
import React, {FC} from "react";
import ClassificationType from "./ClassificationType";
import BooleanOptions from "../shared/BooleanOptions";

export const ClassSystemCreateEdit: FC = (props) => (
  <SimpleForm {...props}>
    <TextInput source="class_desc" validate={[required()]} />
    <SelectInput
      source="class_type"
      choices={ClassificationType}
      validate={[required()]}
    />
    <SelectInput source="preferred" choices={BooleanOptions} />
    <NumberInput source="sort_order" />
  </SimpleForm>
);
