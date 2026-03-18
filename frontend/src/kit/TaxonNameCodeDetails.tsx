import * as React from 'react';
import { useRecordContext } from 'ra-core';
import { Link } from 'react-router-dom';
import { DataTable } from '@/components/admin/data-table';
import { DateField } from '@/components/admin/date-field';
import { RecordField } from '@/components/admin/record-field';
import { ReferenceField } from '@/components/admin/reference-field';
import { ReferenceManyField } from '@/components/admin/reference-many-field';
import { Button } from '@/components/ui/button';

const HtmlValue = ({ value }: { value?: string | null }) => {
  if (!value) {
    return null;
  }

  return <span dangerouslySetInnerHTML={{ __html: value }} />;
};

const renderBoolean = (value?: boolean | null) => {
  if (value == null) {
    return '';
  }

  return value ? 'Yes' : 'No';
};

const AddConservationCodeButton = () => {
  const record = useRecordContext<{ id?: string | number }>();
  if (record?.id == null) {
    return null;
  }

  const source = encodeURIComponent(JSON.stringify({ taxon_name_id: record.id }));

  return (
    <Button asChild variant="outline">
      <Link to={`/conscode_taxons/create?source=${source}`}>Add conservation code</Link>
    </Button>
  );
};

const OpenConservationCodeButton = () => {
  const record = useRecordContext<{ id?: string | number }>();
  if (record?.id == null) {
    return null;
  }

  return (
    <Button asChild variant="outline" size="sm">
      <Link to={`/conscode_taxons/${record.id}/show`}>Open</Link>
    </Button>
  );
};

export const TaxonNameCodeTitle = () => {
  const record = useRecordContext<{
    formatted_scientific_name?: string | null;
    scientific_name?: string | null;
  }>();

  return record?.scientific_name || record?.formatted_scientific_name || 'Taxon name conservation codes';
};

export const TaxonNameCodeDetails = () => (
  <div className="grid gap-6 rounded-2xl border border-border bg-card p-6">
    <div className="space-y-2">
      <RecordField
        label="Taxon name"
        render={(record: { formatted_scientific_name?: string | null }) => (
          <HtmlValue value={record.formatted_scientific_name} />
        )}
      />
    </div>

    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <RecordField label="Kingdom" source="kingdom_id">
        <ReferenceField source="kingdom_id" reference="kingdoms" link="show">
          <RecordField source="kingdom_name" label="" />
        </ReferenceField>
      </RecordField>
      <RecordField label="Rank" source="taxon_rank_id">
        <ReferenceField source="taxon_rank_id" reference="taxon_ranks" link="show">
          <RecordField source="rank_name" label="" />
        </ReferenceField>
      </RecordField>
      <RecordField source="publication_status" label="Publication status" />
      <RecordField
        label="Is current"
        render={(record: { is_current?: boolean | null }) => renderBoolean(record.is_current)}
      />
      <RecordField
        label="Validated"
        render={(record: { validated?: boolean | null }) => renderBoolean(record.validated)}
      />
      <RecordField source="legacy_id" label="Legacy ID" />
    </div>

    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold tracking-tight">Conservation codes</h3>
          <p className="text-sm text-muted-foreground">
            Related conservation-code records for this taxon name.
          </p>
        </div>
        <AddConservationCodeButton />
      </div>

      <ReferenceManyField
        reference="conscode_taxons"
        target="taxon_name_id"
        perPage={100}
        sort={{ field: 'effective_from', order: 'DESC' }}
        empty={
          <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
            No conservation codes linked to this taxon name yet.
          </div>
        }
      >
        <DataTable rowClick="show">
          <DataTable.Col label="Authority">
            <ReferenceField source="conservation_code_id" reference="conservation_codes" link="show">
              <RecordField source="authorising_org" label="" />
            </ReferenceField>
          </DataTable.Col>
          <DataTable.Col label="Conservation code">
            <ReferenceField source="conservation_code_id" reference="conservation_codes" link="show">
              <RecordField source="conservation_code_value" label="" />
            </ReferenceField>
          </DataTable.Col>
          <DataTable.Col source="effective_from" label="Effective from" field={DateField} />
          <DataTable.Col source="effective_to" label="Effective to" field={DateField} />
          <DataTable.Col source="notes" label="Notes" />
          <DataTable.Col label="">
            <div className="flex justify-end">
              <OpenConservationCodeButton />
            </div>
          </DataTable.Col>
        </DataTable>
      </ReferenceManyField>
    </div>
  </div>
);
