import * as React from 'react';
import { useCanAccess, useRecordContext } from 'ra-core';
import { DeleteButton } from '@/components/admin/delete-button';
import { Badge } from '@/components/ui/badge';
import { Edit } from '@/components/admin/edit';
import HistoryInfoBox from '../shared/HistoryInfoBox';
import InformalGroupForm from './InformalGroupForm';
import RecordPageActions from '../shared/RecordPageActions';

const InformalGroupEditTitle = () => {
  const record = useRecordContext<{ id?: string | number; deleted?: boolean | null }>();
  const title = record?.id != null ? `Edit informal group #${record.id}` : 'Edit informal group';
  return (
    <span className="inline-flex items-center gap-2">
      <span>{title}</span>
      {record?.deleted ? <Badge variant="destructive">Deleted</Badge> : null}
    </span>
  );
};

const InformalGroupEditActions = () => {
  const record = useRecordContext<{ id?: string | number }>();
  const { canAccess } = useCanAccess({ resource: 'informal_groups', action: 'delete' });

  return (
    <RecordPageActions
      resource="informal_groups"
      listTo="/informal_groups"
      showTo={record?.id != null ? `/informal_groups/${record.id}/show` : null}
      extra={
        record?.id != null && canAccess ? <DeleteButton resource="informal_groups" /> : null
      }
      restoreable
    />
  );
};

const InformalGroupEditPage = () => (
  <Edit
    resource="informal_groups"
    title={<InformalGroupEditTitle />}
    mutationMode="pessimistic"
    redirect={false}
    actions={<InformalGroupEditActions />}
  >
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <InformalGroupForm />
      <div className="xl:sticky xl:top-6 xl:self-start">
        <HistoryInfoBox />
      </div>
    </div>
  </Edit>
);

export default InformalGroupEditPage;
