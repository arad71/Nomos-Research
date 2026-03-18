import * as React from 'react';
import { useGetOne, useRecordContext } from 'ra-core';
import { Badge } from '@/components/ui/badge';

type TaxonNameTitleRecord = {
  scientific_name?: string | null;
  formatted_scientific_name?: string | null;
  is_current?: boolean | null;
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

  return (
    <span className="inline-flex flex-col gap-1">
      <span className="inline-flex items-center gap-2">
        <span dangerouslySetInnerHTML={{ __html: title }} />
        {record.is_current ? <Badge>Current</Badge> : null}
      </span>
      {rankRecord?.rank_name ? (
        <span className="text-base font-normal text-foreground">{rankRecord.rank_name}</span>
      ) : null}
    </span>
  );
};

export default TaxonNameTitle;
