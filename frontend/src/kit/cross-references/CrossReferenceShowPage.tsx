import * as React from 'react';
import { useRecordContext } from 'ra-core';
import { Badge } from '@/components/ui/badge';
import { RecordField } from '@/components/admin/record-field';
import { ReferenceField } from '@/components/admin/reference-field';
import { Show } from '@/components/admin/show';
import CrossRefType from '../shared/choices/CrossRefType';
import HistoryInfoBox from '../shared/HistoryInfoBox';
import RecordPageActions from '../shared/RecordPageActions';

const crossRefTypeMap = CrossRefType.reduce<Record<string, string>>((acc, item) => {
  acc[item.id] = item.name;
  return acc;
}, {});

const HtmlValue = ({ value }: { value?: string | null }) => {
  if (!value) {
    return null;
  }

  return <span dangerouslySetInnerHTML={{ __html: value }} />;
};

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

const CrossReferenceShowTitle = () => {
  const record = useRecordContext<{ id?: string | number; deleted?: boolean | null }>();
  const title = record?.id != null ? `Related name #${record.id}` : 'Related name';
  return (
    <span className="inline-flex items-center gap-2">
      <span>{title}</span>
      {record?.deleted ? <Badge variant="destructive">Deleted</Badge> : null}
    </span>
  );
};

const CrossReferenceShowActions = () => {
  const record = useRecordContext<{ id?: string | number }>();

  return (
    <RecordPageActions
      resource="cross_references"
      listTo="/cross_references"
      editTo={record?.id != null ? `/cross_references/${record.id}` : null}
      restoreable
    />
  );
};

const CrossReferenceShowPage = () => (
  <Show resource="cross_references" title={<CrossReferenceShowTitle />} actions={<CrossReferenceShowActions />}>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="grid gap-6 rounded-2xl border border-border bg-card p-6">
        <section className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-base font-semibold tracking-tight">Related name</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <RecordField label="Old name" source="old_name_id">
              <ReferenceField source="old_name_id" reference="taxon_names">
                <RecordField
                  label=""
                  render={(record: { formatted_scientific_name?: string | null }) => (
                    <HtmlValue value={record.formatted_scientific_name} />
                  )}
                />
              </ReferenceField>
            </RecordField>
            <RecordField label="New name" source="new_name_id">
              <ReferenceField source="new_name_id" reference="taxon_names">
                <RecordField
                  label=""
                  render={(record: { formatted_scientific_name?: string | null }) => (
                    <HtmlValue value={record.formatted_scientific_name} />
                  )}
                />
              </ReferenceField>
            </RecordField>
            <RecordField
              source="cross_reference_type"
              label="Cross reference type"
              className="md:col-span-2 xl:col-span-3"
              render={(record: { cross_reference_type?: string | null }) =>
                record.cross_reference_type
                  ? crossRefTypeMap[record.cross_reference_type] ?? record.cross_reference_type
                  : ''
              }
            />
          </div>
        </section>

        <section className="mt-12 space-y-4 border-t border-border pt-12">
          <div className="space-y-1">
            <h3 className="text-base font-semibold tracking-tight">Authority</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <RecordField source="authorised_by" label="Authorised by" />
            <RecordField
              label="Authorised on"
              render={(record: { authorised_on?: string | null }) => formatDateTime(record.authorised_on)}
            />
            <RecordField source="contributed_by" label="Contributed by" />
            <RecordField
              label="Contributed on"
              render={(record: { contributed_on?: string | null }) => formatDateTime(record.contributed_on)}
            />
          </div>
        </section>

        <section className="mt-12 space-y-4 border-t border-border pt-12">
          <div className="space-y-1">
            <h3 className="text-base font-semibold tracking-tight">Notes</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <RecordField
              source="reference_comments"
              label="Comments"
              className="md:col-span-2 xl:col-span-3"
            />
            <RecordField source="notes" label="Notes" className="xl:col-span-3" />
          </div>
        </section>
      </div>
      <div className="xl:sticky xl:top-6 xl:self-start">
        <HistoryInfoBox />
      </div>
    </div>
  </Show>
);

export default CrossReferenceShowPage;
