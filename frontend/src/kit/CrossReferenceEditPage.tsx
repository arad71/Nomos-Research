import * as React from 'react';
import { useRecordContext } from 'ra-core';
import { Edit } from '@/components/admin/edit';
import CrossReferenceForm from './CrossReferenceForm';
import HistoryInfoBox from './HistoryInfoBox';
import RecordPageActions from './RecordPageActions';

const CrossReferenceEditTitle = () => {
  const record = useRecordContext<{ id?: string | number }>();
  return record?.id != null ? `Edit related name #${record.id}` : 'Edit related name';
};

const CrossReferenceEditActions = () => {
  const record = useRecordContext<{ id?: string | number }>();

  return (
    <RecordPageActions
      resource="cross_references"
      listTo="/cross_references"
      showTo={record?.id != null ? `/cross_references/${record.id}/show` : null}
    />
  );
};

const CrossReferenceEditPage = () => (
  <Edit
    resource="cross_references"
    title={<CrossReferenceEditTitle />}
    mutationMode="pessimistic"
    redirect="show"
    actions={<CrossReferenceEditActions />}
  >
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <CrossReferenceForm />
      <div className="xl:sticky xl:top-6 xl:self-start">
        <HistoryInfoBox />
      </div>
    </div>
  </Edit>
);

export default CrossReferenceEditPage;
