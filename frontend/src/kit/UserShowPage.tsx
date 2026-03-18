import * as React from 'react';
import { useRecordContext } from 'ra-core';
import { RecordField } from '@/components/admin/record-field';
import { ReferenceArrayField } from '@/components/admin/reference-array-field';
import { Show } from '@/components/admin/show';
import { SingleFieldList } from '@/components/admin/single-field-list';
import HistoryInfoBox from './HistoryInfoBox';
import RecordPageActions from './RecordPageActions';

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

const UserShowTitle = () => {
  const record = useRecordContext<{ full_name?: string; email?: string }>();
  return record?.full_name || record?.email || 'User';
};

const UserShowActions = () => {
  const record = useRecordContext<{ id?: string | number }>();

  return (
    <RecordPageActions
      resource="users"
      listTo="/users"
      editTo={record?.id != null ? `/users/${record.id}` : null}
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
            <ReferenceArrayField reference="roles" source="role_ids">
              <SingleFieldList>
                <RecordField source="name" label="" />
              </SingleFieldList>
            </ReferenceArrayField>
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
