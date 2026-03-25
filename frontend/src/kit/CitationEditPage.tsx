import * as React from 'react';
import { useRecordContext } from 'ra-core';
import { Edit } from '@/components/admin/edit';
import CitationForm from './CitationForm';
import HistoryInfoBox from './HistoryInfoBox';
import RecordPageActions from './RecordPageActions';

const CitationEditTitle = () => {
  const record = useRecordContext<{ id?: string | number }>();
  return record?.id != null ? `Edit citation #${record.id}` : 'Edit citation';
};

const CitationEditActions = () => {
  const record = useRecordContext<{ id?: string | number }>();

  return (
    <RecordPageActions
      resource="citations"
      listTo="/citations"
      showTo={record?.id != null ? `/citations/${record.id}/show` : null}
    />
  );
};

const CitationEditPage = () => (
  <Edit
    resource="citations"
    title={<CitationEditTitle />}
    mutationMode="pessimistic"
    redirect={false}
    actions={<CitationEditActions />}
  >
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <CitationForm />
      <div className="xl:sticky xl:top-6 xl:self-start">
        <HistoryInfoBox />
      </div>
    </div>
  </Edit>
);

export default CitationEditPage;
