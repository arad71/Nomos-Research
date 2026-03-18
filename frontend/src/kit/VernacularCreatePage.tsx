import * as React from 'react';
import { Create } from '@/components/admin/create';
import VernacularForm from './VernacularForm';

const VernacularCreatePage = () => (
  <Create
    resource="vernaculars"
    title="Create vernacular"
    mutationMode="pessimistic"
    redirect="show"
    defaultValues={{ lang_pref: false, preferred: false, sort_order: 0 }}
  >
    <VernacularForm />
  </Create>
);

export default VernacularCreatePage;
