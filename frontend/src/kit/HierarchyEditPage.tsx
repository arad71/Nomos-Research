import * as React from 'react';
import { useRecordContext } from 'ra-core';
import { Edit } from '@/components/admin/edit';
import HierarchyForm from './HierarchyForm';
import HistoryInfoBox from './HistoryInfoBox';
import RecordPageActions from './RecordPageActions';

const HierarchyEditTitle = () => {
  const record = useRecordContext<{ id?: string | number }>();
  return record?.id != null ? `Edit hierarchy #${record.id}` : 'Edit hierarchy';
};

const HierarchyEditActions = () => {
  const record = useRecordContext<{ id?: string | number }>();

  return (
    <RecordPageActions
      resource="hierarchies"
      listTo="/hierarchies"
      showTo={record?.id != null ? `/hierarchies/${record.id}/show` : null}
    />
  );
};

const HierarchyEditPage = () => (
  <Edit
    resource="hierarchies"
    title={<HierarchyEditTitle />}
    mutationMode="pessimistic"
    redirect={false}
    actions={<HierarchyEditActions />}
  >
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <HierarchyForm />
      <div className="xl:sticky xl:top-6 xl:self-start">
        <HistoryInfoBox />
      </div>
    </div>
  </Edit>
);

export default HierarchyEditPage;
