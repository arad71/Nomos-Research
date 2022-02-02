import React, { FC } from 'react';
import {
  Create,
  SimpleForm,
  TextInput,
  TextField,
  PasswordInput,
  BooleanInput,
  DateInput,
  required,
  useGetIdentity,
} from 'react-admin';



export const KingdomCreate: FC = (props) => {
  const { identity, loading: identityLoading } = useGetIdentity();
  console.log(`This is the ${identity}`)
  return (
      <Create {...props}>
        <SimpleForm>
          <TextInput source="kingdom_name" validate={[required()]}/>
          <TextInput multiline source="kingdom_desc"/>
          <TextInput disabled source="updated_by" defaultValue={identity}/>
          <DateInput disabled source="updated_on" defaultValue={new Date()}/>
        </SimpleForm>
      </Create>
  );
}