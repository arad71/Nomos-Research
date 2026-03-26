import * as React from 'react';
import { useRecordContext } from 'ra-core';
import { RecordField } from '@/components/admin/record-field';
import { Show } from '@/components/admin/show';
import HistoryInfoBox from '../shared/HistoryInfoBox';
import RecordPageActions from '../shared/RecordPageActions';

const renderPreferred = (value?: boolean | null) => {
  if (value === null || value === undefined) {
    return '';
  }
  return value ? 'Yes' : 'No';
};

const ClassificationSystemShowTitle = () => {
  const record = useRecordContext<{ class_desc?: string }>();
  return record?.class_desc || 'Classification system';
};

const ClassificationSystemShowActions = () => {
  const record = useRecordContext<{ id?: string | number }>();

  return (
    <RecordPageActions
      resource="classification_systems"
      listTo="/classification_systems"
      editTo={record?.id != null ? `/classification_systems/${record.id}` : null}
      showDelete={false}
    />
  );
};

const ClassificationSystemShowPage = () => (
  <Show
    resource="classification_systems"
    title={<ClassificationSystemShowTitle />}
    actions={<ClassificationSystemShowActions />}
  >
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="grid gap-6 rounded-2xl border border-border bg-card p-6 md:grid-cols-2">
        <RecordField source="class_desc" label="Classification description" />
        <RecordField source="class_type" label="Classification type" />
        <RecordField
          label="Preferred"
          render={(record: { preferred?: boolean | null }) =>
            renderPreferred(record.preferred)
          }
        />
        <RecordField source="sort_order" label="Sort order" />
      </div>
      <div className="xl:sticky xl:top-6 xl:self-start">
        <HistoryInfoBox />
      </div>
    </div>
  </Show>
);

export default ClassificationSystemShowPage;
