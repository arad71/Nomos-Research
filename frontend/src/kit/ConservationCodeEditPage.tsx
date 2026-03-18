import * as React from 'react';
import { useRecordContext } from 'ra-core';
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
    return `${record.authorising_org}: ${record.conservation_code_value}`;
  }

  return record?.conservation_code_value || 'Edit conservation code';
};

const ConservationCodeEditActions = () => {
  const record = useRecordContext<{ id?: string | number }>();

  return (
    <RecordPageActions
      resource="conservation_codes"
      listTo="/conservation_codes"
      showTo={record?.id != null ? `/conservation_codes/${record.id}/show` : null}
    />
  );
};

const ConservationCodeEditPage = () => (
  <Edit
    resource="conservation_codes"
    title={<ConservationCodeEditTitle />}
    mutationMode="pessimistic"
    redirect="show"
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
