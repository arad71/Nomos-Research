import * as React from 'react';
import { useRecordContext } from 'ra-core';
import { Edit } from '@/components/admin/edit';
import HistoryInfoBox from './HistoryInfoBox';
import PublicationForm from './PublicationForm';
import RecordPageActions from './RecordPageActions';
import { transformPublicationPayload } from './publicationDoi';

const PublicationEditTitle = () => {
  const record = useRecordContext<{ display_title?: string; abbreviated_title?: string }>();
  return record?.display_title || record?.abbreviated_title || 'Edit publication';
};

const PublicationEditActions = () => {
  const record = useRecordContext<{ id?: string | number }>();

  return (
    <RecordPageActions
      resource="publications"
      listTo="/publications"
      showTo={record?.id != null ? `/publications/${record.id}/show` : null}
    />
  );
};

const PublicationEditPage = () => (
  <Edit
    resource="publications"
    title={<PublicationEditTitle />}
    mutationMode="pessimistic"
    redirect="show"
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
