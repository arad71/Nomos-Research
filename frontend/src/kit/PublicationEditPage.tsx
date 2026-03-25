import * as React from 'react';
import { useCanAccess, useRecordContext } from 'ra-core';
import { DeleteButton } from '@/components/admin/delete-button';
import { Badge } from '@/components/ui/badge';
import { Edit } from '@/components/admin/edit';
import HistoryInfoBox from './HistoryInfoBox';
import PublicationForm from './PublicationForm';
import RecordPageActions from './RecordPageActions';
import { transformPublicationPayload } from './publicationDoi';

const PublicationEditTitle = () => {
  const record = useRecordContext<{ display_title?: string; abbreviated_title?: string; deleted?: boolean | null }>();
  const title = record?.display_title || record?.abbreviated_title || 'Edit publication';
  return (
    <span className="inline-flex items-center gap-2">
      <span>{title}</span>
      {record?.deleted ? <Badge variant="destructive">Deleted</Badge> : null}
    </span>
  );
};

const PublicationEditActions = () => {
  const record = useRecordContext<{ id?: string | number }>();
  const { canAccess } = useCanAccess({ resource: 'publications', action: 'delete' });

  return (
    <RecordPageActions
      resource="publications"
      listTo="/publications"
      showTo={record?.id != null ? `/publications/${record.id}/show` : null}
      extra={record?.id != null && canAccess ? <DeleteButton resource="publications" /> : null}
      restoreable
    />
  );
};

const PublicationEditPage = () => (
  <Edit
    resource="publications"
    title={<PublicationEditTitle />}
    mutationMode="pessimistic"
    redirect={false}
    actions={<PublicationEditActions />}
    transform={transformPublicationPayload}
  >
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <PublicationForm />
      <div className="xl:sticky xl:top-6 xl:self-start">
        <HistoryInfoBox />
      </div>
    </div>
  </Edit>
);

export default PublicationEditPage;
