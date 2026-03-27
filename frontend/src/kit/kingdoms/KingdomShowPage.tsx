import * as React from 'react';
import { useRecordContext } from 'ra-core';
import { RecordField } from '@/components/admin/record-field';
import { Show } from '@/components/admin/show';
import HistoryInfoBox from '../shared/HistoryInfoBox';
import RecordPageActions from '../shared/RecordPageActions';

const KingdomShowTitle = () => {
  const record = useRecordContext<{ id?: string | number; kingdom_name?: string }>();
  return record?.kingdom_name || 'Kingdom';
};

const KingdomShowActions = () => {
  const record = useRecordContext<{ id?: string | number }>();

  return (
    <RecordPageActions
      resource="kingdoms"
      listTo="/kingdoms"
      editTo={record?.id != null ? `/kingdoms/${record.id}` : null}
      showDelete={false}
    />
  );
};

const KingdomShowPage = () => (
  <Show resource="kingdoms" title={<KingdomShowTitle />} actions={<KingdomShowActions />}>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="grid gap-6 rounded-2xl border border-border bg-card p-6">
        <RecordField source="kingdom_name" label="Kingdom Name" />
        <RecordField source="kingdom_desc" label="Kingdom Description" />
      </div>
      <div className="xl:sticky xl:top-6 xl:self-start">
        <HistoryInfoBox />
      </div>
    </div>
  </Show>
);

export default KingdomShowPage;
