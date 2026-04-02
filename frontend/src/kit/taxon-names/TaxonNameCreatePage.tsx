import * as React from 'react';
import { Create } from '@/components/admin/create';
import TaxonNameForm from './TaxonNameForm';
import TaxonNameRelatedSections from './TaxonNameRelatedSections';
import { normalizeTaxonNameHybridFields } from './hybridFields';

const TaxonNameCreatePage = () => (
  <Create
    resource="taxon_names"
    title="Create taxon name"
    mutationMode="pessimistic"
    transform={normalizeTaxonNameHybridFields}
  >
    <div className="grid gap-6">
      <div className="rounded-2xl border border-border bg-card p-6">
        <TaxonNameForm
          topContent={
            <TaxonNameRelatedSections
              editable
              embedded
              sections={['parents']}
            />
          }
          relatedSections={
            <TaxonNameRelatedSections
              editable
              embedded
              sections={['authors', 'publication', 'vernaculars', 'hierarchy', 'relatedNames', 'conservationCodes']}
            />
          }
        />
      </div>
    </div>
  </Create>
);

export default TaxonNameCreatePage;
