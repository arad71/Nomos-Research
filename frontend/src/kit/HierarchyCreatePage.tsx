import * as React from 'react';
import { Create } from '@/components/admin/create';
import HierarchyForm from './HierarchyForm';

const HierarchyCreatePage = () => (
  <Create
    resource="hierarchies"
    title="Create hierarchy"
    mutationMode="pessimistic"
    redirect="show"
  >
    <HierarchyForm />
  </Create>
);

export default HierarchyCreatePage;
