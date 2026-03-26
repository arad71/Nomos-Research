import * as React from 'react';
import { useCanAccess, useRecordContext } from 'ra-core';
import { DeleteButton } from '@/components/admin/delete-button';
import { Badge } from '@/components/ui/badge';
import { Edit } from '@/components/admin/edit';
import HistoryInfoBox from './shared/HistoryInfoBox';
import VernacularForm from './VernacularForm';
import RecordPageActions from './shared/RecordPageActions';

const VernacularEditTitle = () => {
  const record = useRecordContext<{ vernacular_name?: string; deleted?: boolean | null }>();
  const title = record?.vernacular_name || 'Edit vernacular';
  return (
    <span className="inline-flex items-center gap-2">
      <span>{title}</span>
      {record?.deleted ? <Badge variant="destructive">Deleted</Badge> : null}
    </span>
  );
};

const VernacularEditActions = () => {
  const record = useRecordContext<{ id?: string | number }>();
  const { canAccess } = useCanAccess({ resource: 'vernaculars', action: 'delete' });

  return (
    <RecordPageActions
      resource="vernaculars"
      listTo="/vernaculars"
      showTo={record?.id != null ? `/vernaculars/${record.id}/show` : null}
      extra={record?.id != null && canAccess ? <DeleteButton resource="vernaculars" /> : null}
      restoreable
    />
  );
};

const VernacularEditPage = () => (
  <Edit
    resource="vernaculars"
    title={<VernacularEditTitle />}
    mutationMode="pessimistic"
    redirect={false}
    actions={<VernacularEditActions />}
  >
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <VernacularForm />
      <div className="xl:sticky xl:top-6 xl:self-start">
        <HistoryInfoBox />
      </div>
    </div>
  </Edit>
);

export default VernacularEditPage;
