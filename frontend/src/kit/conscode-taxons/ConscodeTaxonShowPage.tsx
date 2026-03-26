import * as React from 'react';
import { useRecordContext } from 'ra-core';
import { DateField } from '@/components/admin/date-field';
import { RecordField } from '@/components/admin/record-field';
import { ReferenceField } from '@/components/admin/reference-field';
import { Show } from '@/components/admin/show';
import HistoryInfoBox from '../shared/HistoryInfoBox';
import RecordPageActions from '../shared/RecordPageActions';

const HtmlValue = ({ value }: { value?: string | null }) => {
  if (!value) {
    return null;
  }

  return <span dangerouslySetInnerHTML={{ __html: value }} />;
};

const ConscodeTaxonShowTitle = () => {
  const record = useRecordContext<{ id?: string | number }>();
  return record?.id != null
    ? `Conservation code - taxon link #${record.id}`
    : 'Conservation code - taxon link';
};

const ConscodeTaxonShowActions = () => {
  const record = useRecordContext<{ id?: string | number }>();

  return (
    <RecordPageActions
      resource="conscode_taxons"
      listTo="/conscode_taxons"
      editTo={record?.id != null ? `/conscode_taxons/${record.id}` : null}
    />
  );
};

const ConscodeTaxonShowPage = () => (
  <Show resource="conscode_taxons" title={<ConscodeTaxonShowTitle />} actions={<ConscodeTaxonShowActions />}>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="grid gap-6 rounded-2xl border border-border bg-card p-6">
        <RecordField label="Formatted taxon name" source="taxon_name_id">
          <ReferenceField source="taxon_name_id" reference="taxon_names">
            <RecordField
              label=""
              render={(record: { formatted_scientific_name?: string | null }) => (
                <HtmlValue value={record.formatted_scientific_name} />
              )}
            />
          </ReferenceField>
        </RecordField>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <RecordField label="Authority" source="conservation_code_id">
            <ReferenceField source="conservation_code_id" reference="conservation_codes">
              <RecordField source="authorising_org" label="" />
            </ReferenceField>
          </RecordField>
          <RecordField label="Conservation code" source="conservation_code_id">
            <ReferenceField source="conservation_code_id" reference="conservation_codes">
              <RecordField source="conservation_code_value" label="" />
            </ReferenceField>
          </RecordField>
          <RecordField label="Effective from" source="effective_from">
            <DateField source="effective_from" />
          </RecordField>
          <RecordField label="Effective to" source="effective_to">
            <DateField source="effective_to" />
          </RecordField>
        </div>

        <RecordField source="notes" label="Notes" />
      </div>
      <div className="xl:sticky xl:top-6 xl:self-start">
        <HistoryInfoBox />
      </div>
    </div>
  </Show>
);

export default ConscodeTaxonShowPage;
