import * as React from 'react';
import { useGetOne, useRecordContext } from 'ra-core';
import { Badge } from '@/components/ui/badge';

type TaxonNameTitleRecord = {
  id?: string | number | null;
  taxon_name_id?: string | number | null;
  legacy_id?: string | number | null;
  scientific_name?: string | null;
  formatted_scientific_name?: string | null;
  is_current?: boolean | null;
  deleted?: boolean | null;
  rank_id?: string | number | null;
};

const TaxonNameTitle = ({ fallback }: { fallback: string }) => {
  const record = useRecordContext<TaxonNameTitleRecord>();
  const rankId = record?.rank_id;
  const { data: rankRecord } = useGetOne(
    'taxon_ranks',
    { id: rankId ?? '' },
    { enabled: rankId != null }
  );

  if (!record) {
    return fallback;
  }

  const title = record.formatted_scientific_name || record.scientific_name || fallback;
  const nomosId = record.taxon_name_id ?? record.id;

  return (
    <span className="inline-flex flex-col gap-1">
      {rankRecord?.rank_name ? (
        <span className="text-base font-normal text-foreground">{rankRecord.rank_name}</span>
      ) : null}
      <span className="inline-flex items-center gap-2">
        <span>
          <span dangerouslySetInnerHTML={{ __html: title }} />
        </span>
        {record.is_current ? <Badge>Current</Badge> : null}
        {record.deleted ? <Badge variant="destructive">Deleted</Badge> : null}
      </span>
      {nomosId != null ? (
        <span className="inline-flex items-baseline gap-0">
          <span className="text-sm font-semibold text-foreground">NomosID</span>
          <span className="text-sm font-normal text-foreground">{nomosId}</span>
        </span>
      ) : null}
    </span>
  );
};

export default TaxonNameTitle;
