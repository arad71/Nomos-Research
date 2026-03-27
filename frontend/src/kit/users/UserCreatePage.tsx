import * as React from 'react';
import { Create } from '@/components/admin/create';
import UserForm from './UserForm';

const UserCreatePage = () => (
  <Create resource="users" title="Create user" mutationMode="pessimistic">
    <UserForm />
  </Create>
);

export default UserCreatePage;
