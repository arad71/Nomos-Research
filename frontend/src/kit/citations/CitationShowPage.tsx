import * as React from 'react';
import { useRecordContext } from 'ra-core';
import { Badge } from '@/components/ui/badge';
import { RecordField } from '@/components/admin/record-field';
import { ReferenceField } from '@/components/admin/reference-field';
import { Show } from '@/components/admin/show';
import AuthorType from '../../admin/Citations/AuthorType';
import HistoryInfoBox from '../shared/HistoryInfoBox';
import RecordPageActions from '../shared/RecordPageActions';

const authorTypeMap = AuthorType.reduce<Record<string, string>>((acc, item) => {
  acc[item.id] = item.name;
  return acc;
}, {});

const HtmlValue = ({ value }: { value?: string | null }) => {
  if (!value) {
    return null;
  }

  return <span dangerouslySetInnerHTML={{ __html: value }} />;
};

const CitationShowTitle = () => {
  const record = useRecordContext<{ id?: string | number; deleted?: boolean | null }>();
  const title = record?.id != null ? `Citation #${record.id}` : 'Citation';
  return (
    <span className="inline-flex items-center gap-2">
      <span>{title}</span>
      {record?.deleted ? <Badge variant="destructive">Deleted</Badge> : null}
    </span>
  );
};

const CitationShowActions = () => {
  const record = useRecordContext<{ id?: string | number }>();

  return (
    <RecordPageActions
      resource="citations"
      listTo="/citations"
      editTo={record?.id != null ? `/citations/${record.id}` : null}
      restoreable
    />
  );
};

const CitationShowPage = () => (
  <Show resource="citations" title={<CitationShowTitle />} actions={<CitationShowActions />}>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="grid gap-6 rounded-2xl border border-border bg-card p-6 md:grid-cols-2">
        <RecordField label="Taxon name" source="taxon_name_id">
          <ReferenceField source="taxon_name_id" reference="taxon_names">
            <RecordField
              label=""
              render={(record: { formatted_scientific_name?: string | null }) => (
                <HtmlValue value={record.formatted_scientific_name} />
              )}
            />
          </ReferenceField>
        </RecordField>
        <RecordField label="Author" source="author_id">
          <ReferenceField source="author_id" reference="authors">
            <RecordField source="abbreviation" label="" />
          </ReferenceField>
        </RecordField>
        <RecordField
          source="author_type"
          label="Author type"
          render={(record: { author_type?: string | null }) =>
            record.author_type ? authorTypeMap[record.author_type] ?? record.author_type : ''
          }
        />
        <RecordField source="author_order" label="Author order" />
      </div>
      <div className="xl:sticky xl:top-6 xl:self-start">
        <HistoryInfoBox />
      </div>
    </div>
  </Show>
);

export default CitationShowPage;
