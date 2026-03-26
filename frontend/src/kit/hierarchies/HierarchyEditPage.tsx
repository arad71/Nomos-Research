import * as React from 'react';
import { useRecordContext } from 'ra-core';
import { Badge } from '@/components/ui/badge';
import { Edit } from '@/components/admin/edit';
import HierarchyForm from './HierarchyForm';
import HistoryInfoBox from '../shared/HistoryInfoBox';
import RecordPageActions from '../shared/RecordPageActions';

const HierarchyEditTitle = () => {
  const record = useRecordContext<{ id?: string | number; deleted?: boolean | null }>();
  const title = record?.id != null ? `Edit hierarchy #${record.id}` : 'Edit hierarchy';
  return (
    <span className="inline-flex items-center gap-2">
      <span>{title}</span>
      {record?.deleted ? <Badge variant="destructive">Deleted</Badge> : null}
    </span>
  );
};

const HierarchyEditActions = () => {
  const record = useRecordContext<{ id?: string | number }>();

  return (
    <RecordPageActions
      resource="hierarchies"
      listTo="/hierarchies"
      showTo={record?.id != null ? `/hierarchies/${record.id}/show` : null}
      restoreable
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
