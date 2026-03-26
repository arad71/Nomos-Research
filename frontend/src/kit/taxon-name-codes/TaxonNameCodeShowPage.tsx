import * as React from 'react';
import { useRecordContext } from 'ra-core';
import { Show } from '@/components/admin/show';
import HistoryInfoBox from '../shared/HistoryInfoBox';
import { TaxonNameCodeDetails, TaxonNameCodeTitle } from './TaxonNameCodeDetails';
import RecordPageActions from '../shared/RecordPageActions';

const TaxonNameCodeShowActions = () => {
  const record = useRecordContext<{ id?: string | number }>();

  return (
    <RecordPageActions
      resource="taxon_names"
      listTo="/taxon_names_code"
      editTo={record?.id != null ? `/taxon_names_code/${record.id}` : null}
      showDelete={false}
    />
  );
};

const TaxonNameCodeShowPage = () => (
  <Show resource="taxon_names_code" title={<TaxonNameCodeTitle />} actions={<TaxonNameCodeShowActions />}>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <TaxonNameCodeDetails />
      <div className="xl:sticky xl:top-6 xl:self-start">
        <HistoryInfoBox />
      </div>
    </div>
  </Show>
);

export default TaxonNameCodeShowPage;
