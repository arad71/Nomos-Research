import * as React from 'react';
import { Create } from '@/components/admin/create';
import ClassificationSystemForm from './ClassificationSystemForm';

const ClassificationSystemCreatePage = () => (
  <Create
    resource="classification_systems"
    title="Create classification system"
    mutationMode="pessimistic"
    redirect="show"
    defaultValues={{ sort_order: 0, preferred: null }}
  >
    <ClassificationSystemForm />
  </Create>
);

export default ClassificationSystemCreatePage;
