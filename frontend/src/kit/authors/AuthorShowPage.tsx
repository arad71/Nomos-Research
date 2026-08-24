import * as React from 'react';
// import { useRecordContext } from 'ra-core';
import { useListContext, useRecordContext } from 'ra-core';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/admin/data-table';
import { Badge } from '@/components/ui/badge';
import { RecordField } from '@/components/admin/record-field';
import { ReferenceField } from '@/components/admin/reference-field';
import { ReferenceManyField } from '@/components/admin/reference-many-field';
import { Show } from '@/components/admin/show';
import { formatDateOnly } from '../shared/dateOnlyDateTime';
import AuthorType from '../shared/choices/AuthorType';
import HistoryInfoBox from '../shared/HistoryInfoBox';
import RecordActionButtons from '../shared/RecordActionButtons';
import RecordPageActions from '../shared/RecordPageActions';

const CITATION_PER_PAGE_OPTIONS = [15, 25, 50, 100] as const;

const CitationPagination = () => {
  const {
    page = 1,
    setPage,
    perPage = 25,
    setPerPage,
    total = 0,
    isPending,
  } = useListContext();

  const totalPages = Math.max(Math.ceil(total / perPage), 1);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label
            htmlFor="citations-per-page"
            className="text-sm text-muted-foreground"
          >
            Rows
          </label>

          <select
            id="citations-per-page"
            value={perPage}
            onChange={(event) => {
              setPerPage?.(Number(event.target.value));
              setPage?.(1);
            }}
            className="h-10 rounded-xl border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
          >
            {CITATION_PER_PAGE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={page <= 1 || isPending}
            onClick={() => setPage?.(page - 1)}
          >
            Previous
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={page >= totalPages || isPending}
            onClick={() => setPage?.(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

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

const CitationActionButtons = () => {
  const record = useRecordContext<{ id?: string | number }>();

  return (
    <RecordActionButtons
      resource="citations"
      showTo={record?.id != null ? `/citations/${record.id}/show` : undefined}
      editTo={record?.id != null ? `/citations/${record.id}` : undefined}
    />
  );
};

const AuthorShowTitle = () => {
  const record = useRecordContext<{ abbreviation?: string; display_name?: string; deleted?: boolean | null }>();
  const title = record?.display_name || record?.abbreviation || 'Author';
  return (
    <span className="inline-flex items-center gap-2">
      <span>{title}</span>
      {record?.deleted ? <Badge variant="destructive">Deleted</Badge> : null}
    </span>
  );
};

const AuthorShowActions = () => {
  const record = useRecordContext<{ id?: string | number }>();

  return (
    <RecordPageActions
      resource="authors"
      listTo="/authors"
      editTo={record?.id != null ? `/authors/${record.id}` : null}
      restoreable
      showDelete={false}
    />
  );
};

const AuthorShowPage = () => (
  <Show resource="authors" title={<AuthorShowTitle />} actions={<AuthorShowActions />}>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="grid min-w-0 gap-6">
        <div className="grid gap-6 rounded-2xl border border-border bg-card p-6 md:grid-cols-2 xl:grid-cols-4">
          <RecordField source="first_names" />
          <RecordField source="surname" />
          <RecordField source="initials" />
          <RecordField source="abbreviation" />
          <RecordField source="discipline" />
          <RecordField
            source="effective_from"
            label="Effective from"
            render={(record: { effective_from?: string | null }) => formatDateOnly(record.effective_from)}
          />
          <RecordField
            source="effective_to"
            label="Effective to"
            render={(record: { effective_to?: string | null }) => formatDateOnly(record.effective_to)}
          />
          <RecordField source="orc_id" label="ORC ID" className="md:col-span-2" />
        </div>
        <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
          <div className="space-y-1">
            <h3 className="text-base font-semibold tracking-tight">Citations</h3>
            <p className="text-sm text-muted-foreground">
              Taxon-name citation rows that use this author.
            </p>
          </div>
          <ReferenceManyField
            reference="citations"
            target="author_id"
            sort={{ field: 'author_order', order: 'ASC' }}
            perPage={25}
            pagination={<CitationPagination />}
            empty={
              <div className="rounded-md border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                No citations linked to this author yet.
              </div>
            }
          >
            <DataTable rowClick={false} bulkActionButtons={false}>
              <DataTable.Col label="Taxon name">
                <ReferenceField source="taxon_name_id" reference="taxon_names" link="show">
                  <RecordField
                    label=""
                    render={(record: { formatted_scientific_name?: string | null }) => (
                      <HtmlValue value={record.formatted_scientific_name} />
                    )}
                  />
                </ReferenceField>
              </DataTable.Col>
              <DataTable.Col
                source="author_type"
                label="Author type"
                render={(record: { author_type?: string | null }) =>
                  record.author_type ? authorTypeMap[record.author_type] ?? record.author_type : ''
                }
              />
              <DataTable.Col source="author_order" label="Order" />
              <DataTable.Col label="Actions">
                <CitationActionButtons />
              </DataTable.Col>
            </DataTable>
          </ReferenceManyField>
        </section>
      </div>
      <div className="xl:sticky xl:top-6 xl:self-start">
        <HistoryInfoBox />
      </div>
    </div>
  </Show>
);

export default AuthorShowPage;
