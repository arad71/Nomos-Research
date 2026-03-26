import * as React from 'react';
import { useRecordContext } from 'ra-core';
import { Badge } from '@/components/ui/badge';
import { RecordField } from '@/components/admin/record-field';
import { ReferenceArrayField } from '@/components/admin/reference-array-field';
import { ReferenceField } from '@/components/admin/reference-field';
import { Show } from '@/components/admin/show';
import { SingleFieldList } from '@/components/admin/single-field-list';
import HistoryInfoBox from './shared/HistoryInfoBox';
import RecordPageActions from './shared/RecordPageActions';
import { normalizeDoi, sanitizeExternalUrl } from './shared/publicationDoi';

const HtmlValue = ({ value }: { value?: string | null }) => {
  if (!value) {
    return null;
  }

  return <span dangerouslySetInnerHTML={{ __html: value }} />;
};

const renderBoolean = (value?: boolean | null) => {
  if (value === null || value === undefined) {
    return '';
  }
  return value ? 'Yes' : 'No';
};

const PublicationShowTitle = () => {
  const record = useRecordContext<{ display_title?: string; abbreviated_title?: string; deleted?: boolean | null }>();
  const title = record?.display_title || record?.abbreviated_title || 'Publication';
  return (
    <span className="inline-flex items-center gap-2">
      <span>{title}</span>
      {record?.deleted ? <Badge variant="destructive">Deleted</Badge> : null}
    </span>
  );
};

const PublicationShowActions = () => {
  const record = useRecordContext<{ id?: string | number }>();

  return (
    <RecordPageActions
      resource="publications"
      listTo="/publications"
      editTo={record?.id != null ? `/publications/${record.id}` : null}
      restoreable
    />
  );
};

const DoiLink = ({ value }: { value?: string | null }) => {
  const normalized = normalizeDoi(value);

  if (!normalized) {
    return null;
  }

  return (
    <a
      href={normalized}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline underline-offset-4"
    >
      {normalized}
    </a>
  );
};

const ExternalUrlLink = ({ value }: { value?: string | null }) => {
  const sanitized = sanitizeExternalUrl(value);

  if (!sanitized) {
    return null;
  }

  return (
    <a
      href={sanitized}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline underline-offset-4"
    >
      {sanitized}
    </a>
  );
};

const PublicationShowPage = () => (
  <Show resource="publications" title={<PublicationShowTitle />} actions={<PublicationShowActions />}>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="grid gap-6 rounded-2xl border border-border bg-card p-6">
        <div className="space-y-2">
          <RecordField
            label=""
            render={(record: { display_title?: string | null }) => (
              <HtmlValue value={record.display_title} />
            )}
          />
          <RecordField source="author_name" label="" />
        </div>

        <div className="grid gap-8">
          <section className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-semibold tracking-tight">Publication</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <RecordField source="title" label="Title" className="xl:col-span-2" />
              <RecordField
                source="abbreviated_title"
                label="Abbreviated title"
                className="xl:col-span-2"
              />
              <RecordField
                source="author_name"
                label="Publication authors"
                className="xl:col-span-4"
              />
              <RecordField source="publication_day" label="Day" />
              <RecordField source="publication_month" label="Month" />
              <RecordField source="publication_year" label="Year" />
              <RecordField
                label="Published"
                render={(record: { published?: boolean | null }) => renderBoolean(record.published)}
              />
              <RecordField
                source="doi"
                label="DOI"
                className="xl:col-span-4"
                render={(record: { doi?: string | null }) => <DoiLink value={record.doi} />}
              />
            </div>
          </section>

          <section className="mt-12 space-y-4 border-t border-border pt-12">
            <div className="space-y-1">
              <h3 className="text-base font-semibold tracking-tight">Publication metadata</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <RecordField label="Authors" className="xl:col-span-4">
                <ReferenceArrayField reference="authors" source="author_ids">
                  <SingleFieldList>
                    <RecordField source="abbreviation" label="" />
                  </SingleFieldList>
                </ReferenceArrayField>
              </RecordField>
              <RecordField source="publisher" label="Publisher" className="xl:col-span-4" />
              <RecordField label="Parent publication" source="parent_id" className="xl:col-span-4">
                <ReferenceField source="parent_id" reference="publications">
                  <RecordField source="abbreviated_title" label="" />
                </ReferenceField>
              </RecordField>
              <RecordField
                source="published_location"
                label="Published location"
                className="xl:col-span-4"
              />
              <RecordField source="volume" label="Volume" />
              <RecordField source="edition" label="Edition" />
              <RecordField source="pages" label="Pages" />
            </div>
          </section>

          <section className="mt-12 space-y-4 border-t border-border pt-12">
            <div className="space-y-1">
              <h3 className="text-base font-semibold tracking-tight">Details</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <RecordField source="legacy_id" label="Legacy ID" />
              <RecordField source="isbn" label="ISBN" />
              <RecordField source="issn" label="ISSN" />
              <RecordField source="tl2" label="TL2" />
              <RecordField
                source="bhl_url"
                label="BHL URL"
                className="xl:col-span-4"
                render={(record: { bhl_url?: string | null }) => (
                  <ExternalUrlLink value={record.bhl_url} />
                )}
              />
              <RecordField source="reference_type" label="Reference type" />
              <RecordField source="reference_author_role" label="Reference author role" />
              <RecordField label="Duplicate of" source="duplicate_of_id" className="xl:col-span-4">
                <ReferenceField source="duplicate_of_id" reference="publications">
                  <RecordField source="abbreviated_title" label="" />
                </ReferenceField>
              </RecordField>
              <RecordField source="language" label="Language" />
            </div>
          </section>

          <section className="mt-12 space-y-4 border-t border-border pt-12">
            <div className="space-y-1">
              <h3 className="text-base font-semibold tracking-tight">Notes</h3>
            </div>
            <div className="grid gap-4">
              <RecordField source="notes" label="Notes" className="xl:col-span-4" />
            </div>
          </section>
        </div>
      </div>
      <div className="xl:sticky xl:top-6 xl:self-start">
        <HistoryInfoBox />
      </div>
    </div>
  </Show>
);

export default PublicationShowPage;
