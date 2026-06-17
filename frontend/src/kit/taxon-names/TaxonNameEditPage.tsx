import * as React from 'react';
import { useRecordContext, useRefresh } from 'ra-core';
import { useNotify } from 'react-admin';
import { Edit } from '@/components/admin/edit';
import TaxonNameForm from './TaxonNameForm';
import TaxonNameRelatedSections from './TaxonNameRelatedSections';
import HistoryInfoBox from '../shared/HistoryInfoBox';
import TaxonNameTitle from './TaxonNameTitle';
import TaxonNameSidebarCards from './TaxonNameSidebarCards';
import RecordPageActions from '../shared/RecordPageActions';
import { normalizeTaxonNameHybridFields } from './hybridFields';

const TaxonNameEditTitle = () => <TaxonNameTitle fallback="Edit taxon name" />;

const TaxonNameEditActions = () => {
  const record = useRecordContext<{ id?: string | number }>();

  return (
    <RecordPageActions
      resource="taxon_names"
      listTo="/taxon_names"
      showTo={record?.id != null ? `/taxon_names/${record.id}/show` : null}
      restoreable
    />
  );
};

const TaxonNameEditPage = () => {
  const refresh = useRefresh();
  const notify = useNotify();

  return (
    <Edit
      resource="taxon_names"
      title={<TaxonNameEditTitle />}
      mutationMode="pessimistic"
      redirect={false}
      actions={<TaxonNameEditActions />}
      transform={normalizeTaxonNameHybridFields}
      mutationOptions={{
        onSuccess: () => {
          notify('Taxon name updated', { type: 'success' });
          refresh();
        },
      }}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid min-w-0 gap-6">
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
                  sections={[
                    'authors',
                    'publicationReferences',
                    'vernaculars',
                    'hierarchy',
                    'relatedNames',
                    'conservationCodes',
                  ]}
                />
              }
            />
          </div>
        </div>
        <div className="grid h-fit gap-6 self-start">
          <HistoryInfoBox />
          <TaxonNameSidebarCards />
        </div>
      </div>
    </Edit>
  );
};
export default TaxonNameEditPage;
