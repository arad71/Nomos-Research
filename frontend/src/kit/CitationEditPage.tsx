import * as React from 'react';
import { useCanAccess, useRecordContext } from 'ra-core';
import { DeleteButton } from '@/components/admin/delete-button';
import { Badge } from '@/components/ui/badge';
import { Edit } from '@/components/admin/edit';
import CitationForm from './CitationForm';
import HistoryInfoBox from './shared/HistoryInfoBox';
import RecordPageActions from './shared/RecordPageActions';

const CitationEditTitle = () => {
  const record = useRecordContext<{ id?: string | number; deleted?: boolean | null }>();
  const title = record?.id != null ? `Edit citation #${record.id}` : 'Edit citation';
  return (
    <span className="inline-flex items-center gap-2">
      <span>{title}</span>
      {record?.deleted ? <Badge variant="destructive">Deleted</Badge> : null}
    </span>
  );
};

const CitationEditActions = () => {
  const record = useRecordContext<{ id?: string | number }>();
  const { canAccess } = useCanAccess({ resource: 'citations', action: 'delete' });

  return (
    <RecordPageActions
      resource="citations"
      listTo="/citations"
      showTo={record?.id != null ? `/citations/${record.id}/show` : null}
      extra={record?.id != null && canAccess ? <DeleteButton resource="citations" /> : null}
      restoreable
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
