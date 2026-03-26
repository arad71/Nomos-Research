import * as React from 'react';
import { useCanAccess, useRecordContext } from 'ra-core';
import { DeleteButton } from '@/components/admin/delete-button';
import { Edit } from '@/components/admin/edit';
import HistoryInfoBox from './shared/HistoryInfoBox';
import TaxonRankForm from './TaxonRankForm';
import RecordPageActions from './shared/RecordPageActions';

const TaxonRankEditTitle = () => {
  const record = useRecordContext<{ rank_name?: string }>();
  return record?.rank_name || 'Edit taxon rank';
};

const TaxonRankEditActions = () => {
  const record = useRecordContext<{ id?: string | number }>();
  const { canAccess } = useCanAccess({ resource: 'taxon_ranks', action: 'delete' });

  return (
    <RecordPageActions
      resource="taxon_ranks"
      listTo="/taxon_ranks"
      showTo={record?.id != null ? `/taxon_ranks/${record.id}/show` : null}
      extra={record?.id != null && canAccess ? <DeleteButton resource="taxon_ranks" /> : null}
    />
  );
};

const TaxonRankEditPage = () => (
  <Edit
    resource="taxon_ranks"
    title={<TaxonRankEditTitle />}
    mutationMode="pessimistic"
    redirect={false}
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
