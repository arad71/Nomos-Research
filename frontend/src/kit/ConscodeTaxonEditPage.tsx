import * as React from 'react';
import { useRecordContext } from 'ra-core';
import { Edit } from '@/components/admin/edit';
import ConscodeTaxonForm from './ConscodeTaxonForm';
import HistoryInfoBox from './HistoryInfoBox';
import RecordPageActions from './RecordPageActions';

const ConscodeTaxonEditTitle = () => {
  const record = useRecordContext<{ id?: string | number }>();
  return record?.id != null
    ? `Edit conservation code - taxon link #${record.id}`
    : 'Edit conservation code - taxon link';
};

const ConscodeTaxonEditActions = () => {
  const record = useRecordContext<{ id?: string | number }>();

  return (
    <RecordPageActions
      resource="conscode_taxons"
      listTo="/conscode_taxons"
      showTo={record?.id != null ? `/conscode_taxons/${record.id}/show` : null}
    />
  );
};

const ConscodeTaxonEditPage = () => (
  <Edit
    resource="conscode_taxons"
    title={<ConscodeTaxonEditTitle />}
    mutationMode="pessimistic"
    redirect={false}
    actions={<ConscodeTaxonEditActions />}
  >
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <ConscodeTaxonForm />
      <div className="xl:sticky xl:top-6 xl:self-start">
        <HistoryInfoBox />
      </div>
    </div>
  </Edit>
);

export default ConscodeTaxonEditPage;
