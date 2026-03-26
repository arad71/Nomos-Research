import * as React from 'react';
import { useRecordContext } from 'ra-core';
import { Edit } from '@/components/admin/edit';
import HistoryInfoBox from './shared/HistoryInfoBox';
import { TaxonNameCodeDetails, TaxonNameCodeTitle } from './TaxonNameCodeDetails';
import RecordPageActions from './shared/RecordPageActions';

const TaxonNameCodeEditActions = () => {
  const record = useRecordContext<{ id?: string | number }>();

  return (
    <RecordPageActions
      resource="taxon_names"
      listTo="/taxon_names_code"
      showTo={record?.id != null ? `/taxon_names_code/${record.id}/show` : null}
    />
  );
};

const TaxonNameCodeEditPage = () => (
  <Edit resource="taxon_names_code" title={<TaxonNameCodeTitle />} redirect={false} actions={<TaxonNameCodeEditActions />}>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <TaxonNameCodeDetails editable />
      <div className="xl:sticky xl:top-6 xl:self-start">
        <HistoryInfoBox />
      </div>
    </div>
  </Edit>
);

export default TaxonNameCodeEditPage;
