import * as React from 'react';
import { Create } from '@/components/admin/create';
import CrossReferenceForm from './CrossReferenceForm';

const CrossReferenceCreatePage = () => (
  <Create
    resource="cross_references"
    title="Create related name"
    mutationMode="pessimistic"
    redirect="show"
  >
    <CrossReferenceForm />
  </Create>
);

export default CrossReferenceCreatePage;
