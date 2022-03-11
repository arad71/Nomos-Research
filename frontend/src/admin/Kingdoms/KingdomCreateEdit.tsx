import {SimpleForm, TextInput} from "react-admin";
import React, {FC} from "react";

export const KingdomCreateEdit: FC = (props) => (
  <SimpleForm {...props}>
    <TextInput source="kingdom_name" />
    <TextInput multiline source="kingdom_desc" />
  </SimpleForm>
);
