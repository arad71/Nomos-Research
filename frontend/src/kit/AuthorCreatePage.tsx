import * as React from 'react';
import { Create } from '@/components/admin/create';
import AuthorForm from './AuthorForm';

const AuthorCreatePage = () => (
  <Create
    resource="authors"
    title="Create author"
    mutationMode="pessimistic"
    redirect="show"
  >
    <AuthorForm />
  </Create>
);

export default AuthorCreatePage;
