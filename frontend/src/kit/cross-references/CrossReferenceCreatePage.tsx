import * as React from 'react';
import { useRecordContext } from 'ra-core';
import { Create } from '@/components/admin/create';
import CrossReferenceForm from './CrossReferenceForm';
import PublicationReferenceSection from '../taxon-publications/PublicationReferenceSection';

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

const CrossReferenceCreatePage = () => (
  <Create
    resource="cross_references"
    title="Create related name"
    mutationMode="pessimistic"
    redirect="edit"
  >
    <CrossReferenceForm beforeNotes={<CrossReferencePublicationReferences />} />
  </Create>
);

export default CrossReferenceCreatePage;
