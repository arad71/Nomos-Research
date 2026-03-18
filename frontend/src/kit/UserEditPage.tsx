import * as React from 'react';
import { useRecordContext } from 'ra-core';
import { Edit } from '@/components/admin/edit';
import HistoryInfoBox from './HistoryInfoBox';
import UserForm from './UserForm';
import RecordPageActions from './RecordPageActions';

const UserEditTitle = () => {
  const record = useRecordContext<{ full_name?: string; email?: string }>();
  return record?.full_name || record?.email || 'Edit user';
};

const UserEditActions = () => {
  const record = useRecordContext<{ id?: string | number }>();

  return (
    <RecordPageActions
      resource="users"
      listTo="/users"
      showTo={record?.id != null ? `/users/${record.id}/show` : null}
    />
  );
};

const UserEditPage = () => (
  <Edit
    resource="users"
    title={<UserEditTitle />}
    mutationMode="pessimistic"
    redirect="show"
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
