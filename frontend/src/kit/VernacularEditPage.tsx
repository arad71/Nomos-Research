import * as React from 'react';
import { useRecordContext } from 'ra-core';
import { Edit } from '@/components/admin/edit';
import HistoryInfoBox from './HistoryInfoBox';
import VernacularForm from './VernacularForm';
import RecordPageActions from './RecordPageActions';

const VernacularEditTitle = () => {
  const record = useRecordContext<{ vernacular_name?: string }>();
  return record?.vernacular_name || 'Edit vernacular';
};

const VernacularEditActions = () => {
  const record = useRecordContext<{ id?: string | number }>();

  return (
    <RecordPageActions
      resource="vernaculars"
      listTo="/vernaculars"
      showTo={record?.id != null ? `/vernaculars/${record.id}/show` : null}
    />
  );
};

const VernacularEditPage = () => (
  <Edit
    resource="vernaculars"
    title={<VernacularEditTitle />}
    mutationMode="pessimistic"
    redirect="show"
    actions={<VernacularEditActions />}
  >
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <VernacularForm />
      <div className="xl:sticky xl:top-6 xl:self-start">
        <HistoryInfoBox />
      </div>
    </div>
  </Edit>
);

export default VernacularEditPage;
