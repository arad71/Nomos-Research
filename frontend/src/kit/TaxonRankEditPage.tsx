import * as React from 'react';
import { useRecordContext } from 'ra-core';
import { Edit } from '@/components/admin/edit';
import HistoryInfoBox from './HistoryInfoBox';
import TaxonRankForm from './TaxonRankForm';
import RecordPageActions from './RecordPageActions';

const TaxonRankEditTitle = () => {
  const record = useRecordContext<{ rank_name?: string }>();
  return record?.rank_name || 'Edit taxon rank';
};

const TaxonRankEditActions = () => {
  const record = useRecordContext<{ id?: string | number }>();

  return (
    <RecordPageActions
      resource="taxon_ranks"
      listTo="/taxon_ranks"
      showTo={record?.id != null ? `/taxon_ranks/${record.id}/show` : null}
    />
  );
};

const TaxonRankEditPage = () => (
  <Edit
    resource="taxon_ranks"
    title={<TaxonRankEditTitle />}
    mutationMode="pessimistic"
    redirect="show"
    actions={<TaxonRankEditActions />}
  >
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <TaxonRankForm />
      <div className="xl:sticky xl:top-6 xl:self-start">
        <HistoryInfoBox />
      </div>
    </div>
  </Edit>
);

export default TaxonRankEditPage;
