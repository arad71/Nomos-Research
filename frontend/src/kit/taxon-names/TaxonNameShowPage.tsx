import * as React from 'react';
import { useRecordContext } from 'ra-core';
import { useGetList } from 'react-admin';
import { Link } from 'react-router-dom';
import { Show } from '@/components/admin/show';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import TaxonNameRelatedSections from './TaxonNameRelatedSections';
import HistoryInfoBox from '../shared/HistoryInfoBox';
import { InfragenericNamesGrid } from './infrageneric/InfragenericNamesGrid';
import TaxonNameTitle from './TaxonNameTitle';
import TaxonNameSidebarCards from './TaxonNameSidebarCards';
import RecordPageActions from '../shared/RecordPageActions';

const TaxonNameShowTitle = () => <TaxonNameTitle fallback="Taxon name" />;

const TaxonNameShowActions = () => {
  const record = useRecordContext<{ id?: string | number }>();

  return (
    <RecordPageActions
      resource="taxon_names"
      listTo="/taxon_names"
      editTo={record?.id != null ? `/taxon_names/${record.id}` : null}
      restoreable
      showDelete={false}
    />
  );
};

const TaxonNameShowPage = () => (
  <Show resource="taxon_names" title={<TaxonNameShowTitle />} actions={<TaxonNameShowActions />}>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="grid min-w-0 gap-6">
        <TaxonNameRelatedSections sections={['authors', 'publication', 'vernaculars', 'relatedNames', 'conservationCodes']} />
        <TaxonNameHierarchySection />
        <TaxonNameNameFormatsSection />
      </div>
      <div className="grid gap-6 xl:sticky xl:top-6 xl:self-start">
        <HistoryInfoBox />
        <TaxonNameSidebarCards />
      </div>
    </div>
  </Show>
);

type HierarchySectionRecord = {
  id: string | number;
  taxon_name_id?: string | number;
  rank_name?: string | null;
  path?: string[] | string | null;
  taxon_name?: {
    formatted_scientific_name?: string | null;
    all_vernaculars?: string | null;
    is_current?: boolean | null;
  } | null;
};

const HtmlValue = ({ value }: { value?: string | null }) => {
  if (!value) return null;
  return <span dangerouslySetInnerHTML={{ __html: value }} />;
};

const normalisePathSegments = (value: string[] | string | null | undefined) => {
  if (Array.isArray(value)) {
    return value.map(String);
  }

  if (typeof value === 'string') {
    return value
      .split('.')
      .map((segment) => segment.trim())
      .filter(Boolean);
  }

  return [];
};

const TaxonNameHierarchySection = () => {
  const record = useRecordContext<{ id?: string | number; path?: string[] | string | null }>();
  const filter = React.useMemo(() => {
    if (!record?.path) return null;
    return {
      path__in_tree: record.path,
      taxon_name___scientific_name__gt: '',
    };
  }, [record]);

  const { data = [], isLoading } = useGetList<HierarchySectionRecord>(
    'hierarchies',
    {
      pagination: { page: 1, perPage: 100 },
      sort: { field: 'path', order: 'ASC' },
      filter: filter ?? {},
    },
    {
      enabled: Boolean(filter),
    },
  );

  if (!record?.id || !filter) {
    return null;
  }

  return (
    <section className="min-w-0 rounded-2xl border border-border bg-card p-6">
      <div className="space-y-1">
        <h3 className="text-base font-semibold tracking-tight">Taxon Name - Hierarchy</h3>
        <p className="text-sm text-muted-foreground">
          Full hierarchy for this taxon name, shown as a parent-child tree.
        </p>
      </div>
      <div className="mt-4">
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading hierarchy...</div>
        ) : data.length ? (
          <div className="space-y-2">
            {data.map((row) => {
              const depth = Math.max(normalisePathSegments(row.path).length - 1, 0);
              const isCurrent = row.taxon_name_id === record.id;

              return (
                <div
                  key={row.id}
                  className={cn(
                    'rounded-xl border border-transparent px-3 py-3 transition-colors',
                    isCurrent ? 'border-primary/30 bg-muted/40' : 'hover:bg-muted/20',
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="flex shrink-0 items-start"
                      style={{ paddingLeft: `${Math.max(depth - 1, 0) * 1.25}rem` }}
                    >
                      {depth > 0 ? (
                        <div className="mt-4 h-4 w-4 rounded-bl-sm border-b border-l border-border" />
                      ) : (
                        <div className="w-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="min-w-24 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          {row.rank_name || 'Unranked'}
                        </div>
                        <Link
                          to={`/taxon_names/${row.taxon_name_id}/show`}
                          className="min-w-0 text-sm text-foreground hover:underline"
                        >
                          <HtmlValue value={row.taxon_name?.formatted_scientific_name} />
                        </Link>
                        {isCurrent ? <Badge variant="secondary">Current row</Badge> : null}
                        {row.taxon_name?.is_current ? <Badge variant="outline">Current name</Badge> : null}
                      </div>
                      {row.taxon_name?.all_vernaculars ? (
                        <div className="mt-1 text-sm text-muted-foreground">
                          {row.taxon_name.all_vernaculars}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No hierarchy available.</div>
        )}
      </div>
    </section>
  );
};

const TaxonNameNameFormatsSection = () => {
  const record = useRecordContext<{ id?: string | number }>();

  if (record?.id == null) {
    return null;
  }

  return (
    <section className="min-w-0 rounded-2xl border border-border bg-card p-6">
      <div className="space-y-1">
        <h3 className="text-base font-semibold tracking-tight">Taxon Name - Name formats</h3>
      </div>
      <div className="mt-4">
        <InfragenericNamesGrid id={record.id} />
      </div>
    </section>
  );
};

export default TaxonNameShowPage;
