import * as React from 'react';
import { Create } from '@/components/admin/create';
import TaxonRankForm from './TaxonRankForm';

const TaxonRankCreatePage = () => (
  <Create
    resource="taxon_ranks"
    title="Create taxon rank"
    mutationMode="pessimistic"
  >
    <TaxonRankForm />
  </Create>
);

export default TaxonRankCreatePage;
