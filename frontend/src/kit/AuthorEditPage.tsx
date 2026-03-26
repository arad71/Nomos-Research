import * as React from 'react';
import { useCanAccess, useRecordContext } from 'ra-core';
import { DeleteButton } from '@/components/admin/delete-button';
import { Badge } from '@/components/ui/badge';
import { Edit } from '@/components/admin/edit';
import AuthorForm from './AuthorForm';
import HistoryInfoBox from './shared/HistoryInfoBox';
import RecordPageActions from './shared/RecordPageActions';

const AuthorEditTitle = () => {
  const record = useRecordContext<{ abbreviation?: string; display_name?: string; deleted?: boolean | null }>();
  const title = record?.display_name || record?.abbreviation || 'Edit author';
  return (
    <span className="inline-flex items-center gap-2">
      <span>{title}</span>
      {record?.deleted ? <Badge variant="destructive">Deleted</Badge> : null}
    </span>
  );
};

const AuthorEditActions = () => {
  const record = useRecordContext<{ id?: string | number }>();
  const { canAccess } = useCanAccess({ resource: 'authors', action: 'delete' });

  return (
    <RecordPageActions
      resource="authors"
      listTo="/authors"
      showTo={record?.id != null ? `/authors/${record.id}/show` : null}
      extra={record?.id != null && canAccess ? <DeleteButton resource="authors" /> : null}
      restoreable
    />
  );
};

const AuthorEditPage = () => (
  <Edit
    resource="authors"
    title={<AuthorEditTitle />}
    mutationMode="pessimistic"
    redirect={false}
    actions={<AuthorEditActions />}
  >
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <AuthorForm />
      <div className="xl:sticky xl:top-6 xl:self-start">
        <HistoryInfoBox />
      </div>
    </div>
  </Edit>
);

export default AuthorEditPage;
