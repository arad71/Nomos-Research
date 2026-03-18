import * as React from 'react';
import { Create } from '@/components/admin/create';
import InformalGroupForm from './InformalGroupForm';

const InformalGroupCreatePage = () => (
  <Create
    resource="informal_groups"
    title="Create informal group"
    mutationMode="pessimistic"
    redirect="show"
  >
    <InformalGroupForm />
  </Create>
);

export default InformalGroupCreatePage;
