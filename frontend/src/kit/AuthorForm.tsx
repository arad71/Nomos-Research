import * as React from 'react';
import { required } from 'ra-core';
import { SimpleForm } from '@/components/admin/simple-form';
import { TextInput } from '@/components/admin/text-input';

const requiredAbbreviation = required();

const AuthorForm = () => (
  <SimpleForm className="max-w-none">
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <TextInput source="first_names" />
      <TextInput source="surname" />
      <TextInput source="initials" />
      <TextInput source="abbreviation" validate={requiredAbbreviation} />
    </div>
    <div className="max-w-xl">
      <TextInput source="orc_id" label="ORC ID" />
    </div>
  </SimpleForm>
);

export default AuthorForm;
