import * as React from 'react';
import { useRecordContext } from 'ra-core';
import { RecordField } from '@/components/admin/record-field';
import { ReferenceField } from '@/components/admin/reference-field';
import { Show } from '@/components/admin/show';
import HistoryInfoBox from '../shared/HistoryInfoBox';
import RecordPageActions from '../shared/RecordPageActions';
import TaxonRankTitle from './TaxonRankTitle';

const renderBoolean = (value?: boolean | null) => {
  if (value === null || value === undefined) {
    return '';
  }
  return value ? 'Yes' : 'No';
};

const TaxonRankShowTitle = () => <TaxonRankTitle fallback="Taxon rank" />;

const TaxonRankShowActions = () => {
  const record = useRecordContext<{ id?: string | number }>();

  return (
    <RecordPageActions
      resource="taxon_ranks"
      listTo="/taxon_ranks"
      editTo={record?.id != null ? `/taxon_ranks/${record.id}` : null}
      showDelete={false}
    />
  );
};

const TaxonRankShowPage = () => (
  <Show resource="taxon_ranks" title={<TaxonRankShowTitle />} actions={<TaxonRankShowActions />}>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="grid gap-6 rounded-2xl border border-border bg-card p-6 md:grid-cols-2">
        <RecordField label="Kingdom" source="kingdom_id">
          <ReferenceField source="kingdom_id" reference="kingdoms">
            <RecordField source="kingdom_name" label="" />
          </ReferenceField>
        </RecordField>
        <RecordField source="rank_name" label="Rank name" />
        <RecordField source="rank_abbrev" label="Rank abbreviation" />
        <RecordField label="Direct parent rank" source="direct_parent_rank_id">
          <ReferenceField source="direct_parent_rank_id" reference="taxon_ranks">
            <RecordField source="rank_name" label="" />
          </ReferenceField>
        </RecordField>
        <RecordField label="Req. parent rank" source="required_parent_rank_id">
          <ReferenceField source="required_parent_rank_id" reference="taxon_ranks">
            <RecordField source="rank_name" label="" />
          </ReferenceField>
        </RecordField>
        <RecordField
          label="Uninomial"
          render={(record: { uninomial?: boolean | null }) => renderBoolean(record.uninomial)}
        />
      </div>
      <div className="xl:sticky xl:top-6 xl:self-start">
        <HistoryInfoBox />
      </div>
    </div>
  </Show>
);

export default TaxonRankShowPage;
