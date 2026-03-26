import * as React from 'react';
import { useRecordContext } from 'ra-core';
import { Badge } from '@/components/ui/badge';
import { RecordField } from '@/components/admin/record-field';
import { ReferenceField } from '@/components/admin/reference-field';
import { Show } from '@/components/admin/show';
import LanguageType from '../shared/choices/LanguageType';
import HistoryInfoBox from '../shared/HistoryInfoBox';
import RecordPageActions from '../shared/RecordPageActions';

const languageMap = LanguageType.reduce<Record<string, string>>((acc, item) => {
  acc[item.id] = item.name;
  return acc;
}, {});

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

const VernacularShowTitle = () => {
  const record = useRecordContext<{ vernacular_name?: string; deleted?: boolean | null }>();
  const title = record?.vernacular_name || 'Vernacular';
  return (
    <span className="inline-flex items-center gap-2">
      <span>{title}</span>
      {record?.deleted ? <Badge variant="destructive">Deleted</Badge> : null}
    </span>
  );
};

const VernacularShowActions = () => {
  const record = useRecordContext<{ id?: string | number }>();

  return (
    <RecordPageActions
      resource="vernaculars"
      listTo="/vernaculars"
      editTo={record?.id != null ? `/vernaculars/${record.id}` : null}
      restoreable
    />
  );
};

const VernacularShowPage = () => (
  <Show resource="vernaculars" title={<VernacularShowTitle />} actions={<VernacularShowActions />}>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="grid gap-6 rounded-2xl border border-border bg-card p-6 md:grid-cols-2">
        <RecordField source="vernacular_name" label="Vernacular" />
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
        <RecordField source="source" label="Source" className="md:col-span-2" />
        <RecordField
          source="language"
          label="Language"
          render={(record: { language?: string | null }) =>
            record.language ? languageMap[record.language] ?? record.language : ''
          }
        />
        <RecordField
          label="Preferred language"
          render={(record: { lang_pref?: boolean | null }) => renderBoolean(record.lang_pref)}
        />
        <RecordField source="sort_order" label="Sort order" />
        <RecordField
          label="Preferred"
          render={(record: { preferred?: boolean | null }) => renderBoolean(record.preferred)}
        />
      </div>
      <div className="xl:sticky xl:top-6 xl:self-start">
        <HistoryInfoBox />
      </div>
    </div>
  </Show>
);

export default VernacularShowPage;
