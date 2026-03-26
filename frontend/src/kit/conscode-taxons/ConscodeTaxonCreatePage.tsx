import * as React from 'react';
import { Create } from '@/components/admin/create';
import ConscodeTaxonForm from './ConscodeTaxonForm';
const ConscodeTaxonCreatePage = () => (
  <Create
    resource="conscode_taxons"
    title="Create conservation code - taxon link"
    mutationMode="pessimistic"
  >
    <ConscodeTaxonForm />
  </Create>
);

export default ConscodeTaxonCreatePage;
