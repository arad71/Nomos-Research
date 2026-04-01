import * as React from 'react';
import { useRecordContext } from 'ra-core';

type TaxonRankTitleRecord = {
  id?: string | number | null;
  taxon_rank_id?: string | number | null;
  rank_name?: string | null;
};

const TaxonRankTitle = ({ fallback }: { fallback: string }) => {
  const record = useRecordContext<TaxonRankTitleRecord>();

  if (!record) {
    return fallback;
  }

  const title = record.rank_name || fallback;
  const nomosRankId = record.taxon_rank_id ?? record.id;

  return (
    <span className="inline-flex flex-col gap-1">
      <span className="text-base font-normal text-foreground">Rank</span>
      <span>{title}</span>
      {nomosRankId != null ? (
        <span className="inline-flex items-baseline gap-0">
          <span className="text-sm font-semibold text-foreground">NomosRankID</span>
          <span className="text-sm font-normal text-foreground">{nomosRankId}</span>
        </span>
      ) : null}
    </span>
  );
};

export default TaxonRankTitle;
