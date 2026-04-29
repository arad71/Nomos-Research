import * as React from 'react';
import { useRecordContext } from 'ra-core';
import { Badge } from '@/components/ui/badge';
import { RecordField } from '@/components/admin/record-field';
import { ReferenceField } from '@/components/admin/reference-field';
import { Show } from '@/components/admin/show';
import { getCrossRefTypeLabel } from '../shared/choices/CrossRefType';
import { formatDateOnly } from '../shared/dateOnlyDateTime';
import HistoryInfoBox from '../shared/HistoryInfoBox';
import RecordPageActions from '../shared/RecordPageActions';

const HtmlValue = ({ value }: { value?: string | null }) => {
  if (!value) {
    return null;
  }

  return <span dangerouslySetInnerHTML={{ __html: value }} />;
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
      showDelete={false}
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
              <ReferenceField
                source="old_name_id"
                reference="taxon_names"
                link="show"
                className="font-medium text-primary hover:underline"
              >
                <RecordField
                  label=""
                  render={(record: { formatted_scientific_name?: string | null }) => (
                    <HtmlValue value={record.formatted_scientific_name} />
                  )}
                />
              </ReferenceField>
            </RecordField>
            <RecordField label="New name" source="new_name_id">
              <ReferenceField
                source="new_name_id"
                reference="taxon_names"
                link="show"
                className="font-medium text-primary hover:underline"
              >
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
                getCrossRefTypeLabel(record.cross_reference_type)
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
              render={(record: { authorised_on?: string | null }) => formatDateOnly(record.authorised_on)}
            />
            <RecordField source="contributed_by" label="Contributed by" />
            <RecordField
              label="Contributed on"
              render={(record: { contributed_on?: string | null }) => formatDateOnly(record.contributed_on)}
            />
          </div>
        </section>

        <section className="mt-12 space-y-4 border-t border-border pt-12">
          <div className="space-y-1">
            <h3 className="text-base font-semibold tracking-tight">Notes</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <RecordField source="internal_comments" label="Internal comments" className="xl:col-span-3" />
            <RecordField source="external_comments" label="External comments" className="xl:col-span-3" />
          </div>
        </section>

        <section className="mt-12 space-y-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <RecordField
              source="reference_comments"
              label="Reference comments"
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
