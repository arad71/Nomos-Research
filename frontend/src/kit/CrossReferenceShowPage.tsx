import * as React from 'react';
import { useRecordContext } from 'ra-core';
import { RecordField } from '@/components/admin/record-field';
import { ReferenceField } from '@/components/admin/reference-field';
import { Show } from '@/components/admin/show';
import CrossRefType from '../admin/Cross_references/CrossRefType';
import HistoryInfoBox from './HistoryInfoBox';
import RecordPageActions from './RecordPageActions';

const crossRefTypeMap = CrossRefType.reduce<Record<string, string>>((acc, item) => {
  acc[item.id] = item.name;
  return acc;
}, {});

const formatAuthorisedOn = (record: {
  authorised_yr?: number | null;
  authorised_mn?: number | null;
  authorised_dy?: number | null;
}) => {
  const year = record.authorised_yr;
  const month = record.authorised_mn;
  const day = record.authorised_dy;

  if (!year && !month && !day) {
    return '';
  }

  return [day, month, year].filter((value) => value != null && value !== '').join('/');
};

const HtmlValue = ({ value }: { value?: string | null }) => {
  if (!value) {
    return null;
  }

  return <span dangerouslySetInnerHTML={{ __html: value }} />;
};

const CrossReferenceShowTitle = () => {
  const record = useRecordContext<{ id?: string | number }>();
  return record?.id != null ? `Related name #${record.id}` : 'Related name';
};

const CrossReferenceShowActions = () => {
  const record = useRecordContext<{ id?: string | number }>();

  return (
    <RecordPageActions
      resource="cross_references"
      listTo="/cross_references"
      editTo={record?.id != null ? `/cross_references/${record.id}` : null}
    />
  );
};

const CrossReferenceShowPage = () => (
  <Show resource="cross_references" title={<CrossReferenceShowTitle />} actions={<CrossReferenceShowActions />}>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="grid gap-6 rounded-2xl border border-border bg-card p-6">
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
          <RecordField source="authorised_by" label="Authorised by" />
          <RecordField
            label="Authorised on"
            render={(record: {
              authorised_yr?: number | null;
              authorised_mn?: number | null;
              authorised_dy?: number | null;
            }) => formatAuthorisedOn(record)}
          />
          <RecordField
            source="reference_comments"
            label="Comments"
            className="md:col-span-2 xl:col-span-3"
          />
          <RecordField source="notes" label="Notes" className="xl:col-span-3" />
        </div>
      </div>
      <div className="xl:sticky xl:top-6 xl:self-start">
        <HistoryInfoBox />
      </div>
    </div>
  </Show>
);

export default CrossReferenceShowPage;
