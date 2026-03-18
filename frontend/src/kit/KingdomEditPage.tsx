import * as React from 'react';
import { useRecordContext } from 'ra-core';
import { Edit } from '@/components/admin/edit';
import KingdomForm from './KingdomForm';
import HistoryInfoBox from './HistoryInfoBox';
import RecordPageActions from './RecordPageActions';

const KingdomEditTitle = () => {
  const record = useRecordContext<{ kingdom_name?: string }>();
  return record?.kingdom_name || 'Edit kingdom';
};

const KingdomEditActions = () => {
  const record = useRecordContext<{ id?: string | number }>();

  return (
    <RecordPageActions
      resource="kingdoms"
      listTo="/kingdoms"
      showTo={record?.id != null ? `/kingdoms/${record.id}/show` : null}
    />
  );
};

const KingdomEditPage = () => (
  <Edit
    resource="kingdoms"
    title={<KingdomEditTitle />}
    mutationMode="pessimistic"
    redirect="show"
    actions={<KingdomEditActions />}
  >
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <KingdomForm />
      <div className="xl:sticky xl:top-6 xl:self-start">
        <HistoryInfoBox />
      </div>
    </div>
  </Edit>
);

export default KingdomEditPage;
