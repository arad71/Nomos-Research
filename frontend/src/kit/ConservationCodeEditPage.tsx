import * as React from 'react';
import { useCanAccess, useRecordContext } from 'ra-core';
import { DeleteButton } from '@/components/admin/delete-button';
import { Badge } from '@/components/ui/badge';
import { Edit } from '@/components/admin/edit';
import ConservationCodeForm from './ConservationCodeForm';
import HistoryInfoBox from './HistoryInfoBox';
import RecordPageActions from './RecordPageActions';

const ConservationCodeEditTitle = () => {
  const record = useRecordContext<{
    authorising_org?: string;
    conservation_code_value?: string;
  }>();

  if (record?.authorising_org && record?.conservation_code_value) {
    return (
      <span className="inline-flex items-center gap-2">
        <span>{`${record.authorising_org}: ${record.conservation_code_value}`}</span>
        {record.deleted ? <Badge variant="destructive">Deleted</Badge> : null}
      </span>
    );
  }

  const title = record?.conservation_code_value || 'Edit conservation code';
  return (
    <span className="inline-flex items-center gap-2">
      <span>{title}</span>
      {record?.deleted ? <Badge variant="destructive">Deleted</Badge> : null}
    </span>
  );
};

const ConservationCodeEditActions = () => {
  const record = useRecordContext<{ id?: string | number }>();
  const { canAccess } = useCanAccess({ resource: 'conservation_codes', action: 'delete' });

  return (
    <RecordPageActions
      resource="conservation_codes"
      listTo="/conservation_codes"
      showTo={record?.id != null ? `/conservation_codes/${record.id}/show` : null}
      extra={
        record?.id != null && canAccess ? <DeleteButton resource="conservation_codes" /> : null
      }
      restoreable
    />
  );
};

const ConservationCodeEditPage = () => (
  <Edit
    resource="conservation_codes"
    title={<ConservationCodeEditTitle />}
    mutationMode="pessimistic"
    redirect={false}
    actions={<ConservationCodeEditActions />}
  >
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <ConservationCodeForm />
      <div className="xl:sticky xl:top-6 xl:self-start">
        <HistoryInfoBox />
      </div>
    </div>
  </Edit>
);

export default ConservationCodeEditPage;
