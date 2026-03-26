import * as React from 'react';
import { useCanAccess, useRecordContext } from 'ra-core';
import { DeleteButton } from '@/components/admin/delete-button';
import { Badge } from '@/components/ui/badge';
import { Edit } from '@/components/admin/edit';
import CrossReferenceForm from './CrossReferenceForm';
import HistoryInfoBox from '../shared/HistoryInfoBox';
import RecordPageActions from '../shared/RecordPageActions';

const CrossReferenceEditTitle = () => {
  const record = useRecordContext<{ id?: string | number; deleted?: boolean | null }>();
  const title = record?.id != null ? `Edit related name #${record.id}` : 'Edit related name';
  return (
    <span className="inline-flex items-center gap-2">
      <span>{title}</span>
      {record?.deleted ? <Badge variant="destructive">Deleted</Badge> : null}
    </span>
  );
};

const CrossReferenceEditActions = () => {
  const record = useRecordContext<{ id?: string | number }>();
  const { canAccess } = useCanAccess({ resource: 'cross_references', action: 'delete' });

  return (
    <RecordPageActions
      resource="cross_references"
      listTo="/cross_references"
      showTo={record?.id != null ? `/cross_references/${record.id}/show` : null}
      extra={
        record?.id != null && canAccess ? <DeleteButton resource="cross_references" /> : null
      }
      restoreable
    />
  );
};

const CrossReferenceEditPage = () => (
  <Edit
    resource="cross_references"
    title={<CrossReferenceEditTitle />}
    mutationMode="pessimistic"
    redirect={false}
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
