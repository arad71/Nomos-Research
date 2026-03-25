import * as React from 'react';
import { Create } from '@/components/admin/create';
import TaxonNameForm from './TaxonNameForm';
import TaxonNameRelatedSections from './TaxonNameRelatedSections';

const TaxonNameCreatePage = () => (
  <Create resource="taxon_names" title="Create taxon name" mutationMode="pessimistic">
    <div className="grid gap-6">
      <div className="rounded-2xl border border-border bg-card p-6">
        <TaxonNameForm
          relatedSections={
            <TaxonNameRelatedSections
              editable
              embedded
              sections={['authors', 'publication', 'vernaculars', 'hierarchy', 'conservationCodes']}
            />
          }
        />
      </div>
    </div>
  </Create>
);

export default TaxonNameCreatePage;
