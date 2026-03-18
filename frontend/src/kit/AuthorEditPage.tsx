import * as React from 'react';
import { useRecordContext } from 'ra-core';
import { Edit } from '@/components/admin/edit';
import AuthorForm from './AuthorForm';
import HistoryInfoBox from './HistoryInfoBox';
import RecordPageActions from './RecordPageActions';

const AuthorEditTitle = () => {
  const record = useRecordContext<{ abbreviation?: string; display_name?: string }>();
  return record?.display_name || record?.abbreviation || 'Edit author';
};

const AuthorEditActions = () => {
  const record = useRecordContext<{ id?: string | number }>();

  return (
    <RecordPageActions
      resource="authors"
      listTo="/authors"
      showTo={record?.id != null ? `/authors/${record.id}/show` : null}
    />
  );
};

const AuthorEditPage = () => (
  <Edit
    resource="authors"
    title={<AuthorEditTitle />}
    mutationMode="pessimistic"
    redirect="show"
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
