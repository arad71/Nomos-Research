import * as React from 'react';
import { useRecordContext } from 'ra-core';
import { Badge } from '@/components/ui/badge';
import { RecordField } from '@/components/admin/record-field';
import { ReferenceField } from '@/components/admin/reference-field';
import { Show } from '@/components/admin/show';
import HistoryInfoBox from '../shared/HistoryInfoBox';
import RecordPageActions from '../shared/RecordPageActions';

const ScientificNameValue = ({ value }: { value?: string | null }) => {
  if (!value) {
    return null;
  }

  return <span dangerouslySetInnerHTML={{ __html: value }} />;
};

const InformalGroupShowTitle = () => {
  const record = useRecordContext<{ id?: string | number; deleted?: boolean | null }>();
  const title = record?.id != null ? `Informal group #${record.id}` : 'Informal group';
  return (
    <span className="inline-flex items-center gap-2">
      <span>{title}</span>
      {record?.deleted ? <Badge variant="destructive">Deleted</Badge> : null}
    </span>
  );
};

const InformalGroupShowActions = () => {
  const record = useRecordContext<{ id?: string | number }>();

  return (
    <RecordPageActions
      resource="informal_groups"
      listTo="/informal_groups"
      editTo={record?.id != null ? `/informal_groups/${record.id}` : null}
      restoreable
      showDelete={false}
    />
  );
};

const InformalGroupShowPage = () => (
  <Show
    resource="informal_groups"
    title={<InformalGroupShowTitle />}
    actions={<InformalGroupShowActions />}
  >
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="grid gap-6 rounded-2xl border border-border bg-card p-6">
        <RecordField label="Classification description" source="classification_system_id">
          <ReferenceField source="classification_system_id" reference="classification_systems">
            <RecordField source="class_desc" label="" />
          </ReferenceField>
        </RecordField>
        <RecordField label="Taxon name" source="taxon_name_id">
          <ReferenceField source="taxon_name_id" reference="taxon_names">
            <RecordField
              label=""
              render={(record: { formatted_scientific_name?: string | null }) => (
                <ScientificNameValue value={record.formatted_scientific_name} />
              )}
            />
          </ReferenceField>
        </RecordField>
      </div>
      <div className="xl:sticky xl:top-6 xl:self-start">
        <HistoryInfoBox />
      </div>
    </div>
  </Show>
);

export default InformalGroupShowPage;
