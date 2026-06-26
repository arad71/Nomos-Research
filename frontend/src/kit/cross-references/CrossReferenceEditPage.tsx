import * as React from 'react';
import { useRecordContext } from 'ra-core';
import { Badge } from '@/components/ui/badge';
import { Edit } from '@/components/admin/edit';
import CrossReferenceForm from './CrossReferenceForm';
import HistoryInfoBox from '../shared/HistoryInfoBox';
import RecordPageActions from '../shared/RecordPageActions';
import PublicationReferenceSection from '../taxon-publications/PublicationReferenceSection';

const CrossReferenceEditTitle = () => {
  const record = useRecordContext<{ id?: string | number; deleted?: boolean | null }>();
  const title = record?.id != null ? `Edit related name #${record.id}` : 'Edit related name';
  return (
    <span className="inline-flex items-center gap-2">
      <span>{title}</span>
      {record?.deleted ? <Badge variant="destructive">Deleted</Badge> : null}
    </span>
  );
};

const CrossReferenceEditActions = () => {
  const record = useRecordContext<{ id?: string | number }>();

  return (
    <RecordPageActions
      resource="cross_references"
      listTo="/cross_references"
      showTo={record?.id != null ? `/cross_references/${record.id}/show` : null}
      restoreable
    />
  );
};

const CrossReferencePublicationReferences = () => {
  const record = useRecordContext<{
    id?: string | number;
    cross_reference_id?: string | number;
  }>();
  const recordId = record?.cross_reference_id ?? record?.id;

  return (
    <PublicationReferenceSection
      editable
      parentId={recordId}
      parentField="cross_reference_id"
      parentLabel="cross reference"
    />
  );
};

const CrossReferenceEditPage = () => (
  <Edit
    resource="cross_references"
    title={<CrossReferenceEditTitle />}
    mutationMode="pessimistic"
    redirect={false}
    actions={<CrossReferenceEditActions />}
  >
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="grid min-w-0 gap-6">
        <CrossReferenceForm beforeNotes={<CrossReferencePublicationReferences />} />
      </div>
      <div className="xl:sticky xl:top-6 xl:self-start">
        <HistoryInfoBox />
      </div>
    </div>
  </Edit>
);

export default CrossReferenceEditPage;
