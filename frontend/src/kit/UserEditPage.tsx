import * as React from 'react';
import { useRecordContext } from 'ra-core';
import { Edit } from '@/components/admin/edit';
import HistoryInfoBox from './shared/HistoryInfoBox';
import UserForm from './UserForm';
import RecordPageActions from './shared/RecordPageActions';
import { Badge } from '../components/ui/badge';

const UserEditTitle = () => {
  const record = useRecordContext<{
    full_name?: string;
    email?: string;
    deleted?: boolean | null;
  }>();
  const title = record?.full_name || record?.email || 'Edit user';

  return (
    <span className="inline-flex items-center gap-2">
      <span>{title}</span>
      {record?.deleted ? <Badge variant="destructive">Deleted</Badge> : null}
    </span>
  );
};

const UserEditActions = () => {
  const record = useRecordContext<{ id?: string | number }>();

  return (
    <RecordPageActions
      resource="users"
      listTo="/users"
      showTo={record?.id != null ? `/users/${record.id}/show` : null}
      restoreable
    />
  );
};

const UserEditPage = () => (
  <Edit
    resource="users"
    title={<UserEditTitle />}
    mutationMode="pessimistic"
    redirect={false}
    actions={<UserEditActions />}
  >
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <UserForm />
      <div className="xl:sticky xl:top-6 xl:self-start">
        <HistoryInfoBox />
      </div>
    </div>
  </Edit>
);

export default UserEditPage;
