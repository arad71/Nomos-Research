import * as React from 'react';
import { useCanAccess, useRecordContext } from 'ra-core';
import { Edit } from '@/components/admin/edit';
import { DeleteButton } from '@/components/admin/delete-button';
import { RecordField } from '@/components/admin/record-field';
import TaxonNameForm from './TaxonNameForm';
import TaxonNameRelatedSections from './TaxonNameRelatedSections';
import HistoryInfoBox from './HistoryInfoBox';
import TaxonNameTitle from './TaxonNameTitle';
import TaxonNameSidebarCards from './TaxonNameSidebarCards';
import RecordPageActions from './RecordPageActions';

const TaxonNameEditTitle = () => <TaxonNameTitle fallback="Edit taxon name" />;

const TaxonNameEditActions = () => {
  const record = useRecordContext<{ id?: string | number }>();
  const { canAccess } = useCanAccess({ resource: 'taxon_names', action: 'delete' });

  return (
    <RecordPageActions
      resource="taxon_names"
      listTo="/taxon_names"
      showTo={record?.id != null ? `/taxon_names/${record.id}/show` : null}
      extra={record?.id != null && canAccess ? <DeleteButton resource="taxon_names" /> : null}
    />
  );
};

const TaxonNameEditPage = () => (
  <Edit resource="taxon_names" title={<TaxonNameEditTitle />} mutationMode="pessimistic" redirect={false} actions={<TaxonNameEditActions />}>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
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
      <div className="grid gap-6 xl:sticky xl:top-6 xl:self-start">
        <HistoryInfoBox />
        <TaxonNameSidebarCards />
      </div>
    </div>
  </Edit>
);

export default TaxonNameEditPage;
