import React, { FC } from 'react';
import {
  Create,
  SimpleForm,
  TextInput,
  TextField,
  PasswordInput,
  BooleanInput,
  DateInput,
  ReferenceInput,
  required,
  useGetIdentity,
  SelectInput
} from 'react-admin';



export const KingdomCreate: FC = (props) => {
  const { identity, loading: identityLoading } = useGetIdentity();
  console.log(identity)
  return (
      <Create {...props}>
        <SimpleForm>
          <TextInput source="kingdom_name" validate={[required()]}/>
          <TextInput multiline source="kingdom_desc"/>
          <ReferenceInput label="User" source="userId" reference="users">
            <TextInput source="first_name" defaultValue="Me"/>
          </ReferenceInput>
          <DateInput disabled source="updated_on" defaultValue={new Date()}/>
        </SimpleForm>
      </Create>
  );
}