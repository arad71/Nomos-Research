import * as React from 'react';
import { required } from 'ra-core';
import { AutocompleteArrayInput } from '@/components/admin/autocomplete-array-input';
import { BooleanInput } from '@/components/admin/boolean-input';
import { ReferenceArrayInput } from '@/components/admin/reference-array-input';
import { SimpleForm } from '@/components/admin/simple-form';
import { TextInput } from '@/components/admin/text-input';
import { AUTH_PROVIDER } from '../config';

const requiredValue = required();

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <div className="col-span-full pt-2">
    <h3 className="text-base font-semibold tracking-tight">{children}</h3>
  </div>
);

const UserForm = () => (
  <SimpleForm className="max-w-none">
    <div className="grid max-w-4xl gap-4 md:grid-cols-2">
      <SectionTitle>User information</SectionTitle>
      <TextInput source="first_name" label="First names" />
      <TextInput source="last_name" label="Last name" validate={requiredValue} />
      <TextInput source="email" label="Email" className="md:col-span-2" validate={requiredValue} />
      {AUTH_PROVIDER !== 'auth2' ? (
        <TextInput
          source="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          className="md:col-span-2"
        />
      ) : null}

      <SectionTitle>Access</SectionTitle>
      <ReferenceArrayInput source="role_ids" reference="roles">
        <AutocompleteArrayInput
          label="Roles"
          optionText="name"
          className="md:col-span-2"
          validate={requiredValue}
        />
      </ReferenceArrayInput>
      <BooleanInput
        source="deleted"
        label="Deleted"
        className="md:col-span-2"
        helperText="Toggle to mark the user as deleted (inactive) or not (active)"
      />
    </div>
  </SimpleForm>
);

export default UserForm;
