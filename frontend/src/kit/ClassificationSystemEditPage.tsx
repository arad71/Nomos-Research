import * as React from 'react';
import { useRecordContext } from 'ra-core';
import { Edit } from '@/components/admin/edit';
import ClassificationSystemForm from './ClassificationSystemForm';
import HistoryInfoBox from './shared/HistoryInfoBox';
import RecordPageActions from './shared/RecordPageActions';

const ClassificationSystemEditTitle = () => {
  const record = useRecordContext<{ class_desc?: string }>();
  return record?.class_desc || 'Edit classification system';
};

const ClassificationSystemEditActions = () => {
  const record = useRecordContext<{ id?: string | number }>();

  return (
    <RecordPageActions
      resource="classification_systems"
      listTo="/classification_systems"
      showTo={record?.id != null ? `/classification_systems/${record.id}/show` : null}
    />
  );
};

const ClassificationSystemEditPage = () => (
  <Edit
    resource="classification_systems"
    title={<ClassificationSystemEditTitle />}
    mutationMode="pessimistic"
    redirect={false}
    actions={<ClassificationSystemEditActions />}
  >
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <ClassificationSystemForm />
      <div className="xl:sticky xl:top-6 xl:self-start">
        <HistoryInfoBox />
      </div>
    </div>
  </Edit>
);

export default ClassificationSystemEditPage;
