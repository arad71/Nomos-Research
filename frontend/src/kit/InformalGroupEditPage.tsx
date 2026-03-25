import * as React from 'react';
import { useRecordContext } from 'ra-core';
import { Edit } from '@/components/admin/edit';
import HistoryInfoBox from './HistoryInfoBox';
import InformalGroupForm from './InformalGroupForm';
import RecordPageActions from './RecordPageActions';

const InformalGroupEditTitle = () => {
  const record = useRecordContext<{ id?: string | number }>();
  return record?.id != null ? `Edit informal group #${record.id}` : 'Edit informal group';
};

const InformalGroupEditActions = () => {
  const record = useRecordContext<{ id?: string | number }>();

  return (
    <RecordPageActions
      resource="informal_groups"
      listTo="/informal_groups"
      showTo={record?.id != null ? `/informal_groups/${record.id}/show` : null}
    />
  );
};

const InformalGroupEditPage = () => (
  <Edit
    resource="informal_groups"
    title={<InformalGroupEditTitle />}
    mutationMode="pessimistic"
    redirect={false}
    actions={<InformalGroupEditActions />}
  >
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <InformalGroupForm />
      <div className="xl:sticky xl:top-6 xl:self-start">
        <HistoryInfoBox />
      </div>
    </div>
  </Edit>
);

export default InformalGroupEditPage;
