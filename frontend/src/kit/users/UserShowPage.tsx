import * as React from 'react';
import { useGetMany, useRecordContext } from 'ra-core';
import { RecordField } from '@/components/admin/record-field';
import { Show } from '@/components/admin/show';
import HistoryInfoBox from '../shared/HistoryInfoBox';
import RecordPageActions from '../shared/RecordPageActions';
import { Badge } from '../../components/ui/badge';

const renderBoolean = (value?: boolean | null) => {
  if (value === null || value === undefined) {
    return '';
  }
  return value ? 'Yes' : 'No';
};

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <div className="col-span-full pt-2">
    <h3 className="text-base font-semibold tracking-tight">{children}</h3>
  </div>
);

const UserRolesField = () => {
  const record = useRecordContext<{
    role_ids?: Array<string | number>;
  }>();
  const roleIds = React.useMemo(
    () =>
      Array.from(
        new Set(
          (record?.role_ids ?? [])
            .map((roleId) => Number(roleId))
            .filter((roleId) => !Number.isNaN(roleId)),
        ),
      ),
    [record?.role_ids],
  );
  const { data: roleRecords = [] } = useGetMany(
    'roles',
    { ids: roleIds },
    { enabled: roleIds.length > 0 },
  );
  const roleNames = React.useMemo(
    () => roleRecords.map((role) => role?.name).filter(Boolean) as string[],
    [roleRecords],
  );

  if (!roleNames.length) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {roleNames.map((roleName) => (
        <Badge key={roleName} variant="outline">
          {roleName}
        </Badge>
      ))}
    </div>
  );
};

const UserShowTitle = () => {
  const record = useRecordContext<{
    full_name?: string;
    email?: string;
    deleted?: boolean | null;
  }>();
  const title = record?.full_name || record?.email || 'User';

  return (
    <span className="inline-flex items-center gap-2">
      <span>{title}</span>
      {record?.deleted ? <Badge variant="destructive">Deleted</Badge> : null}
    </span>
  );
};

const UserShowActions = () => {
  const record = useRecordContext<{ id?: string | number }>();

  return (
    <RecordPageActions
      resource="users"
      listTo="/users"
      editTo={record?.id != null ? `/users/${record.id}` : null}
      restoreable
      showDelete={false}
    />
  );
};

const UserShowPage = () => (
  <Show resource="users" title={<UserShowTitle />} actions={<UserShowActions />}>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="grid gap-6 rounded-2xl border border-border bg-card p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <SectionTitle>User information</SectionTitle>
          <RecordField source="first_name" label="First names" />
          <RecordField source="last_name" label="Last name" />
          <RecordField source="email" label="Email" className="md:col-span-2" />

          <SectionTitle>Access</SectionTitle>
          <RecordField label="Roles" className="md:col-span-2">
            <UserRolesField />
          </RecordField>
          <RecordField
            label="Deleted"
            className="md:col-span-2"
            render={(record: { deleted?: boolean | null }) => renderBoolean(record.deleted)}
          />
        </div>
      </div>
      <div className="xl:sticky xl:top-6 xl:self-start">
        <HistoryInfoBox />
      </div>
    </div>
  </Show>
);

export default UserShowPage;
