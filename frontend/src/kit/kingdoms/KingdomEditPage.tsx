import * as React from 'react';
import { useCanAccess, useRecordContext } from 'ra-core';
import { DeleteButton } from '@/components/admin/delete-button';
import { Edit } from '@/components/admin/edit';
import KingdomForm from './KingdomForm';
import HistoryInfoBox from '../shared/HistoryInfoBox';
import RecordPageActions from '../shared/RecordPageActions';

const KingdomEditTitle = () => {
  const record = useRecordContext<{ kingdom_name?: string }>();
  return record?.kingdom_name || 'Edit kingdom';
};

const KingdomEditActions = () => {
  const record = useRecordContext<{ id?: string | number }>();
  const { canAccess } = useCanAccess({ resource: 'kingdoms', action: 'delete' });

  return (
    <RecordPageActions
      resource="kingdoms"
      listTo="/kingdoms"
      showTo={record?.id != null ? `/kingdoms/${record.id}/show` : null}
      extra={record?.id != null && canAccess ? <DeleteButton resource="kingdoms" /> : null}
    />
  );
};

const KingdomEditPage = () => (
  <Edit
    resource="kingdoms"
    title={<KingdomEditTitle />}
    mutationMode="pessimistic"
    redirect={false}
    actions={<KingdomEditActions />}
  >
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <KingdomForm />
      <div className="xl:sticky xl:top-6 xl:self-start">
        <HistoryInfoBox />
      </div>
    </div>
  </Edit>
);

export default KingdomEditPage;
