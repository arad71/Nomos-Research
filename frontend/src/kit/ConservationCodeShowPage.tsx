import * as React from 'react';
import { useRecordContext } from 'ra-core';
import { Badge } from '@/components/ui/badge';
import { RecordField } from '@/components/admin/record-field';
import { Show } from '@/components/admin/show';
import HistoryInfoBox from './shared/HistoryInfoBox';
import RecordPageActions from './shared/RecordPageActions';

const ConservationCodeShowTitle = () => {
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

  const title = record?.conservation_code_value || 'Conservation code';
  return (
    <span className="inline-flex items-center gap-2">
      <span>{title}</span>
      {record?.deleted ? <Badge variant="destructive">Deleted</Badge> : null}
    </span>
  );
};

const ConservationCodeShowActions = () => {
  const record = useRecordContext<{ id?: string | number }>();

  return (
    <RecordPageActions
      resource="conservation_codes"
      listTo="/conservation_codes"
      editTo={record?.id != null ? `/conservation_codes/${record.id}` : null}
      restoreable
    />
  );
};

const ConservationCodeShowPage = () => (
  <Show
    resource="conservation_codes"
    title={<ConservationCodeShowTitle />}
    actions={<ConservationCodeShowActions />}
  >
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="grid gap-6 rounded-2xl border border-border bg-card p-6 md:grid-cols-2 xl:grid-cols-3">
        <RecordField source="conservation_code_value" label="Conservation code" />
        <RecordField source="authorising_org" label="Authority" />
        <RecordField source="code_priority" label="Display order" />
      </div>
      <div className="xl:sticky xl:top-6 xl:self-start">
        <HistoryInfoBox />
      </div>
    </div>
  </Show>
);

export default ConservationCodeShowPage;
