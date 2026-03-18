import * as React from 'react';
import { useRecordContext } from 'ra-core';
import { RecordField } from '@/components/admin/record-field';
import { Show } from '@/components/admin/show';
import HistoryInfoBox from './HistoryInfoBox';
import RecordPageActions from './RecordPageActions';

const AuthorShowTitle = () => {
  const record = useRecordContext<{ abbreviation?: string; display_name?: string }>();
  return record?.display_name || record?.abbreviation || 'Author';
};

const AuthorShowActions = () => {
  const record = useRecordContext<{ id?: string | number }>();

  return (
    <RecordPageActions
      resource="authors"
      listTo="/authors"
      editTo={record?.id != null ? `/authors/${record.id}` : null}
    />
  );
};

const AuthorShowPage = () => (
  <Show resource="authors" title={<AuthorShowTitle />} actions={<AuthorShowActions />}>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="grid gap-6 rounded-2xl border border-border bg-card p-6 md:grid-cols-2 xl:grid-cols-4">
        <RecordField source="first_names" />
        <RecordField source="surname" />
        <RecordField source="initials" />
        <RecordField source="abbreviation" />
        <RecordField source="orc_id" label="ORC ID" className="md:col-span-2" />
      </div>
      <div className="xl:sticky xl:top-6 xl:self-start">
        <HistoryInfoBox />
      </div>
    </div>
  </Show>
);

export default AuthorShowPage;
